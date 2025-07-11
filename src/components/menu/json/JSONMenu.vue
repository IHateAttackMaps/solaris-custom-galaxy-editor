<template>
    <div class="menu-page">
        <menu-title :title="'JSON'">
            <button class="btn btn-sm btn-outline-primary title-btn" @click="clearInput()">
                <i class="fas fa-undo"></i>
                Clear
            </button>
        </menu-title>
        <div class="row">
            <div class="col">
                <button class="btn btn-success" @click="loadFromJSON()">
                    <i class="fas fa-file-export"></i>
                    Load from JSON
                </button>
            </div>
            <div class="col">
                <button class="btn btn-success" @click="generateJSON()">
                    <i class="fas fa-file-import"></i>
                    Generate JSON
                </button>
            </div>
        </div>
        <div class="text-danger" v-if="errors.length">
            <p>
                Please correct the following error(s):
            </p>
            <ul>
                <li v-for="error in errors" :key="error">{{ error }}</li>
            </ul>
        </div>
        <div class="text-warning" v-if="warnings.length">
            <p>
                Warning(s):
            </p>
            <ul>
                <li v-for="warning in warnings" v-bind:key="warning">{{ warning }}</li>
            </ul>
        </div>
        <div>
            <textarea class="form-control" id="jsonArea" placeholder="Enter the galaxy JSON here."
                v-model="input"></textarea>
        </div>
    </div>
</template>

<script lang="ts">
import type { Star } from '@/scripts/types/Star';
import MenuTitle from '../MenuTitle.vue';
import type { Carrier } from '@/scripts/types/Carrier';
import type { Player, PlayerTechnologyLevels } from '@/scripts/types/Player';
import type { Team } from '@/scripts/types/Team';
import type { Galaxy } from '@/scripts/types/Galaxy';
import { CarrierWaypointActionTypes, type CarrierWaypoint } from '@/scripts/types/CarrierWaypoint';
import { useSpecialistsStore } from '@/stores/specialists';
import helper from '@/scripts/helper';
import { useGalaxyStore } from '@/stores/galaxy';
import editor from '@/scripts/editor';
import storage from '@/scripts/storage';
import { useMenuStateStore } from '@/stores/menuState';

export const JSONStructures = ['editor_this', 'solaris_game', 'editor_kurtzmusch', 'star_array', 'location_array'] as const;
export type JSONStructure = typeof JSONStructures[number];

