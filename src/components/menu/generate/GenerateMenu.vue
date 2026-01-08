<template>
    <div class="menu-page">
        <menu-title :title="'Generate'" />

        <form id="starDetailForm" @submit.prevent="generateGalaxy()">
            <div class="row pt-2 pb-2 bg-dark-custom">
                <div class="col col-flex align-center">
                    Generator
                </div>
                <div class="col">
                    <select class="form-control form-control-sm" v-model="generator">
                        <option v-for="generatorType in generatorTypes" :value="generatorType">
                            {{ generatorType.name }}
                        </option>
                    </select>
                </div>
            </div>
            <div class="row pt-2 pb-2 mt-1 bg-dark-custom" v-if="generator.requiresSeed">
                <div class="col col-flex align-center">
                    Galaxy Seed
                </div>
                <div class="col">
                    <input id="starsPerPlayer" class="form-control large-input" type="text" v-model="seed"
                        :placeholder="'Random'">
                </div>
            </div>
            <div class="row pt-2 pb-2 mt-1 bg-dark-custom">
                <div class="col col-flex align-center">
                    Player Count
                </div>
                <div class="col">
                    <input id="playerCount" class="form-control hidden-number large-input" type="number" min="2"
                        step="1" required="true" v-model="playerCount">
                </div>
            </div>
            <div class="row pt-2 pb-2 mt-1 bg-dark-custom">
                <div class="col col-flex align-center">
                    Stars per Player
                </div>
                <div class="col">
                    <input id="starsPerPlayer" class="form-control hidden-number large-input" type="number" min="1"
                        step="1" required="true" v-model="starsPerPlayer">
                </div>
            </div>
            <div class="row pt-2 pb-2 mt-1 bg-dark-custom">
                <div class="col col-flex align-center">
                    Generate Players
                </div>
                <div class="col">
                    <select class="form-control form-control-sm" v-model="generatePlayers">
                        <option value="disabled">Disabled</option>
                        <option value="enabled">Enabled</option>
                    </select>
                </div>
            </div>
            <div class="row pt-2 pb-2 mt-1 bg-dark-custom"
                v-if="generatePlayers === 'enabled' && !generator.usesLinkedLocations">
                <div class="col col-flex align-center">
                    Player Distribution
                </div>
                <div class="col">
                    <select class="form-control form-control-sm" v-model="playerDistribution">
                        <option value="circular">Circular</option>
                        <option value="circularSequential">Circular Sequential</option>
                        <option value="random">Random</option>
                    </select>
                </div>
            </div>
            <div class="row pt-2 pb-2 mt-1 bg-dark-custom"
                v-if="generatePlayers === 'enabled' || generator.requiresStartingStars">
                <div class="col col-flex align-center">
                    Starting Stars
                </div>
                <div class="col">
                    <input id="startingStars" class="form-control hidden-number large-input" type="number" min="1"
                        step="1" required="true" v-model="startingStars" ref="startingStarsInput"
                        @input="checkStartingStarsValidity()" :max="starsPerPlayer">
                </div>
            </div>
            <div class="row pt-2 pb-2 mt-1 bg-dark-custom"
                v-if="generatePlayers === 'enabled' || generator.requiresHyperspaceRange">
                <div class="col col-flex align-center">
                    Initial Hyperspace Range
                </div>
                <div class="col">
                    <input id="initialHyperspaceRange" class="form-control hidden-number large-input" type="number"
                        min="1" step="1" required="true" v-model="initialHyperspaceRange">
                </div>
            </div>
            <div class="row pt-1 pb-1">
                <div class="col col-flex">
                    <button type="submit" class="btn btn-sm btn-outline-success btn-wide"><i class="fas fa-gears"></i>
                        Generate Galaxy</button>
                </div>
            </div>
        </form>
    </div>
</template>

<script lang="ts">
import storage from '@/scripts/storage';
import MenuTitle from '../MenuTitle.vue';
import helper from '@/scripts/helper';
import { GeneratorTypes, type GeneratorOutput, type GeneratorType, type PlayerDistribution } from '@/scripts/types/Generator';
import type { Star } from '@/scripts/types/Star';
import { useGalaxyStore } from '@/stores/galaxy';
import type { Player } from '@/scripts/types/Player';
import type { Location } from '@/scripts/types/Location';
import editor from '@/scripts/editor';
import { useMenuStateStore } from '@/stores/menuState';
import type { Galaxy } from '@/scripts/types/Galaxy';
import circularGenerator from '@/scripts/generators/circular';
import circularBalancedGenerator from '@/scripts/generators/circularBalanced';
import doughnutGenerator from '@/scripts/generators/doughnut';
import irregularGenerator from '@/scripts/generators/irregular';
import spiralGenerator from '@/scripts/generators/spiral';
import irregularNLimit from '@/scripts/generators/irregularNLimit';

