import type { Sprite } from "pixi.js";
import GalaxyMap from "./map";
import type { Location } from "./types/Location"
import type { Star, TerraformedResources } from "./types/Star";
import type { Carrier } from "./types/Carrier";
import type { Specialist } from './types/Specialist';
import { useGalaxyStore } from '@/stores/galaxy';
import type { Player } from './types/Player';
import { usePlayerColourStore } from '@/stores/colours';
import storage from "./storage";
import type { CarrierWaypoint } from "./types/CarrierWaypoint";
import { GeneratorTypes, type GeneratorType } from "./types/Generator";
import { useSpecialistsStore } from "@/stores/specialists";

class HelperService {
    _getGalaxy() {
        return useGalaxyStore().$state.galaxy;
    }

    getAngleTowardsLocation(source: Location, destination: Location) {
        const deltaX = destination.x - source.x;
        const deltaY = destination.y - source.y;

        return Math.atan2(deltaY, deltaX);
    }

    getDistanceBetweenLocations(loc1: Location, loc2: Location) {
        return Math.hypot(loc2.x - loc1.x, loc2.y - loc1.y);
    }

    isRedCapital(star: Star) {
        if (storage.getSettings().visual.redCapitals === 'enabled') return star.homeStar;
        return false;
    }

    getPlayerById(playerId: string) {
        return this._getGalaxy().players.find(x => x.id === playerId);
    }

    getStarById(id: string) {
        return this._getGalaxy().stars.find(x => x.id === id);
    }

    getCarrierById(id: string) {
        return this._getGalaxy().carriers.find(x => x.id === id);
    }

    getTeamById(id: string) {
        return this._getGalaxy().teams?.find(x => x.id === id);
    }

    isStarHasMultiplePlayersInOrbit(star: Star) {
        if (star.playerId == null) return;
        const carriersInOrbit = this.getCarriersOrbitingStar(star);
        const playerIds = [...new Set(carriersInOrbit.map(c => c.playerId))];

        if (playerIds.indexOf(star.playerId) > -1) {
            playerIds.splice(playerIds.indexOf(star.playerId), 1);
        }

        return playerIds.length;
    }

    getCarriersOrbitingStar(star: Star) {
        return this._getGalaxy().carriers
            .filter(x => x.orbiting === star.id)
            .sort((a, b) => a.ships - b.ships);
    }

    calculateSelectionMinX(locs: Location[]) {
        if (!locs.length) return 0;

        return Math.min(...locs.map(l => l.x));
    }

    calculateSelectionMinY(locs: Location[]) {
        if (!locs.length) return 0;

        return Math.min(...locs.map(l => l.y));
    }

    calculateSelectionMaxX(locs: Location[]) {
        if (!locs.length) return 0;

        return Math.max(...locs.map(l => l.x));
    }

    calculateSelectionMaxY(locs: Location[]) {
        if (!locs.length) return 0;

        return Math.max(...locs.map(l => l.y));
    }

    calculateSelectionMidpoint(locs: Location[]): Location {
        return {
            x: (this.calculateSelectionMinX(locs) + this.calculateSelectionMaxX(locs)) / 2.0,
            y: (this.calculateSelectionMinY(locs) + this.calculateSelectionMaxY(locs)) / 2.0
        };
    }

    calculateSelectionAverageX(locs: Location[]) {
        if (!locs.length) return 0;

        return locs.reduce((total, current) => total + current.x, 0) / locs.length;
    }

    calculateSelectionAverageY(locs: Location[]) {
        if (!locs.length) return 0;

        return locs.reduce((total, current) => total + current.y, 0) / locs.length;
    }

    calculateSelectionCentroid(locs: Location[]): Location {
        return {
            x: this.calculateSelectionAverageX(locs),
            y: this.calculateSelectionAverageY(locs)
        };
    }

    calculateSelectionRadiusFromPoint(locs: Location[], point: Location) {
        if (!locs.length) return 0;

        const transformedLocs = locs.map(l => { return { x: l.x - point.x, y: l.y - point.y } }).sort((a, b) => Math.hypot(b.x, b.y) - Math.hypot(a.x, a.y));

        return Math.hypot(transformedLocs[0].x, transformedLocs[0].y);
    }

    calculateMinStarX() {
        return this.calculateSelectionMinX(this._getGalaxy().stars.map(s => s.location));
    }

    calculateMinStarY() {
        return this.calculateSelectionMinY(this._getGalaxy().stars.map(s => s.location));
    }