export default {
    components: {
        'menu-title': MenuTitle
    },
    data() {
        return {
            input: '',
            json: {} as any,
            errors: [] as Array<string>,
            warnings: [] as Array<string>
        }
    },
    methods: {
        clearInput() {
            this.input = '';
            this.errors = [];
            this.warnings = [];
            this.json = {};
        },
        loadFromJSON() {
            if (!useGalaxyStore().$state.galaxyIsReady) return;
            this.errors = [];
            this.warnings = [];
            try {
                if (this.input == null || this.input.length === 0) {
                    this.errors.push(`The provided input is empty. To generate an empty galaxy, use '{}' instead.`);
                    return;
                }

                this.json = JSON.parse(this.input);

                let stars: Star[] = [];
                let carriers: Carrier[] = [];
                let players: Player[] = [];
                let teams: Team[] = [];

                // Empty JSON is turned into an empty galaxy.
                if (!Object.keys(this.json).length) {
                    this.setGalaxy(stars, carriers, players, teams);
                    return;
                }

                /* 
                Detected JSON structure. When adding support for a new structure,
                please add it here as well in the following format:

                '<structure name>':
                stars: json.<path to stars field>, carriers: json.<path to carriers field>, players: json.<path to players field>, teams: json.<path to teams field>
                <comments about this structure>

                * if the structure does not contain a certain field, use [] instead of json.<path to field>.
                ** if the structure contains only partial information of certain objects, use <field name>.<provided property name>: json.<path to property array>,
                e.g. stars.location: json
                Currently supported: 

                'editor_this':
                stars: json.stars, carriers: json.carriers, players: json.players, teams: json.teams
                Current structure in use by this editor. Directly represents an object of Galaxy type (see @/scripts/types/Galaxy.ts).
                Uses the 'id' property for mapObject IDs and the 'playerId' property for the object owner's (player's) ID. 

                'solaris_game':
                stars: json.galaxy.stars, carriers: json.galaxy.carriers, players: json.galaxy.players, teams: json.galaxy.teams
                The structure used by Solaris (see https://github.com/solaris-games/solaris/blob/458dd32d162c1d8182a48af30eb61b458dadf52e/server/services/types/Game.ts).
                Uses '_id' and 'ownedByPlayerId' instead of 'id' and 'playerId'.

                'editor_kurtzmuch':
                stars: json.stars, carriers: [], players: [], teams: []
                The structure used by Kurtzmuch's galaxy editor (see https://github.com/Kurtzmusch/solaris-galaxy-editor/blob/master/src/editor.js).
                Only contains the 'stars' field.
                Uses 'id' and 'playerId', same as this editor.
                Since this structure does not contain the 'players' field, we should automatically add players for every 
                home star that has a 'playerId' set.

                'star_array':
                stars: json, carriers: [], players: [], teams: []
                A simple structure that only contains the 'stars' field.
                Uses 'id' and may or may not contain the 'playerId' property. If it does contain said property, we should
                automatically add players for every home star that has a 'playerId' set.

                'location_array':
                stars.location: json, carriers: []. players: [], teams: []
                An array of points. Stars must be generated by this editor. May be useful for users that want to test custom generation algorithms.

                */

                let jsonStructure: JSONStructure;

                if (this.json.stars) { // JSON structure is either 'editor_this' or 'editor_kurtzmuch'.

                    jsonStructure = 'editor_this';
                    if (!Array.isArray(this.json.stars)) {
                        this.errors.push(`The 'stars' field must be an array.`);
                        return;
                    }
                    for (const star of this.json.stars) {
                        const parsedStar = this.parseStar(star, jsonStructure);
                        if (parsedStar != null) stars.push(parsedStar);
                    }

                    if (this.json.carriers) {
                        for (const carrier of this.json.carriers) {
                            const parsedCarrier = this.parseCarrier(carrier, jsonStructure);
                            if (parsedCarrier != null) carriers.push(parsedCarrier);
                        }
                    }

                    if (this.json.players) {
                        jsonStructure = 'editor_this';
                        let allPlayersVisualsProvided = true;
                        for (const player of this.json.players) {
                            const parsedPlayer = this.parsePlayer(player, jsonStructure);
                            if (parsedPlayer != null) {
                                if (parsedPlayer.colour == null || parsedPlayer.shape == null) allPlayersVisualsProvided = false;
                                players.push(parsedPlayer);
                            }
                        }

                        const combos = helper.getRandomUnusedCombos(players.length);
                        for (const parsedPlayer of players) {
                            const index = players.indexOf(parsedPlayer);
                            if (parsedPlayer.alias == null) {
                                parsedPlayer.alias = `Player ${index + 1}`;
                            }
                            if (!allPlayersVisualsProvided) {
                                parsedPlayer.colour = combos[index].colour;
                                parsedPlayer.shape = combos[index].shape;
                            }
                        }

                        if (this.json.teams) {
                            for (const team of this.json.teams) {
                                const parsedTeam = this.parseTeam(team, jsonStructure);
                                if (parsedTeam != null) teams.push(parsedTeam);
                            }
                        }
                    } else {
                        jsonStructure = 'editor_kurtzmusch';
                        const homeStars = stars.filter((s) => s.homeStar).filter((s) => s.playerId != null); // Home stars with assigned playerIDs
                        const combos = helper.getRandomUnusedCombos(homeStars.length);

                        for (const parsedStar of homeStars) {
                            const index = homeStars.indexOf(parsedStar);
                            const player = {
                                id: (index + 1).toString(),
                                homeStarId: parsedStar.id,
                                alias: `Player ${index + 1}`,
                                colour: combos[index].colour,
                                shape: combos[index].shape,
                                technologies: {
                                    scanning: 1,
                                    hyperspace: 1,
                                    terraforming: 1,
                                    experimentation: 1,
                                    weapons: 1,
                                    banking: 1,
                                    manufacturing: 1,
                                    specialists: 1
                                },
                                credits: 1000,
                                creditsSpecialists: 10
                            };
                            players.push(player);
                        }
                    }

                } else if (this.json.galaxy && this.json.galaxy.stars && Array.isArray(this.json.galaxy.stars)) { // JSON structure is 'solaris_game'

                    jsonStructure = 'solaris_game';
                    for (const star of this.json.galaxy.stars) {
                        const parsedStar = this.parseStar(star, jsonStructure);
                        if (parsedStar != null) stars.push(parsedStar);
                    }

                    for (const carrier of this.json.galaxy.carriers) {
                        const parsedCarrier = this.parseCarrier(carrier, jsonStructure);
                        if (parsedCarrier != null) carriers.push(parsedCarrier);
                    }

                    let allPlayersVisualsProvided = true;
                    for (const player of this.json.galaxy.players) {
                        const parsedPlayer = this.parsePlayer(player, jsonStructure);
                        if (parsedPlayer != null) {
                            if (parsedPlayer.colour == null || parsedPlayer.shape == null) allPlayersVisualsProvided = false;
                            players.push(parsedPlayer);
                        }
                    }

                    // In theory, this should never do anything here.
                    const combos = helper.getRandomUnusedCombos(players.length);
                    for (const parsedPlayer of players) {
                        const index = players.indexOf(parsedPlayer);
                        if (parsedPlayer.alias == null) {
                            parsedPlayer.alias = `Player ${index + 1}`;
                        }
                        if (!allPlayersVisualsProvided) {
                            parsedPlayer.colour = combos[index].colour;
                            parsedPlayer.shape = combos[index].shape;
                        }
                    }

                    if (this.json.galaxy.teams) {
                        for (const team of this.json.galaxy.teams) {
                            const parsedTeam = this.parseTeam(team, jsonStructure);
                            if (parsedTeam != null) teams.push(parsedTeam);
                        }
                    }

                } else if (this.json) { // JSON structure is either 'star_array' or 'location_array'

                    if (!Array.isArray(this.json)) {
                        this.errors.push(`The provided JSON does not match any known structure.`);
                        return;
                    }

                    if (this.json[0].homeStar != null) { // Assume 'star_array' if first entry seems to be a star

                        jsonStructure = 'star_array';
                        for (const star of this.json) {
                            const parsedStar = this.parseStar(star, jsonStructure);
                            if (parsedStar != null) stars.push(parsedStar);
                        }

                        const homeStars = stars.filter((s) => s.homeStar).filter((s) => s.playerId != null); // Home stars with assigned playerIDs
                        const combos = helper.getRandomUnusedCombos(homeStars.length);

                        for (const parsedStar of homeStars) {
                            const index = homeStars.indexOf(parsedStar);
                            const player = {
                                id: (index + 1).toString(),
                                homeStarId: parsedStar.id,
                                alias: `Player ${index + 1}`,
                                colour: combos[index].colour,
                                shape: combos[index].shape,
                                technologies: {
                                    scanning: 1,
                                    hyperspace: 1,
                                    terraforming: 1,
                                    experimentation: 1,
                                    weapons: 1,
                                    banking: 1,
                                    manufacturing: 1,
                                    specialists: 1
                                }
                            } as Player;
                            players.push(player);
                        }

                    } else {
                        jsonStructure = 'location_array';
                        for (const location of this.json) {
                            const index = this.json.indexOf(location);
                            const x = location?.x == null ? location[0] : location.x;
                            const y = location?.y == null ? location[1] : location.y;
                            if (x == null || y == null) {
                                continue;
                            }

                            const generatedStar = helper.generateNewStar();
                            generatedStar.id = (index + 1).toString();
                            generatedStar.location = {
                                x: x,
                                y: y
                            };

                            stars.push(generatedStar);
                        }

                    }

                }

                carriers = carriers.filter(carrier => {
                    let star;
                    let sourceLoc;
                    let destinationLoc;

                    if (carrier.orbiting) {
                        star = stars.find((s) => s.id === carrier.orbiting);
                        if (star == null) {
                            this.errors.push(`Could not add carrier ${JSON.stringify(carrier)}: orbiting non-existent star.`);
                            return false;
                        }

                        carrier.location = star.location;

                        if (carrier.waypoints.length !== 0) {
                            carrier.progress = 0;
                        }
                    } else {
                        if (carrier.waypoints.length === 0) {
                            this.errors.push(`Could not add carrier ${JSON.stringify(carrier)}: in transit carrier has no waypoints.`);
                            return false;
                        }

                        sourceLoc = stars.find((s) => s.id === carrier?.waypoints[0]?.source)?.location;
                        destinationLoc = stars.find((s) => s.id === carrier?.waypoints[0]?.destination)?.location;
                        if (sourceLoc == null || destinationLoc == null) {
                            this.warnings.push(`Could not add carrier ${JSON.stringify(carrier)}: flying from and/or to non-existent star.`);
                            return false;
                        }

                        if (carrier.location != null) {
                            carrier.progress = helper.locationToProgressAlongPath(carrier.location, sourceLoc, destinationLoc);
                        } else {
                            if (carrier.progress == null) {
                                this.errors.push(`Could not add carrier ${JSON.stringify(carrier)}: could not calculate location (progress value is null).`);
                                return false;
                            }
                            carrier.location = helper.progressAlongPathToLocation(carrier.progress, sourceLoc, destinationLoc);
                        }

                        if (carrier.progress >= 1 || carrier.progress <= 0) { // If it is 0 or 1, the carrier is not in transit - it has landed and should be orbiting.
                            this.warnings.push(`Could not add carrier ${JSON.stringify(carrier)}: in transit carrier progress value must be between 0 and 1 (exclusive).`);
                            return false;
                        }
                    }

                    return true;
                });

                // This only prevents a non-empty JSON from being parsed as an empty galaxy.
                if (stars.length + carriers.length + players.length + teams.length === 0) {
                    this.errors.push(`The provided JSON does not match any known structure.`);
                    return;
                }

                if (teams.length !== 0) {
                    // Team game validation
                    const totalPlayersInTeams = teams.reduce((partialSum, t) => partialSum += t.players.length, 0);
                    if (totalPlayersInTeams < players.length) {
                        this.errors.push(`In a team game, all players must be in a team.`);
                        return;
                    }

                    const allPlayerIds = teams.flatMap(t => t.players);
                    if (new Set(allPlayerIds).size !== allPlayerIds.length) {
                        this.errors.push(`A player must be in only one team.`);
                    }
                }

                // Check if the galaxy has split-NR stars
                let isSplitResources = false;
                if (
                    stars.find((s) => s.naturalResources.economy != s.naturalResources.industry || s.naturalResources.economy != s.naturalResources.science) != null
                ) isSplitResources = true;
                useGalaxyStore().setIsSplitNaturalResources(isSplitResources);

                if (this.errors.length !== 0) return;

                // Simplify IDs if applicable
                if (storage.getSettings().json.simplifyIds === 'enabled') {
                    const simplifiedGalaxy = this.simplifyIds(stars, carriers, players, teams);
                    stars = simplifiedGalaxy.stars;
                    carriers = simplifiedGalaxy.carriers;
                    players = simplifiedGalaxy.players;
                    if (simplifiedGalaxy.teams != null) teams = simplifiedGalaxy.teams;
                }

                if (storage.getSettings().json.playerIdSource === 'name-when-possible') {
                    const updatedGalaxy = this.changeIdsToNames(stars, carriers, players, teams);
                    stars = updatedGalaxy.stars;
                    carriers = updatedGalaxy.carriers;
                    players = updatedGalaxy.players;
                    if (updatedGalaxy.teams != null) teams = updatedGalaxy.teams;
                }

                this.setGalaxy(stars, carriers, players, teams);

            } catch (e) {
                this.errors.push(`The provided input could not be parsed as valid JSON.`);
                console.log(e);
            }
        },
        generateJSON() {
            if (!useGalaxyStore().$state.galaxyIsReady) return;
            this.errors = [];
            this.warnings = [];

            // Output JSON structure is 'editor_this'.
            this.input = JSON.stringify(useGalaxyStore().$state.galaxy);
        },
        parseStar(star: any, jsonStructure: JSONStructure) {
            let parsedStar = {} as Star;

            if (jsonStructure === 'solaris_game') {
                if (star._id != null) {
                    if (typeof star._id === 'number') star._id = String(star._id);
                } else star._id = null;
                if (star.ownedByPlayerId != null) {
                    if (typeof star.ownedByPlayerId === 'number') star.ownedByPlayerId = star.ownedByPlayerId.toString();
                } else star.ownedByPlayerId = null;
            } else {
                if (star.id != null) {
                    if (typeof star.id === 'number') star.id = String(star.id);
                } else star.id = null;
                if (star.playerId != null) {
                    if (typeof star.playerId === 'number') star.playerId = star.playerId.toString();
                } else star.playerId = null;
            }

            star.homeStar = star.homeStar == null ? false : star.homeStar;
            if (star.wormHoleToStarId != null) {
                if (typeof star.wormHoleToStarId === 'number') star.wormHoleToStarId = star.wormHoleToStarId.toString();
            } else star.wormHoleToStarId = null;
            star.specialistId = star.specialistId == null ? null : star.specialistId;
            star.specialistExpireTick = star.specialistExpireTick == null ? null : star.specialistExpireTick;
            star.shipsActual = star.shipsActual == null ? null : star.shipsActual;

            if (star.shipsActual === null) { // This is the case in finished Solaris games
                star.ships = star.ships == null ? null : star.ships;
                star.shipsActual = star.ships;
            } else star.ships = Math.floor(star.shipsActual!);

            if (star.infrastructure != null) {
                star.infrastructure.economy = star.infrastructure?.economy == null ? 0 : star.infrastructure.economy;
                star.infrastructure.industry = star.infrastructure?.industry == null ? 0 : star.infrastructure.industry;
                star.infrastructure.science = star.infrastructure?.science == null ? 0 : star.infrastructure.science;
            } else {
                star.infrastructure = {
                    economy: 0,
                    industry: 0,
                    science: 0
                }
            }

            if (star.naturalResources != null) { // NR is undefined when loading 'solaris_game' with stars that are outside of scanning range
                star.naturalResources.economy = star.naturalResources?.economy == null ? 0 : star.naturalResources.economy;
                star.naturalResources.industry = star.naturalResources?.industry == null ? 0 : star.naturalResources.industry;
                star.naturalResources.science = star.naturalResources?.science == null ? 0 : star.naturalResources.science;
            } else {
                star.naturalResources = {
                    economy: 0,
                    industry: 0,
                    science: 0
                }
            }

            if (jsonStructure === 'solaris_game') {
                if (!this.checkStarProperty(star, '_id', 'string')) return;
                if (!this.checkStarProperty(star, 'ownedByPlayerId', 'string', true)) return;
            } else {
                if (!this.checkStarProperty(star, 'id', 'string')) return;
                if (!this.checkStarProperty(star, 'playerId', 'string', true)) return;
            }

            if (!this.checkStarProperty(star, 'name', 'string', false, true)) return; // If name is provided, make sure it is valid.

            if (!this.checkStarProperty(star?.location, 'x', 'number', false)) return;
            if (!this.checkStarProperty(star?.location, 'y', 'number', false)) return;
            if (!this.checkStarProperty(star?.naturalResources, 'economy', 'number', false)) return;
            if (!this.checkStarProperty(star?.naturalResources, 'industry', 'number', false)) return;
            if (!this.checkStarProperty(star?.naturalResources, 'science', 'number', false)) return;
            if (!this.checkStarProperty(star, 'warpGate', 'boolean', true)) return;
            if (!this.checkStarProperty(star, 'isNebula', 'boolean', true)) return;
            if (!this.checkStarProperty(star, 'isAsteroidField', 'boolean', true)) return;
            if (!this.checkStarProperty(star, 'isBinaryStar', 'boolean', true)) return;
            if (!this.checkStarProperty(star, 'isBlackHole', 'boolean', true)) return;
            if (!this.checkStarProperty(star, 'isPulsar', 'boolean', true)) return;
            if (!this.checkStarProperty(star, 'wormHoleToStarId', 'string', true)) return;
            if (!this.checkStarProperty(star, 'homeStar', 'boolean', true)) return;
            if (!this.checkStarProperty(star, 'specialistId', 'number', true)) return;
            if (!this.checkStarProperty(star, 'specialistExpireTick', 'number', true, true)) return;
            if (!this.checkStarProperty(star, 'shipsActual', 'number', true)) return;
            if (!this.checkStarProperty(star, 'ships', 'number', true)) return;
            if (!this.checkStarProperty(star?.infrastructure, 'economy', 'number', false)) return;
            if (!this.checkStarProperty(star?.infrastructure, 'industry', 'number', false)) return;
            if (!this.checkStarProperty(star?.infrastructure, 'science', 'number', false)) return;
            if (!this.checkStarProperty(star, 'isKingOfTheHillStar', 'boolean', false, true)) return;
            if (!this.checkStarProperty(star, 'manufacturing', 'number', false, true)) return;

            if (!this.checkNumericalProperty(star, 'specialistId', true)) return;
            if (!this.checkNumericalProperty(star, 'shipsActual', false, true)) return;
            if (!this.checkNumericalProperty(star, 'ships', true, true)) return;
            if (!this.checkNumericalProperty(star?.naturalResources, 'economy', true, true)) return;
            if (!this.checkNumericalProperty(star?.naturalResources, 'industry', true, true)) return;
            if (!this.checkNumericalProperty(star?.naturalResources, 'science', true, true)) return;
            if (!this.checkNumericalProperty(star?.infrastructure, 'economy', true, true)) return;
            if (!this.checkNumericalProperty(star?.infrastructure, 'industry', true, true)) return;
            if (!this.checkNumericalProperty(star?.infrastructure, 'science', true, true)) return;
            if (!this.checkNumericalProperty(star?.naturalResources, 'economy', true, true)) return;
            if (!this.checkNumericalProperty(star?.naturalResources, 'industry', true, true)) return;
            this.checkNumericalProperty(star, 'manufacturing', false, true);

            parsedStar = {
                id: jsonStructure === 'solaris_game' ? star._id : star.id,
                homeStar: star.homeStar,
                playerId: jsonStructure === 'solaris_game' ? star.ownedByPlayerId : star.playerId,
                warpGate: star.warpGate,
                isNebula: star.isNebula,
                isAsteroidField: star.isAsteroidField,
                isBinaryStar: star.isBinaryStar,
                isBlackHole: star.isBlackHole,
                isPulsar: star.isPulsar,
                wormHoleToStarId: star.wormHoleToStarId,
                specialistId: star.specialistId,
                specialist: useSpecialistsStore().getStarSpecialistById(star.specialistId),
                specialistExpireTick: star.specialistExpireTick,
                location: {
                    x: star.location.x,
                    y: star.location.y
                },
                naturalResources: {
                    economy: star.naturalResources.economy,
                    industry: star.naturalResources.industry,
                    science: star.naturalResources.science
                },
                shipsActual: star.shipsActual,
                ships: star.ships,
                infrastructure: star.infrastructure,
                name: star.name
            };

            return parsedStar;
        },
        parseCarrier(carrier: any, jsonStructure: JSONStructure) {
            let parsedCarrier = {} as Carrier;

            if (jsonStructure === 'solaris_game') {
                if (carrier._id != null) {
                    if (typeof carrier._id === 'number') carrier._id = String(carrier._id);
                } else carrier._id = null;
                if (carrier.ownedByPlayerId != null) {
                    if (typeof carrier.ownedByPlayerId === 'number') carrier.ownedByPlayerId = carrier.ownedByPlayerId.toString();
                } else carrier.ownedByPlayerId = null;
            } else {
                if (carrier.id != null) {
                    if (typeof carrier.id === 'number') carrier.id = String(carrier.id);
                } else carrier.id = null;
                if (carrier.playerId != null) {
                    if (typeof carrier.playerId === 'number') carrier.playerId = carrier.playerId.toString();
                } else carrier.playerId = null;
            }

            if (carrier.orbiting != null) {
                if (typeof carrier.orbiting === 'number') carrier.orbiting = carrier.orbiting.toString();
            } else carrier.orbiting = null;
            carrier.specialistId = carrier.specialistId == null ? null : carrier.specialistId;
            carrier.specialistExpireTick = carrier.specialistExpireTick == null ? null : carrier.specialistExpireTick;
            carrier.ships = carrier.ships == null ? 0 : Math.floor(carrier.ships!);
            carrier.isGift = carrier.isGift == null ? false : carrier.isGift;
            carrier.waypointsLooped = carrier.waypointsLooped == null ? false : carrier.waypointsLooped;

            if (!this.checkCarrierProperty(carrier, 'orbiting', 'string', true)) return;

            if (carrier.location != null) {
                if (!this.checkCarrierProperty(carrier.location, 'x', 'number', false)) return;
                if (!this.checkCarrierProperty(carrier.location, 'y', 'number', false)) return;
            } else carrier.location = null; // Will set this later

            if (jsonStructure === 'solaris_game') {
                if (!this.checkCarrierProperty(carrier, '_id', 'string')) return;
                if (!this.checkCarrierProperty(carrier, 'ownedByPlayerId', 'string', true)) return;
            } else {
                if (!this.checkCarrierProperty(carrier, 'id', 'string')) return;
                if (!this.checkCarrierProperty(carrier, 'playerId', 'string', true)) return;
            }

            if (!this.checkCarrierProperty(carrier, 'name', 'string', false, true)) return; // If name is provided, make sure it is valid.

            if (!this.checkCarrierProperty(carrier, 'waypointsLooped', 'boolean', false)) return;
            if (!this.checkCarrierProperty(carrier, 'specialistId', 'number', true)) return;
            if (!this.checkCarrierProperty(carrier, 'specialistExpireTick', 'number', true, true)) return;
            if (!this.checkCarrierProperty(carrier, 'ships', 'number', true)) return; // Allows null, but it will never be null here.
            if (!this.checkCarrierProperty(carrier, 'isGift', 'boolean', false)) return;
            if (!this.checkCarrierProperty(carrier, 'progress', 'number', false, true)) return;

            if (!this.checkNumericalProperty(carrier, 'specialistId', true)) return;
            if (!this.checkNumericalProperty(carrier, 'ships', true, true)) return;

            const parsedWaypoints = [] as CarrierWaypoint[];
            for (const waypoint of carrier.waypoints) {
                if (waypoint.source != null && typeof waypoint.source === 'number') waypoint.source = String(waypoint.source);
                if (waypoint.destination != null && typeof waypoint.destination === 'number') waypoint.destination = String(waypoint.destination);
                waypoint.action = waypoint.action == null ? 'collectAll' : waypoint.action;
                waypoint.actionShips = waypoint.actionShips == null ? 0 : waypoint.actionShips;

                if (!this.checkWaypointProperty(waypoint, 'source', 'string', false)) return;
                if (!this.checkWaypointProperty(waypoint, 'destination', 'string', false)) return;
                if (!this.checkWaypointProperty(waypoint, 'action', 'string', false)) return;
                if (!this.checkWaypointProperty(waypoint, 'actionShips', 'number', false)) return;
                if (!this.checkWaypointProperty(waypoint, 'delayTicks', 'number', false, true)) return;
                if (!this.checkWaypointProperty(waypoint, 'ticks', 'number', false, true)) return;
                if (!this.checkWaypointProperty(waypoint, 'ticksEta', 'number', false, true)) return;

                if (!Object.values(CarrierWaypointActionTypes).includes(waypoint.action)) {
                    this.errors.push(`Invalid waypoint action '${waypoint.action}' of waypoint ${JSON.stringify(waypoint)}.`);
                    return;
                };

                if (!this.checkNumericalProperty(waypoint, 'actionShips', false, true)) return; // actionShips may be decimal if action is collect/drop %
                if (waypoint.action !== 'collectPercentage' && waypoint.action !== 'dropPercentage') {
                    waypoint.actionShips = Math.floor(waypoint.actionShips);
                }

                parsedWaypoints.push({
                    source: waypoint.source,
                    destination: waypoint.destination,
                    action: waypoint.action,
                    actionShips: waypoint.actionShips,
                    delayTicks: waypoint.delayTicks,
                    ticks: waypoint.ticks
                });
            }

            parsedCarrier = {
                id: jsonStructure === 'solaris_game' ? carrier._id : carrier.id,
                playerId: jsonStructure === 'solaris_game' ? carrier.ownedByPlayerId : carrier.playerId,
                specialistId: carrier.specialistId,
                specialist: useSpecialistsStore().getCarrierSpecialistById(carrier.specialistId),
                specialistExpireTick: carrier.specialistExpireTick,
                location: {
                    x: carrier.location.x,
                    y: carrier.location.y
                },
                ships: carrier.ships,
                orbiting: carrier.orbiting,
                waypointsLooped: carrier.waypointsLooped,
                isGift: carrier.isGift,
                waypoints: parsedWaypoints,
                progress: carrier.progress,
                name: carrier.name
            };

            return parsedCarrier;
        },
        parsePlayer(player: any, jsonStructure: JSONStructure) {
            let parsedPlayer = {} as Player;

            if (jsonStructure === 'solaris_game') {
                if (player._id != null) {
                    if (typeof player._id === 'number') player._id = String(player._id);
                } else player._id = null;
            } else {
                if (player.id != null) {
                    if (typeof player.id === 'number') player.id = String(player.id);
                } else player.id = null;
            }

            if (player.homeStarId != null) {
                if (typeof player.homeStarId === 'number') player.homeStarId = player.homeStarId.toString();
            } else player.homeStarId = null;

            player.colour = player.colour == null ? null : player.colour;
            player.shape = player.shape == null ? null : player.shape;

            let technologies: PlayerTechnologyLevels = {
                scanning: 1, hyperspace: 1, terraforming: 1, experimentation: 1, weapons: 1, banking: 1, manufacturing: 1, specialists: 1
            };
            if (jsonStructure === 'solaris_game') {
                technologies.scanning = player.research?.scanning?.level == null ? 1 : player.research.scanning.level;
                technologies.hyperspace = player.research?.hyperspace?.level == null ? 1 : player.research.hyperspace.level;
                technologies.terraforming = player.research?.terraforming?.level == null ? 1 : player.research.terraforming.level;
                technologies.experimentation = player.research?.experimentation?.level == null ? 1 : player.research.experimentation.level; // min: 0
                technologies.weapons = player.research?.weapons?.level == null ? 1 : player.research.weapons.level;
                technologies.banking = player.research?.banking?.level == null ? 1 : player.research.banking.level; // min: 0
                technologies.manufacturing = player.research?.manufacturing?.level == null ? 1 : player.research.manufacturing.level;
                technologies.specialists = player.research?.specialists?.level == null ? 1 : player.research.specialists.level; // min: 0
            } else {
                technologies.scanning = player.technologies?.scanning == null ? 1 : player.technologies.scanning;
                technologies.hyperspace = player.technologies?.hyperspace == null ? 1 : player.technologies.hyperspace;
                technologies.terraforming = player.technologies?.terraforming == null ? 1 : player.technologies.terraforming;
                technologies.experimentation = player.technologies?.experimentation == null ? 1 : player.technologies.experimentation; // min: 0
                technologies.weapons = player.technologies?.weapons == null ? 1 : player.technologies.weapons;
                technologies.banking = player.technologies?.banking == null ? 1 : player.technologies.banking; // min: 0
                technologies.manufacturing = player.technologies?.manufacturing == null ? 1 : player.technologies.manufacturing;
                technologies.specialists = player.technologies?.specialists == null ? 1 : player.technologies.specialists; // min: 0
            }

            player.credits = player.credits == null ? null : player.credits;
            player.creditsSpecialists = player.creditsSpecialists == null ? null : player.creditsSpecialists;

            if (jsonStructure === 'solaris_game') {
                if (!this.checkPlayerProperty(player, '_id', 'string')) return;
            } else {
                if (!this.checkPlayerProperty(player, 'id', 'string')) return;
            }
            if (!this.checkPlayerProperty(player, 'homeStarId', 'string', true)) return;
            if (!this.checkPlayerProperty(player, 'alias', 'string', false, true)) return; // If alias is provided, make sure it is valid.

            if (!this.checkNumericalProperty(player, 'credits', true, true)) return;
            if (!this.checkNumericalProperty(player, 'creditsSpecialists', true, true)) return;
            if (!this.checkNumericalProperty(technologies, 'scanning', true, true)) return;
            if (!this.checkNumericalProperty(technologies, 'hyperspace', true, true)) return;
            if (!this.checkNumericalProperty(technologies, 'terraforming', true, true)) return;
            if (!this.checkNumericalProperty(technologies, 'experimentation', true, true)) return;
            if (!this.checkNumericalProperty(technologies, 'weapons', true, true)) return;
            if (!this.checkNumericalProperty(technologies, 'banking', true, true)) return;
            if (!this.checkNumericalProperty(technologies, 'manufacturing', true, true)) return;
            if (!this.checkNumericalProperty(technologies, 'specialists', true, true)) return;

            parsedPlayer = {
                id: jsonStructure === 'solaris_game' ? player._id : player.id,
                homeStarId: player.homeStarId,
                alias: player.alias,
                colour: player.colour,
                shape: player.shape,
                technologies: technologies,
                credits: player.credits,
                creditsSpecialists: player.creditsSpecialists
            };

            return parsedPlayer;
        },
        parseTeam(team: any, jsonStructure: JSONStructure) {
            let parsedTeam = {} as Team;

            if (jsonStructure === 'solaris_game') {
                if (team._id != null) {
                    if (typeof team._id === 'number') team._id = String(team._id);
                } else team._id = null;
            } else {
                if (team.id != null) {
                    if (typeof team.id === 'number') team.id = String(team.id);
                } else team.id = null;
            }

            if (!this.checkTeamProperty(team, 'name', 'string', false, true)) return; // If name is provided, make sure it is valid.

            team.players = team.players == null ? [] as Array<string> : team.players;

            if (jsonStructure === 'solaris_game') {
                if (!this.checkTeamProperty(team, '_id', 'string')) return;
            } else {
                if (!this.checkTeamProperty(team, 'id', 'string')) return;
            }

            parsedTeam = {
                id: jsonStructure === 'solaris_game' ? team._id : team.id,
                players: team.players,
                name: team.name
            };

            return parsedTeam;
        },
        checkStarProperty(star: any, property: string, type: string, allowNull?: boolean, allowUndefined?: boolean) {
            return this.checkObjectProperty(star, 'star', property, type, allowNull, allowUndefined)
        },
        checkCarrierProperty(star: any, property: string, type: string, allowNull?: boolean, allowUndefined?: boolean) {
            return this.checkObjectProperty(star, 'carrier', property, type, allowNull, allowUndefined)
        },
        checkPlayerProperty(player: any, property: string, type: string, allowNull?: boolean, allowUndefined?: boolean) {
            return this.checkObjectProperty(player, 'player', property, type, allowNull, allowUndefined);
        },
        checkTeamProperty(team: any, property: string, type: string, allowNull?: boolean, allowUndefined?: boolean) {
            return this.checkObjectProperty(team, 'team', property, type, allowNull, allowUndefined);
        },
        checkWaypointProperty(waypoint: any, property: string, type: string, allowNull?: boolean, allowUndefined?: boolean) {
            return this.checkObjectProperty(waypoint, 'waypoint', property, type, allowNull, allowUndefined);
        },
        checkObjectProperty(object: any, objectType: string, property: string, type: string, allowNull: boolean = false, allowUndefined: boolean = false) {
            if (object == null) {
                throw new Error(`${objectType} is undefined, cannot check its property!`);
            }

            if (object[property] === undefined) {
                if (!allowUndefined) {
                    this.errors.push(`Missing required property '${property}' of ${objectType} ${JSON.stringify(object)}.`);
                    return false;
                }
                return true;
            }

            if (object[property] === null && allowNull) return true;

            if (typeof object[property] !== type) {
                this.errors.push(`Invalid type property '${property}' of ${objectType} ${JSON.stringify(object)}: expected '${type}', got '${typeof object[property]}'.`);
                return false;
            }

            return true;
        },
        checkNumericalProperty(object: any, property: string, requireInt: boolean, requireNonNegative: boolean = false): boolean {
            // Undefined or null properties should not throw a validation error, but are not numerical either.
            if (object === undefined || object?.[property] === undefined) return false;
            if (object[property] === null) return true; // When null, assume null is valid.

            if (typeof object[property] !== 'number') {
                this.errors.push(`Property '${property}' of object ${JSON.stringify(object)} must be of type 'number'.`);
                return false;
            }
            if (isNaN(object[property]) || !isFinite(object[property])) {
                this.errors.push(`Property '${property}' of object ${JSON.stringify(object)} must be a valid finite number.`);
                return false;
            }

            if (requireInt && (object[property] !== parseInt(object[property].toString()))) {
                this.errors.push(`Property '${property}' of object ${JSON.stringify(object)} must be a whole number.`);
                return false;
            }

            if (requireNonNegative && object[property] < 0) {
                this.errors.push(`Property '${property}' of object ${JSON.stringify(object)} must be a non-negative number.`);
                return false;
            }

            return true;
        },
        setGalaxy(stars: Star[], carriers: Carrier[], players: Player[], teams?: Team[]) {
            let galaxy: Galaxy;
            if (teams != null && teams.length > 0) {
                galaxy = {
                    stars: stars,
                    carriers: carriers,
                    players: players,
                    teams: teams
                };
            } else {
                galaxy = {
                    stars: stars,
                    carriers: carriers,
                    players: players
                };
            }

            useGalaxyStore().setGalaxy(galaxy);
            useGalaxyStore().setGalaxyIsReady(false);
            editor.viewport!.visible = false;
            editor.viewport!.interactive = false;
            editor.viewport!.interactiveChildren = false;
            editor.clearScaleBar();
            editor.clearPerformanceMonitor();
            editor.clearCursorCoordinates();
            useMenuStateStore().clearSelection();
            editor.map!.clearStarSelection();
            setTimeout(() => {
                editor.reloadGalaxy(storage.getSettings());
                editor.onMenuToggled(true);
            }, 100);

            return galaxy;
        },
        simplifyIds(stars: Star[], carriers: Carrier[], players: Player[], teams?: Team[]) {
            // IDs start at 1
            /* Order of conversion: 
            1) Teams (cannot do after player ids)
            2) Carriers (cannot do after star ids or player ids)
            3) Player homeStarIds (cannot do after star ids)
            4) Star playerIds and wormHoleToStarIds (cannot do after star ids)
            5) Star ids
            6) Player ids
            */
            if (teams != null) {
                for (const team of teams) {
                    const playerIds: string[] = [];
                    for (let teamPlayerId of team.players) {
                        playerIds.push((players.findIndex((p) => p.id === teamPlayerId) + 1).toString());
                    }
                    team.players = playerIds;
                    team.id = (teams.indexOf(team) + 1).toString();
                }
            }
            for (const carrier of carriers) {
                if (carrier.orbiting != null) {
                    carrier.orbiting = (stars.findIndex((s) => s.id === carrier.orbiting) + 1).toString();
                }
                if (carrier.waypoints != null) {
                    for (const waypoint of carrier.waypoints) {
                        waypoint.source = (stars.findIndex((s) => s.id === waypoint.source) + 1).toString();
                        waypoint.destination = (stars.findIndex((s) => s.id === waypoint.destination) + 1).toString();
                    }
                }
                carrier.playerId = (players.findIndex((p) => p.id === carrier.playerId) + 1).toString();
                carrier.id = (carriers.indexOf(carrier) + 1).toString();
            }
            for (const player of players) {
                player.homeStarId = (stars.findIndex((s) => s.id === player.homeStarId) + 1).toString();
            }
            for (const star of stars) {
                if (star.playerId != null) {
                    star.playerId = (players.findIndex((p) => p.id === star.playerId) + 1).toString();
                }
                if (star.wormHoleToStarId != null) star.wormHoleToStarId = (stars.findIndex((s) => s.id === star.wormHoleToStarId) + 1).toString();
            }
            for (const star of stars) {
                star.id = (stars.indexOf(star) + 1).toString();
            }
            for (const player of players) {
                player.id = (players.indexOf(player) + 1).toString();
            }

            return {
                stars: stars,
                carriers: carriers,
                players: players,
                teams: teams
            }
        },
        changeIdsToNames(stars: Star[], carriers: Carrier[], players: Player[], teams?: Team[]) {
            if (teams != null) {
                for (const team of teams) {
                    const playerIds: string[] = [];
                    for (let teamPlayerId of team.players) {
                        const teamPlayerAlias = players.find((p) => p.id === teamPlayerId)?.alias;
                        if (teamPlayerAlias != null) playerIds.push(teamPlayerAlias);
                    }
                    team.players = playerIds;
                    if (team.name != null) team.id = team.name;
                }
            }
            for (const carrier of carriers) {
                if (carrier.orbiting != null) {
                    const star = stars.find(s => s.id === carrier.orbiting);
                    if (star?.name != null) carrier.orbiting = star.name;
                }
                if (carrier.waypoints != null) {
                    for (const waypoint of carrier.waypoints) {
                        const sourceStar = stars.find(s => s.id === waypoint.source);
                        const destinationStar = stars.find(s => s.id === waypoint.destination);
                        if (sourceStar?.name != null) waypoint.source = sourceStar.name;
                        if (destinationStar?.name != null) waypoint.destination = destinationStar.name;
                    }
                }
                const owner = players.find(p => p.id === carrier.playerId);
                if (owner?.alias != null) carrier.playerId = owner.alias;
                if (carrier.name != null) carrier.id = carrier.name;
            }
            for (const player of players) {
                const homeStar = stars.find(s => s.id === player.homeStarId);
                if (homeStar?.name != null) player.homeStarId = homeStar.name;
            }
            for (const star of stars) {
                if (star.playerId != null) {
                    const owner = players.find(p => p.id === star.playerId);
                    if (owner?.alias != null) star.playerId = owner.alias;
                }
                if (star.wormHoleToStarId != null) {
                    const wormholePairStar = stars.find(s => s.id === star.wormHoleToStarId);
                    if (wormholePairStar?.name != null) star.wormHoleToStarId = wormholePairStar.name;
                }
            }
            for (const star of stars) {
                if (star.name != null) star.id = star.name;
            }
            for (const player of players) {
                if (player.alias != null) player.id = player.alias;
            }

            return {
                stars: stars,
                carriers: carriers,
                players: players,
                teams: teams
            };
        }
    }
}
</script>

<style scoped>
.row {
    width: inherit;
    --bs-gutter-x: 0px;
    --bs-gutter-y: 0px;
    max-width: 100%;
}

.col {
    text-align: center;
}


.btn-success {
    display: inline-block;
    font-weight: 400;
    line-height: 1.5;
    text-align: center;
    text-decoration: none;
    vertical-align: middle;
    cursor: pointer;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    font-size: .875rem;
    border-radius: 4px;
    margin-bottom: 16px;
    margin-top: 6px;
}

.btn-outline-primary {
    margin-right: 4px;
}

#jsonArea {
    height: calc(100vh - 45px - 106px);
}

.text-danger {
    font-size: 14px;
    font-weight: 400;
}

.text-warning {
    font-size: 14px;
    font-weight: 300;
}

p {
    margin-bottom: 0;
}
</style>