export default {
    components: {
        'menu-title': MenuTitle
    },
    data() {
        return {
            generator: helper.getGeneratorById(storage.getSettings().generation.defaultGeneratorId),
            generatorTypes: GeneratorTypes,
            playerCount: storage.getSettings().generation.defaultPlayerCount,
            starsPerPlayer: storage.getSettings().generation.defaultStarsPerPlayer,
            generatePlayers: storage.getSettings().generation.defaultGeneratePlayers,
            startingStars: storage.getSettings().generation.defaultStartingStars,
            seed: null as string | null,
            playerDistribution: storage.getSettings().generation.defaultPlayerDistribution,
            initialHyperspaceRange: storage.getSettings().generation.defaultHyperspaceRange
        }
    },
    methods: {
        onGeneratorChanged() {

        },
        checkStartingStarsValidity() {
            let isValid = true;

            (this.$refs['startingStarsInput'] as HTMLInputElement).setCustomValidity('');

            const startingStars = (this.$refs['startingStarsInput'] as HTMLInputElement).valueAsNumber;

            if (startingStars > this.starsPerPlayer) {
                (this.$refs['startingStarsInput'] as HTMLInputElement).setCustomValidity('Starting Stars cannot be greater than Stars per Player.');
                isValid = false;
            }

            return isValid;
        },
        generateGalaxy() {
            const galaxy: Galaxy = {
                stars: [],
                players: [],
                carriers: []
            }

            let stars: Star[] = [];
            const homeStarIds: string[] = [];
            const linkedStarIds: string[][] = [];

            let output: GeneratorOutput[] = [];

            switch (this.generator.id) {
                case 'circular':
                    output = circularGenerator.generateLocations(this.playerCount, this.starsPerPlayer);
                    break;
                case 'circularBalanced':
                    output = circularBalancedGenerator.generateLocations(this.playerCount, this.starsPerPlayer, this.seed, this.startingStars, this.initialHyperspaceRange);
                    break;
                case 'doughnut':
                    output = doughnutGenerator.generateLocations(this.playerCount, this.starsPerPlayer);
                    break;
                case 'irregular':
                    output = irregularGenerator.generateLocations(this.playerCount, this.starsPerPlayer, this.seed, this.startingStars, this.initialHyperspaceRange);
                    break;
                case 'spiral':
                    output = spiralGenerator.generateLocations(this.playerCount, this.starsPerPlayer, this.seed);
                    break;
                case 'irregularNLimit':
                    output = irregularNLimit.generateLocations(this.playerCount, this.starsPerPlayer, this.seed, this.startingStars, this.initialHyperspaceRange);
                    break;
                default:
                    throw new Error(`Invalid generator id!`);
            }

            let unlinkedStars = output.filter(o => !o.linked);

            let minStarId = 1;
            for (let i = 0; i < unlinkedStars.length; i++) {
                const outputLoc = unlinkedStars[i];

                const star = helper.generateNewStar();
                star.id = minStarId.toString();
                minStarId++;
                star.location = { x: outputLoc.x, y: outputLoc.y };

                stars.push(star);

                if (outputLoc.homeStar && outputLoc.linkedLocations) {
                    let locLinkedStars: string[] = [];

                    for (let linkedLocation of outputLoc.linkedLocations) {

                        const linkedStar = helper.generateNewStar();
                        linkedStar.id = minStarId.toString();
                        minStarId++;
                        linkedStar.location = { x: linkedLocation.x, y: linkedLocation.y };

                        stars.push(linkedStar);
                        locLinkedStars.push(linkedStar.id);
                    }

                    homeStarIds.push(star.id)
                    linkedStarIds.push(locLinkedStars);
                }
            }

            galaxy.stars = stars;

            if (this.generatePlayers === 'enabled') {
                const players: Player[] = [];
                const combos = helper.getRandomUnusedCombos(this.playerCount);

                let minPlayerId = 1;
                for (let i = 0; i < this.playerCount; i++) {
                    const player = helper.generateNewPlayer();
                    player.id = minPlayerId.toString();
                    minPlayerId++;
                    player.colour = combos[i].colour;
                    player.shape = combos[i].shape;
                    if (this.generator.requiresHyperspaceRange || this.generatePlayers === 'enabled') {
                        player.technologies.hyperspace = Math.max(player.technologies.hyperspace, this.initialHyperspaceRange);
                    }

                    players.push(player);
                }

                if (homeStarIds && homeStarIds.length) {
                    this.distributePlayerLinkedHomeStars(players, stars, homeStarIds);
                } else {
                    this.distributePlayerHomeStars(players, stars, this.generator.id);
                }

                if (linkedStarIds && linkedStarIds.length) {
                    this.distributePlayerLinkedStartingStars(linkedStarIds, stars, players);
                } else {
                    this.distributePlayerStartingStars(stars, players);
                }

                galaxy.players = players;
            } else {
                galaxy.players = useGalaxyStore().$state.galaxy.players;
                galaxy.teams = useGalaxyStore().$state.galaxy.teams;
            }

            this.setGalaxy(galaxy);
        },
        setGalaxy(galaxy: Galaxy) {
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
        distributePlayerLinkedHomeStars(players: Player[], stars: Star[], homeStarIds: string[]) {
            for (let player of players) {
                let homeStarId = homeStarIds.pop();
                if (!homeStarId) throw new Error(`Home star ID array contains fewer elements than the number of players!`);

                // Set up the home star
                const homeStar = stars.find(s => s.id === homeStarId);
                if (!homeStar) throw new Error(`Home star ID array contains invalid ID ${homeStarId}!`);

                this.setUpHomeStar(homeStar, player);
            }
        },
        distributePlayerHomeStars(players: Player[], stars: Star[], generatorId: GeneratorType['id']) {
            // Divide the galaxy into equal chunks, each player will spawned
            // at near equal distance from the center of the galaxy.
            const starLocations = stars.map(s => s.location);

            // Calculate the center point of the galaxy as we need to add it onto the starting location.
            const galaxyCenter = helper.calculateSelectionCentroid(starLocations);

            const distanceFromCenter = this.getDesiredPlayerDistanceFromCenter(starLocations, generatorId);

            const radians = this.getPlayerStartingLocationRadians(players.length);

            // Create each player starting at angle 0 at a distance of half the galaxy radius

            for (let player of players) {
                let homeStar = this.getNewPlayerHomeStar(stars, galaxyCenter, distanceFromCenter, radians);

                // Set up the home star
                this.setUpHomeStar(homeStar, player);
            }
        },
        distributePlayerLinkedStartingStars(linkedStarIds: string[][], stars: Star[], players: Player[]) {
            for (let player of players) {
                const linkedStars = linkedStarIds.pop()!;

                for (let starId of linkedStars) {
                    const star = stars.find(s => s.id === starId);
                    if (!star) throw new Error(`Linked star ID array contains invalid ID ${starId}!`);

                    this.setUpPlayerStar(star, player);
                }
            }
        },
        distributePlayerStartingStars(stars: Star[], players: Player[]) {
            // The fairest way to distribute stars to players is to
            // iterate over each player and give them 1 star at a time, this is arguably the fairest way
            // otherwise we'll end up with the last player potentially having a really bad position as their
            // stars could be miles away from their home star.
            let starsToDistribute = this.startingStars - 1;

            while (starsToDistribute--) {
                for (let player of players) {
                    const homeStar = stars.find(s => s.id === player.homeStarId!);
                    if (!homeStar) throw new Error(`Generated player has invalid home star ID ${player.homeStarId}!`);

                    // Get X closest stars to the home star and also give those to the player.
                    const s = this.getClosestUnownedStar(homeStar, stars);

                    // Set up the closest star.
                    this.setUpPlayerStar(s, player);
                }
            }
        },
        getDesiredPlayerDistanceFromCenter(locations: Location[], generatorId: GeneratorType['id']) {
            let distanceFromCenter;

            const diameter = helper.getMaxSelectionDiameter(locations);

            // doughnut galaxies need the distance from the center needs to be slightly more than others
            // spiral galaxies need the distance to be slightly less, and they have a different galactic center
            if (generatorId === 'doughnut') {
                distanceFromCenter = (diameter / 2) * (3 / 4);
            } else if (generatorId === 'spiral') {
                distanceFromCenter = diameter / 2 / 2;
            } else {
                // The desired distance from the center is on two thirds from the galaxy center and the edge
                // for all galaxies other than doughnut and spiral.
                distanceFromCenter = (diameter / 2) * (2 / 3);
            }

            return distanceFromCenter;
        },
        getPlayerStartingLocationRadians(playerCount: number) {
            const increment = 360 / playerCount * Math.PI / 180;
            let current = 0;

            let radians: number[] = [];

            for (let i = 0; i < playerCount; i++) {
                radians.push(current);
                current += increment;
            }

            return radians;
        },
        getNewPlayerHomeStar(stars: Star[], galaxyCenter: Location, distanceFromCenter: number, radians: number[]) {
            switch (this.playerDistribution) {
                case 'circular':
                    return this.getNewPlayerHomeStarCircular(stars, galaxyCenter, distanceFromCenter, radians, true);
                case 'circularSequential':
                    return this.getNewPlayerHomeStarCircular(stars, galaxyCenter, distanceFromCenter, radians, false);
                case 'random':
                    return this.getNewPlayerHomeStarRandom(stars);
            }
        },
        getNewPlayerHomeStarCircular(stars: Star[], galaxyCenter: Location, distanceFromCenter: number, radians: number[], random: boolean) {
            // Get the player's starting location.
            let startingLocation = this.getPlayerStartingLocation(radians, galaxyCenter, distanceFromCenter, random);

            // Find the star that is closest to this location, that will be the player's home star.
            let homeStar = this.getClosestUnownedStarsFromLocation(startingLocation, stars, 1)[0];

            return homeStar;
        },
        getNewPlayerHomeStarRandom(stars: Star[]) {
            // Pick a random unowned star.
            const unownedStars = stars.filter(s => s.playerId == null);

            const rnd = Math.floor(Math.random() * unownedStars.length);

            return unownedStars[rnd];
        },
        getPlayerStartingLocation(radians: number[], galaxyCenter: Location, distanceFromCenter: number, random: boolean) {
            let currentRadian: number;

            if (random) {
                // Pick a random radian for the player's starting position.
                const radianIndex = Math.floor(Math.random() * radians.length);
                currentRadian = radians.splice(radianIndex, 1)[0];
            } else {
                currentRadian = radians.pop()!;
            }

            // Get the desired player starting location.
            const startingLocation = {
                x: distanceFromCenter * Math.cos(currentRadian),
                y: distanceFromCenter * Math.sin(currentRadian)
            };

            // Add the galaxy center x and y so that the desired location is relative to the center.
            startingLocation.x += galaxyCenter.x;
            startingLocation.y += galaxyCenter.y;

            return startingLocation;
        },
        getClosestUnownedStars(star: Star, stars: Star[], amount: number) {
            let sorted = stars
                .filter(s => s.id !== star.id) // Exclude the current star.
                .filter(s => !s.playerId)
                .sort((a, b) => {
                    return helper.getDistanceBetweenLocations(star.location, a.location)
                        - helper.getDistanceBetweenLocations(star.location, b.location);
                });

            return sorted.slice(0, amount);
        },
        getClosestUnownedStar(star: Star, stars: Star[]) {
            return this.getClosestUnownedStars(star, stars, 1)[0];
        },
        getClosestUnownedStarsFromLocation(location: Location, stars: Star[], amount: number) {
            let sorted = stars
                .filter(s => !s.playerId)
                .sort((a, b) => helper.getDistanceBetweenLocations(a.location, location) - helper.getDistanceBetweenLocations(b.location, location));

            return sorted.slice(0, amount);
        },
        setUpHomeStar(homeStar: Star, player: Player) {
            player.homeStarId = homeStar.id;
            homeStar.playerId = player.id;

            homeStar.homeStar = true;
        },
        setUpPlayerStar(star: Star, player: Player) {
            if (player.homeStarId! === star.id) {
                this.setUpHomeStar(star, player);
            } else {
                star.playerId = player.id;
            }
        }
    }
}
</script>

<style scoped>
.bg-dark-custom {
    --bs-bg-opacity: 1;
    background-color: rgb(53, 67, 74) !important;
    --bs-gutter-x: 0px;
    --bs-gutter-y: 0px;
    margin-left: -6px !important;
    padding-left: 6px;
    padding-right: 6px;
    min-width: calc(100% + 12px);
}

.form-control {
    display: block !important;
    width: 100% !important;
    padding: 0px 8px !important;
    font-size: 14px !important;
    font-weight: 300 !important;
    line-height: 1.5 !important;
    color: rgba(255, 255, 255, 0.75) !important;
    background-color: transparent !important;
    background-clip: padding-box !important;
    border: 1px solid rgba(255, 255, 255, .3);
    -webkit-appearance: none !important;
    -moz-appearance: none !important;
    appearance: none !important;
    border-radius: 4px !important;
    margin: 0 !important;
    opacity: 1 !important;
}

.form-control:disabled {
    opacity: 0.5 !important;
}

.form-control::placeholder {
    color: rgba(255, 255, 255, 0.5);
}

p {
    margin: 0;
}

.row {
    margin: 0;
    width: 100%;
}

.col {
    padding: 0;
}

.col-flex {
    display: flex;
    align-items: center;
    padding: 0 !important;
}

.pre-textbox-span {
    margin-right: 6px;
}

.form-control.small-input {
    height: 20px;
}

.form-control.semi-small-input {
    height: 23px;
}

.form-control.large-input {
    height: 31px;
}

.align-center {
    align-content: center;
    justify-content: center;
}

.btn-wide {
    width: 100%;
}
</style>