    calculateMaxStarX() {
        return this.calculateSelectionMaxX(this._getGalaxy().stars.map(s => s.location));
    }

    calculateMaxStarY() {
        return this.calculateSelectionMaxY(this._getGalaxy().stars.map(s => s.location));
    }

    calculateGalaxyMidpoint(): Location {
        return this.calculateSelectionMidpoint(this._getGalaxy().stars.map(s => s.location));
    }

    calculateStarAverageX() {
        return this.calculateSelectionAverageX(this._getGalaxy().stars.map(s => s.location));
    }

    calculateStarAverageY() {
        return this.calculateSelectionAverageY(this._getGalaxy().stars.map(s => s.location));
    }

    calculateGalaxyCentroid(): Location {
        return this.calculateSelectionCentroid(this._getGalaxy().stars.map(s => s.location));
    }

    getTicksBetweenObjects(carrierSpeed: number, objects: any[], tickDistanceModifier: number) {
        let totalTicks = 0;
        const tickDistance = carrierSpeed * tickDistanceModifier;

        for (let i = 1; i < objects.length; i++) {
            const prevLoc = objects[i - 1];
            const currLoc = objects[i];
            const distance = this.getDistanceBetweenLocations(prevLoc.location, currLoc.location);

            let ticks;

            // Check for worm holes
            if (prevLoc.type === 'star' && (prevLoc.object as Star).wormHoleToStarId === currLoc.object.id && (currLoc.object as Star).wormHoleToStarId === prevLoc.object.id) {
                ticks = 1;
            } else {
                ticks = Math.ceil(distance / tickDistance);
            }

            totalTicks += ticks;
        }

        return totalTicks;
    }

    getTicksByDistance(carrierSpeed: number, distance: number, tickDistanceModifier: number) {
        const tickDistance = carrierSpeed * tickDistanceModifier;
        return Math.ceil(distance / tickDistance);
    }

    getScanningLevelByDistance(distance: number) {
        const distancePerLevel = Math.ceil(distance / GalaxyMap.lightYearDistance - 1);
        return distancePerLevel || 1;
    }

    getHyperspaceLevelByDistance(distance: number) {
        const distancePerLevel = Math.ceil(distance / GalaxyMap.lightYearDistance - 1.5);
        return distancePerLevel || 1;
    }

    getHyperspaceDistanceByLevel(level: number) {
        return (level + 1.5) * GalaxyMap.lightYearDistance;
    }

    getHyperspaceDistance(carrier: Carrier) {
        return this.getHyperspaceDistanceByLevel(this.getEffectiveTechs(carrier)?.hyperspace || 1);
    }

    isStarPairWormHole(sourceStar: Star, destinationStar: Star) {
        return sourceStar
            && destinationStar
            && sourceStar.wormHoleToStarId
            && destinationStar.wormHoleToStarId
            && sourceStar.wormHoleToStarId === destinationStar.id
            && destinationStar.wormHoleToStarId === sourceStar.id;
    }

    calculateShortestRoute(carrier: Carrier, sourceStarId: string, destinStarId: string) {
        const hyperspaceDistance = this.getHyperspaceDistance(carrier);

        const graph = this._getGalaxy().stars.map(s => {
            return {
                ...s,
                cost: 0,
                costFromStart: 0,
                neighbors: null as any,
                parent: null as any
            }
        });

        const getNeighbors = (node: any) => graph
            .filter(s => s.id !== node.id)
            .filter(s => this.getDistanceBetweenLocations(s.location, node.location) <= hyperspaceDistance || this.isStarPairWormHole(s, node));

        const start = graph.find(s => s.id === sourceStarId)!;
        const end = graph.find(s => s.id === destinStarId)!;

        const openSet = [start];
        const closedSet = [];

        while (openSet.length) {
            // This sort makes us look at the nodes where we can get the quickest first.
            // This guarantees that all nodes that already have a calculated route (which may not be the quickest)
            // will have their quickest route found. This in turn guarantees that the final fastest route can be found.

            // Note from Tristanvds: Unfortunately we cannot also take into account a sorting system where we look at the
            // distance to the end star. This kind of sorting system would favour going in a direct line towards that star
            // instead of going for wormholes. Therefore we have to take a (computationally) slower approach by sorting
            // based on the distance from the start.
            openSet.sort((a, b) => a.costFromStart - b.costFromStart); // Ensure we start with the node that has the lowest total cost
            const current = openSet.shift()!;

            closedSet.push(current); // We're evaluating, so might as well close it.

            // If we've found the end, return the reversed path.
            if (current.id === end.id) {
                let temp = current;

                const path = [];

                path.push(temp);

                while (temp.parent) {
                    path.push(temp.parent);
                    temp = temp.parent;
                }

                return path.reverse();
            }

            // Dynamically load neighbors as its more efficient
            if (!current.neighbors) {
                current.neighbors = getNeighbors(current);
            }

            for (const neighbor of current.neighbors) {
                // If the neighbor has already been checked, then no need to check again.
                const isClosed = closedSet.find(n => n.id === neighbor.id) != null;

                if (!isClosed) {
                    neighbor.cost = this.getTicksBetweenObjects(1, [current, neighbor], 1) // Carrier speed does not matter since we are evaluating only one carrier here

                    // Calculate what the next cost will be, we don't want to check
                    // any paths that lead us to more cost.
                    const nextCost = current.costFromStart + neighbor.cost;

                    // But if we haven't tried this path, enqueue it.
                    const isOpen = openSet.find(n => n.id === neighbor.id) != null;

                    if (!isOpen) {
                        openSet.push(neighbor);
                    } else if (nextCost >= neighbor.costFromStart) {
                        continue;
                    }

                    // Calculate the final cost from the start to the end
                    // while updating the path taken.
                    neighbor.costFromStart = nextCost;
                    neighbor.parent = current;
                }
            }
        }
        return [];
    }

    rotateCarrierTowardsWaypoint(carrier: Carrier, stars: Star[], graphics: Sprite) {
        // If the carrier has waypoints, get the first one and calculate the angle
        // between the carrier's current position and the destination.
        if (carrier.waypoints.length) {
            const waypoint = carrier.waypoints[0];
            const starDestination = stars.find(s => s.id === waypoint.destination);

            if (!starDestination) {
                const sourceStar = stars.find(s => s.id === waypoint.source);
                if (!sourceStar) {
                    return;
                }

                const angle = this.getAngleTowardsLocation(carrier.location, sourceStar.location);
                graphics.angle = (angle * (180 / Math.PI)) - 90;
                return;
            }

            const destination = starDestination.location;

            const angle = this.getAngleTowardsLocation(carrier.location, destination);

            graphics.angle = (angle * (180 / Math.PI)) + 90;
        }
    }

    getLocationBetweenLocations(source: Location, destination: Location, progress: number): Location {
        return {
            x: (source.x + destination.x) * progress,
            y: (source.y + destination.y) * progress
        }
    }

    getEffectiveTechs(mapObject: Star | Carrier) {
        if (mapObject.playerId == null) return null;
        const owner = this.getPlayerById(mapObject.playerId);
        if (owner == null) return null;
        const baseTechs = owner.technologies;
        if (baseTechs == null) {
            throw new Error(`Player ${JSON.stringify(owner)} has a null technologies value!`);
        }
        const modifiers = mapObject.specialist?.modifiers;
        const blackHoleModifier = (mapObject as any)?.isBlackHole != null ? ((mapObject as any).isBlackHole === true ? 3 : 0) : 0;
        let isDeadStar = false;
        if ((mapObject as any).naturalResources != null) {
            isDeadStar = (mapObject as any)?.naturalResources?.economy + (mapObject as any)?.naturalResources?.industry + (mapObject as any)?.naturalResources?.science === 0;
        }

        return {
            scanning: isDeadStar ? 0 : Math.max(baseTechs.scanning + (modifiers?.local?.scanning || 0) + blackHoleModifier, 1),
            hyperspace: Math.max(baseTechs.hyperspace + (modifiers?.local?.hyperspace || 0), 1),
            terraforming: Math.max(baseTechs.terraforming + (modifiers?.local?.terraforming || 0), 1),
            weapons: Math.max(baseTechs.weapons + (modifiers?.local?.weapons || 0), 1),
            trueWeapons: baseTechs.weapons + (modifiers?.local?.weapons || 0),
            manufacturing: Math.max(baseTechs.manufacturing + (modifiers?.local?.manufacturing || 0), 1)
        };
    }

    getOriginalCapitalOwner(capitalStar: Star) {
        if (!capitalStar.homeStar) throw new Error(`Cannot get original capital star owner of non-capital star ${capitalStar}!`);
        return this._getGalaxy().players.find((p) => p.homeStarId === capitalStar.id);
    }

    isDeadStar(star: Star) {
        return star.naturalResources.economy + star.naturalResources.industry + star.naturalResources.science === 0;
    }

    selectionPlayers(addNull: boolean = true) {
        const selection: { id: string | null, alias: string }[] = [];
        if (addNull) selection.push({ id: null, alias: '(none)' });
        for (const player of this._getGalaxy().players) {
            selection.push({
                id: player.id,
                alias: player.alias ? player.alias : player.id
            });
        }
        return selection;
    }

    selectionSpecialists(specialists: Specialist[]) {
        const selection: { id: number | null, name: string }[] = [];
        selection.push({ id: null, name: '(none)' });
        for (const specialist of specialists) {
            selection.push({
                id: specialist.id,
                name: specialist.name
            });
        }
        return selection;
    }

    calculateTerraformedResources(star: Star, terraforming: number): TerraformedResources {
        return {
            economy: this.calculateTerraformedResource(star.naturalResources.economy, terraforming),
            industry: this.calculateTerraformedResource(star.naturalResources.industry, terraforming),
            science: this.calculateTerraformedResource(star.naturalResources.science, terraforming)
        }
    }

    calculateTerraformedResource(naturalResource: number, terraforming: number) {
        if (naturalResource === 0) return 0;
        return Math.floor(naturalResource + (5 * terraforming));
    }

    progressAlongPathToLocation(progress: number, sourceLoc: Location, destinationLoc: Location): Location {
        return { x: sourceLoc.x + (destinationLoc.x - sourceLoc.x) * progress, y: sourceLoc.y + (destinationLoc.y - sourceLoc.y) * progress };
    }

    locationToProgressAlongPath(location: Location, sourceLoc: Location, destinationLoc: Location) {
        const deltaX = destinationLoc.x - sourceLoc.x;
        const deltaY = destinationLoc.y - sourceLoc.y;

        let progress: number;
        if (deltaX > deltaY) {
            progress = (location.x - sourceLoc.x) / deltaX;
        } else {
            progress = (location.y - sourceLoc.y) / deltaY;
        }
        if (Number.isNaN(progress)) progress = 1;

        return progress;
    }

    getTicksToArrival(carrier: Carrier, isWarp: boolean, progress?: number) {
        if (progress == null) progress = carrier.progress;
        if (carrier.waypoints.length === 0 || progress == null) return;
        // If source and destination are the same, it always takes 1 tick when progress < 1
        if (carrier.waypoints[0].source === carrier.waypoints[0].destination) return progress !== 1 ? 1 : 0;
        const sourceStar = this.getStarById(carrier.waypoints[0].source);
        const destinationStar = this.getStarById(carrier.waypoints[0].destination);
        if (sourceStar == null || destinationStar == null) {
            throw new Error(`Cannot get waypoint distance of carrier ${carrier.id}: invalid source and/or destination of waypoint!`);
        }
        if (this.isStarPairWormHole(sourceStar, destinationStar)) return progress !== 1 ? 1 : 0;
        const baseSpeed = storage.getSettings().carriers.baseCarrierSpeed;
        let speedModifier = carrier.specialist?.modifiers.local?.speed;
        if (speedModifier == null) speedModifier = 1;
        if (isWarp) speedModifier = speedModifier * GalaxyMap.warpSpeedMultiplier;
        const remainingDistance = this.getDistanceBetweenLocations(sourceStar.location, destinationStar.location) * (1 - progress);
        return this.getTicksByDistance(baseSpeed, remainingDistance, speedModifier);
    }

    getPlayerStarCount(playerId: string) {
        return this.getPlayerStars(playerId).length;
    }

    getPlayerShipCount(playerId: string) {
        let ships = 0;
        this.getPlayerCarriers(playerId).forEach(c => ships += c.ships);
        this.getPlayerStars(playerId).forEach(s => ships += Math.floor(s.shipsActual));
        return ships;
    }

    getPlayerCarrierCount(playerId: string) {
        return this.getPlayerCarriers(playerId).length;
    }

    getPlayerCapitalCount(playerId: string) {
        return this._getGalaxy().stars.filter(s => s.homeStar && s.playerId === playerId).length;
    }

    playerIsKingOfTheHill(playerId: string) {
        return this._getGalaxy().stars.filter(s => s.playerId === playerId && s.isKingOfTheHillStar === true).length > 0; // Array should have no more than 1 element
    }

    getPlayerSpecialistCount(playerId: string) {
        let specialists = 0;
        specialists += this.getPlayerCarriers(playerId).filter(c => c.specialist != null).length;
        specialists += this.getPlayerStars(playerId).filter(s => s.specialist != null).length;
        return specialists;
    }

    getPlayerInfrastructureCounts(playerId: string) {
        let economy = 0;
        let industry = 0;
        let science = 0;
        this.getPlayerStars(playerId).forEach(s => {
            economy += (s.infrastructure.economy || 0);
            industry += (s.infrastructure.industry || 0);
            science += (s.infrastructure.science || 0);
        });
        return { economy: economy, industry: industry, science: science };
    }

    getSortedLeaderboardPlayerList(players: Player[], sortMode: string) {
        let sortPlayers;

        switch (sortMode) {
            case 'conquest':
                sortPlayers = (a: Player, b: Player) => {
                    const aStarCount = this.getPlayerStarCount(a.id);
                    const bStarCount = this.getPlayerStarCount(b.id);
                    const aShipCount = this.getPlayerShipCount(a.id);
                    const bShipCount = this.getPlayerShipCount(b.id);
                    const aCarrierCount = this.getPlayerCarrierCount(a.id);
                    const bCarrierCount = this.getPlayerCarrierCount(b.id);

                    // Sort by total stars descending
                    if (aStarCount > bStarCount) return -1;
                    if (aStarCount < bStarCount) return 1;

                    // Then by total ships descending
                    if (aShipCount > bShipCount) return -1;
                    if (aShipCount < bShipCount) return 1;

                    // Then by total carriers descending
                    if (aCarrierCount > bCarrierCount) return -1;
                    if (aCarrierCount < bCarrierCount) return 1;

                    return 0;
                }
                break;
            case 'capitalConquest':
                sortPlayers = (a: Player, b: Player) => {
                    const aStarCount = this.getPlayerStarCount(a.id);
                    const bStarCount = this.getPlayerStarCount(b.id);
                    const aShipCount = this.getPlayerShipCount(a.id);
                    const bShipCount = this.getPlayerShipCount(b.id);
                    const aCarrierCount = this.getPlayerCarrierCount(a.id);
                    const bCarrierCount = this.getPlayerCarrierCount(b.id);
                    const aCapitalCount = this.getPlayerCapitalCount(a.id);
                    const bCapitalCount = this.getPlayerCapitalCount(b.id);

                    if (aCapitalCount > bCapitalCount) return -1;
                    if (aCapitalCount < bCapitalCount) return 1;

                    if (aStarCount > bStarCount) return -1;
                    if (aStarCount < bStarCount) return 1;

                    if (aShipCount > bShipCount) return -1;
                    if (aShipCount < bShipCount) return 1;

                    if (aCarrierCount > bCarrierCount) return -1;
                    if (aCarrierCount < bCarrierCount) return 1;

                    return 0;
                }
                break;
            case 'kingOfTheHill':
                sortPlayers = (a: Player, b: Player) => {
                    const aStarCount = this.getPlayerStarCount(a.id);
                    const bStarCount = this.getPlayerStarCount(b.id);
                    const aShipCount = this.getPlayerShipCount(a.id);
                    const bShipCount = this.getPlayerShipCount(b.id);
                    const aCarrierCount = this.getPlayerCarrierCount(a.id);
                    const bCarrierCount = this.getPlayerCarrierCount(b.id);

                    if (this.playerIsKingOfTheHill(a.id)) return -1;
                    if (this.playerIsKingOfTheHill(b.id)) return 1;

                    if (aStarCount > bStarCount) return -1;
                    if (aStarCount < bStarCount) return 1;

                    if (aShipCount > bShipCount) return -1;
                    if (aShipCount < bShipCount) return 1;

                    if (aCarrierCount > bCarrierCount) return -1;
                    if (aCarrierCount < bCarrierCount) return 1;

                    return 0;
                }
                break;
            default:
            case 'id':
                sortPlayers = (a: Player, b: Player) => {
                    if (a.id.toLowerCase() < b.id.toLowerCase()) return -1;
                    if (a.id.toLowerCase() > b.id.toLowerCase()) return 1;

                    return 0;
                }
        }
        return players.sort(sortPlayers);
    }

    getSortedLeaderboardTeamList(sortMode: string) {
        const teams = useGalaxyStore().$state.galaxy.teams;
        if (teams == null) return;

        const teamsWithData = teams.map(team => {
            let players = team.players.map(playerId => this.getPlayerById(playerId)!);

            players = this.getSortedLeaderboardPlayerList(players, sortMode);

            let totalStars = 0;
            let totalHomeStars = 0;
            let totalShips = 0;
            let totalCarriers = 0;
            let isKingOfTheHillTeam = false;

            for (const player of players) {
                totalStars += this.getPlayerStarCount(player.id);
                totalHomeStars += this.getPlayerCapitalCount(player.id);
                totalShips += this.getPlayerShipCount(player.id);
                totalCarriers += this.getPlayerCarrierCount(player.id);
                if (this.playerIsKingOfTheHill(player.id)) isKingOfTheHillTeam = true;
            }

            return {
                team,
                players,
                totalStars,
                totalHomeStars,
                totalShips,
                totalCarriers,
                isKingOfTheHillTeam
            }
        });

        let sortTeams;
        switch (sortMode) {
            case 'conquest':
                teamsWithData.sort((a, b) => {
                    if (a.totalStars > b.totalStars) return -1;
                    if (a.totalStars < b.totalStars) return 1;

                    if (a.totalShips > b.totalShips) return -1;
                    if (a.totalShips < b.totalShips) return 1;

                    if (a.totalCarriers > b.totalCarriers) return -1;
                    if (a.totalCarriers < b.totalCarriers) return 1;

                    return 0;
                });
                break;
            case 'capitalConquest':
                teamsWithData.sort((a, b) => {
                    if (a.totalHomeStars > b.totalHomeStars) return -1;
                    if (a.totalHomeStars < b.totalHomeStars) return 1;

                    if (a.totalStars > b.totalStars) return -1;
                    if (a.totalStars < b.totalStars) return 1;

                    if (a.totalShips > b.totalShips) return -1;
                    if (a.totalShips < b.totalShips) return 1;

                    if (a.totalCarriers > b.totalCarriers) return -1;
                    if (a.totalCarriers < b.totalCarriers) return 1;

                    return 0;
                });
                break;
            default:
            case 'kingOfTheHill':
                teamsWithData.sort((a, b) => {
                    if (a.isKingOfTheHillTeam) return -1;
                    if (b.isKingOfTheHillTeam) return 1;

                    if (a.totalStars > b.totalStars) return -1;
                    if (a.totalStars < b.totalStars) return 1;

                    if (a.totalShips > b.totalShips) return -1;
                    if (a.totalShips < b.totalShips) return 1;

                    if (a.totalCarriers > b.totalCarriers) return -1;
                    if (a.totalCarriers < b.totalCarriers) return 1;

                    return 0;
                });
                break;
            case 'id':
                teamsWithData.sort((a, b) => {
                    if (a.team.id.toLowerCase() < b.team.id.toLowerCase()) return -1;
                    if (a.team.id.toLowerCase() > b.team.id.toLowerCase()) return 1;

                    return 0;
                });
                break;
        }
        return teamsWithData;
    }

    getUnusedColourShapeCombos() {
        let combos = usePlayerColourStore().getAllCombos();

        for (const player of this._getGalaxy().players) {
            combos = combos.filter(c => !(c.shape === player.shape && c.colour.value === player.colour.value));
        }
        return combos;
    }

    getRandomUnusedCombos(amount: number) {
        const combos = this.getUnusedColourShapeCombos();
        this.shuffleArray(combos);
        return combos.slice(0, amount);
    }

    shuffleArray(array: Array<any>) {
        for (let i = array.length - 1; i >= 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    getPlayerCarriers(playerId: string) {
        return this._getGalaxy().carriers.filter(c => c.playerId === playerId);
    }

    getPlayerStars(playerId: string) {
        return this._getGalaxy().stars.filter(s => s.playerId === playerId);
    }

    // Any carrier that is orbiting this star or is in transit and has this star as the source or destination of current waypoint
    getStarCarriers(starId: string) {
        const starCarriers: Carrier[] = [];
        for (const carrier of this._getGalaxy().carriers) {
            if (carrier.orbiting) {
                if (carrier.orbiting === starId) {
                    starCarriers.push(carrier);
                }
            } else {
                const waypoints = carrier.waypoints;
                if (waypoints == null || waypoints.length === 0) continue;
                if (waypoints[0].source === starId || waypoints[0].destination === starId) {
                    starCarriers.push(carrier);
                }
            }
        }
        return starCarriers;
    }

    getStarTranslationAffectedCarriers(starIds: Set<string>) {
        if (starIds.size === 0) return [];
        const affectedCarriers: { carrier: Carrier, affectedPositionInFlight: boolean }[] = [];
        for (const carrier of this._getGalaxy().carriers) {
            const waypoints = carrier.waypoints;

            if (carrier.orbiting) {
                if (starIds.has(carrier.orbiting)) {
                    affectedCarriers.push({ carrier: carrier, affectedPositionInFlight: false });
                    continue;
                }
            } else {
                if (waypoints == null || waypoints.length === 0) continue;
                if (starIds.has(waypoints[0].source) || starIds.has(waypoints[0].destination)) {
                    affectedCarriers.push({ carrier: carrier, affectedPositionInFlight: true });
                    continue;
                }
            }

            for (let i = 0; i < waypoints.length; i++) {
                if (starIds.has(waypoints[i].source) || starIds.has(waypoints[i].destination)) {
                    affectedCarriers.push({ carrier: carrier, affectedPositionInFlight: false });
                    continue;
                }
            }
        }
        return affectedCarriers;
    }

    generateNewStar(): Star {
        const brushSettings = storage.getSettings().brush;
        return {
            id: 'null',
            homeStar: false,
            playerId: null,
            warpGate: brushSettings.newHasWarpGate,
            isNebula: brushSettings.newIsNebula,
            isAsteroidField: brushSettings.newIsAsteroidField,
            isBinaryStar: brushSettings.newIsBinary,
            isBlackHole: brushSettings.newIsBlackHole,
            isPulsar: brushSettings.newIsPulsar,
            wormHoleToStarId: null,
            specialistId: brushSettings.newSpecialist,
            specialist: brushSettings.newSpecialist ? useSpecialistsStore().getStarSpecialistById(brushSettings.newSpecialist) : undefined,
            specialistExpireTick: brushSettings.newSpecialist ? brushSettings.newSpecialistExpireTick : null,
            location: {
                x: 0,
                y: 0
            },
            naturalResources: {
                economy: brushSettings.newEconomyResources,
                industry: brushSettings.newIndustryResources,
                science: brushSettings.newScienceResources
            },
            shipsActual: 0,
            ships: 0,
            infrastructure: {
                economy: brushSettings.newEconomyInfrastructure,
                industry: brushSettings.newIndustryInfrastructure,
                science: brushSettings.newScienceInfrastructure
            }
        }
    }

    generateNewPlayer(): Player {
        const playerSettings = storage.getSettings().players;

        return {
            id: 'null',
            homeStarId: null,
            colour: {
                alias: 'null',
                value: '#ffffff'
            },
            shape: 'circle',
            technologies: {
                scanning: playerSettings.newTechnology.scanning,
                hyperspace: playerSettings.newTechnology.hyperspace,
                terraforming: playerSettings.newTechnology.terraforming,
                experimentation: playerSettings.newTechnology.experimentation,
                weapons: playerSettings.newTechnology.weapons,
                banking: playerSettings.newTechnology.banking,
                manufacturing: playerSettings.newTechnology.manufacturing,
                specialists: playerSettings.newTechnology.specialists
            },
            credits: playerSettings.newCredits,
            creditsSpecialists: playerSettings.newCreditsSpecialists
        };
    }

    generateNewCarrierAtStar(star: Star) {
        const carrierSettings = storage.getSettings().carriers;

        const newCarrier: Carrier = {
            id: useGalaxyStore().getLowestValidCarrierId().toString(),
            orbiting: star.id,
            waypointsLooped: false,
            ships: carrierSettings.defaultCarrierShips,
            isGift: false,
            playerId: star.playerId!,
            specialistId: carrierSettings.defaultCarrierSpecialist,
            specialistExpireTick: carrierSettings.defaultCarrierSpecialist ? carrierSettings.defaultCarrierSpecialistExpireTick : null,
            specialist: carrierSettings.defaultCarrierSpecialist ? useSpecialistsStore().getCarrierSpecialistById(carrierSettings.defaultCarrierSpecialist) : undefined,
            waypoints: [],
            location: star.location
        };

        return newCarrier;
    }

    randomIntBetween(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    getSnappedLocation(cursorPos: Location, snapMode: string, selectedStarLoc?: Location, r?: number, snapSteps?: number, offset?: number) {
        if (snapMode === 'off' || selectedStarLoc == null || r == null || snapSteps == null || offset == null) {
            return cursorPos;
        }

        const angle = this.getAngleTowardsLocation(selectedStarLoc, cursorPos);

        if (snapMode === 'radius_only') {
            return { x: selectedStarLoc.x + r * Math.cos(angle), y: selectedStarLoc.y + r * Math.sin(angle) };
        }

        if (snapMode === 'radius_and_angle') {
            const percentage = (angle - offset) / (2.0 * Math.PI);
            const stepNumber = Math.round(percentage * snapSteps);
            const outputAngle = stepNumber * (2.0 * Math.PI) / snapSteps + offset;
            return { x: selectedStarLoc.x + r * Math.cos(outputAngle), y: selectedStarLoc.y + r * Math.sin(outputAngle) };
        }

        throw new Error(`Invalid snap mode '${snapMode}'!`);
    }

    getLocalLocation(input: { x: number, y: number }, from: { x: number, y: number }) {
        return { x: input.x - from.x, y: input.y - from.y };
    }

    getRotatedLocation(input: { x: number, y: number }, rotation: number) {
        return {
            x: input.x * Math.cos(rotation) - input.y * Math.sin(rotation),
            y: input.y * Math.cos(rotation) + input.x * Math.sin(rotation)
        };
    }

    isWaypointDistanceValid(carrier: Carrier, waypoint: CarrierWaypoint) {
        const sourceStar = this.getStarById(waypoint.source);
        const destinationStar = this.getStarById(waypoint.destination);
        if (sourceStar == null || destinationStar == null) {
            throw new Error(`Cannot get waypoint distance of carrier ${carrier.id}: invalid source and/or destination of waypoint!`);
        }
        if (this.isStarPairWormHole(sourceStar, destinationStar)) return true;
        return this.getHyperspaceDistance(carrier) >= this.getDistanceBetweenLocations(sourceStar.location, destinationStar.location);
    }

    getStarNameOrId(starId: string) {
        const star = this.getStarById(starId);
        if (star == null) return;
        return star.name ? star.name : star.id;
    }

    getGeneratorById(id: GeneratorType['id']) {
        return GeneratorTypes.find(g => g.id === id)!;
    }

    getRandomAngle(): number {
        return Math.random() * Math.PI * 2;
    }

    getRandomRadius(maxRadius: number, offset: number): number {
        return maxRadius * Math.random() ** offset;
    }

    getRandomRadiusInRange(minRadius: number, maxRadius: number): number {
        return (Math.random() * (maxRadius ** 2 - minRadius ** 2) + minRadius ** 2) ** 0.5;
    }

    getRandomPositionInCircle(maxRadius: number, offset: number = 0.5): Location {
        let angle = this.getRandomAngle();
        let radius = this.getRandomRadius(maxRadius, offset);

        return {
            x: Math.cos(angle) * radius,
            y: Math.sin(angle) * radius
        };
    }

    getRandomPositionInDoughnut(minRadius: number, maxRadius: number): Location {
        let angle = this.getRandomAngle();
        let radius = this.getRandomRadiusInRange(minRadius, maxRadius)

        return {
            x: Math.cos(angle) * radius,
            y: Math.sin(angle) * radius
        };
    }

    isLocationTooClose(location: Location, otherLocation: Location) {
        const distance = this.getDistanceBetweenLocations(location, otherLocation);

        return distance < storage.getSettings().generation.minDistanceBetweenStars;
    }

    isLocationTooCloseToOthers(location: Location, locations: Location[]) {
        return locations.find(l => this.isLocationTooClose(location, l)) != null;
    }

    getMaxSelectionDiameter(locations: Location[]) {
        // This is a more accurate approach
        /*
        const center = helper.calculateSelectionCentroid(locations);
        const diameter = helper.calculateSelectionRadiusFromPoint(locations, center) * 2;
        */

        // This is what Solaris uses, so it will be used here as well
        const minX = this.calculateSelectionMinX(locations);
        const minY = this.calculateSelectionMinY(locations);
        const maxX = this.calculateSelectionMaxX(locations);
        const maxY = this.calculateSelectionMaxY(locations);
        const diameterX = maxX - minX;
        const diameterY = maxY - minY;
        const diameter = diameterX > diameterY ? diameterX : diameterY;

        return diameter;
    }

    getClosestLocations(loc: Location, locs: Location[], amount: number): Location[] {
        let sorted = locs
            .filter(a => a.x !== loc.x && a.y !== loc.y) // Ignore the location passed in if it exists in the array.
            .sort((a, b) => {
                return this.getDistanceBetweenLocations(loc, a)
                    - this.getDistanceBetweenLocations(loc, b);
            });

        return sorted.slice(0, amount);
    }
}

export default new HelperService();
