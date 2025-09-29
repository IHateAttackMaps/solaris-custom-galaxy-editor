import RNG, { type RandomSeed } from 'random-seed';
import storage from "../storage";
import type { MapGenerator } from "../types/Generator";
import type { Location } from "../types/Location";
import helper from '../helper';

class CircularBalancedMapGenerator implements MapGenerator {
    _generateStarPositionInSector(currentRadius: number, rng: RandomSeed, playerCount: number) {
        const tau = 2.0 * Math.PI;
        let angle = rng.random() * (tau / playerCount);
        //let angle = (tau/playerCount);
        let posx = 0;
        let posy = currentRadius / 2.0 + rng.random() * (currentRadius * 2.0);

        return {
            x: Math.cos(angle) * posx + Math.sin(angle) * posy,
            y: Math.sin(angle) * -posx + Math.cos(angle) * posy,
            linked: false
        };
    }

    _getRotatedLocation(location: Location, angle: number) {
        return {
            ...helper.getRotatedLocation(location, -angle),
            homeStar: null,
            distanceToClosestReachable: null,
            closestReachable: null,
            linkedLocations: []
        };
    }

    generateLocations(playerCount: number, starsPerPlayer: number, seed?: string | null, startingStars?: number, initialHyperspaceRange?: number) {
        if (!startingStars) throw new Error(`Starting star count must be provided for the Circular Balanced generator!`);
        if (!initialHyperspaceRange) throw new Error(`Minimum hyperspace range must be provided for the Circular Balanced generator!`);
        if (!seed) seed = (Math.random() * (10 ** 8)).toFixed(0);

        const locations: any[] = [];
        const rng = RNG.create(seed);
        const tau = 2.0 * Math.PI;

        const starCount = playerCount * starsPerPlayer;
        const minDistanceBetweenStars = storage.getSettings().generation.minDistanceBetweenStars;
        let currentRadius = minDistanceBetweenStars;
        let radiusStep = minDistanceBetweenStars;
        let maxTries = 2;
        let sectorAngle = tau / playerCount;

        do {
            let createdLocations = false;

            // Try to find a set of locations X number of times.
            // if a location is rejected, all locations on this set are rejected aswell
            // otherwise, all are accepted
            // this guarantees that evey sector is identical
            for (let i = 0; i < maxTries; i++) {
                let candidateLocations: any[] = [];
                let baseLocation = this._generateStarPositionInSector(currentRadius, rng, playerCount);
                let locationRejected = false;

                for (let sectorIndex = 0; sectorIndex < playerCount; sectorIndex++) {
                    let location = this._getRotatedLocation(baseLocation, sectorIndex * sectorAngle);

                    // Stars must not be too close to eachother.
                    if ((helper.isLocationTooCloseToOthers(location, locations)) ||
                        (helper.isLocationTooCloseToOthers(location, candidateLocations))) {
                        locationRejected = true;
                        break;
                    }

                    candidateLocations.push(location);
                }

                if (locationRejected) { continue; }

                locations.push(...candidateLocations);
                createdLocations = true;
                break;
            }

            // If we didn't find a valid location, increase radius.
            if (!createdLocations) {
                currentRadius += radiusStep;
            }
        } while (locations.length < starCount);

        // choose home stars

        // The desired distance from the center is half way from the galaxy center and the edge.
        const distanceFromCenter = helper.getMaxSelectionDiameter(locations) / 2 / 2;
        let playerAngle = (sectorAngle / 2.0);//take a location from the middle of the sector
        let desiredLocation = this._getRotatedLocation({ x: 0.0, y: distanceFromCenter }, playerAngle);
        let firstHomeLocation = helper.getClosestLocations(desiredLocation, locations, 1)[0];
        let firstHomeLocationIndex = locations.indexOf(firstHomeLocation);

        for (let i = 0; i < playerCount; i++) {
            let locationIndex = (firstHomeLocationIndex + i);
            locations[locationIndex].homeStar = true;
        }

        let homeLocations = locations.filter((location) => { return location.homeStar; });
        let startingStarsCount = startingStars - 1;

        for (let homeLocation of homeLocations) {
            homeLocation.linkedLocations = [];
        }

        let unlinkedLocations = locations.filter((loc) => { return !loc.homeStar; });

        while (startingStarsCount--) {
            for (let homeLocation of homeLocations) {
                let closestUnlinkedLocation = helper.getClosestLocations(homeLocation, unlinkedLocations, 1)[0] as any;
                homeLocation.linkedLocations.push(closestUnlinkedLocation);
                closestUnlinkedLocation.linked = true;
                unlinkedLocations = unlinkedLocations.filter((loc) => { return loc !== closestUnlinkedLocation; });
            }
        }

        // pull the closest stars that will be linked so they are in hyper range
        let minimumClaimDistance = helper.getHyperspaceDistanceByLevel(initialHyperspaceRange) - 2; //-2 to avoid floating point imprecisions

        for (let homeLocation of homeLocations) {
            let reachableLocations: any[] = [];
            let unreachebleLocations: any[] = [];

            reachableLocations.push(homeLocation);

            for (let location of homeLocation.linkedLocations) {
                unreachebleLocations.push(location);
            }

            while (unreachebleLocations.length > 0) {
                //find the unreachable location that is closer to any of the reachable locations
                for (let unreachebleLocation of unreachebleLocations) {
                    let distanceToClosestReachable;
                    let closestReachableLocation;
                    let smallestDistance = Number.MAX_VALUE;

                    for (let reachableLocation of reachableLocations) {
                        let distance = helper.getDistanceBetweenLocations(unreachebleLocation, reachableLocation);

                        if (distance < smallestDistance) {
                            smallestDistance = distance;
                            distanceToClosestReachable = distance;
                            closestReachableLocation = reachableLocation;
                        }
                    }

                    unreachebleLocation.distanceToClosestReachable = distanceToClosestReachable;
                    unreachebleLocation.closestReachable = closestReachableLocation;
                }

                let closestUnreachable = unreachebleLocations[0];

                for (let unreachebleLocation of unreachebleLocations) {
                    if (unreachebleLocation.distanceToClosestReachable! < closestUnreachable.distanceToClosestReachable!) {
                        closestUnreachable = unreachebleLocation;
                    }
                }

                helper.moveLocationTowards(closestUnreachable, closestUnreachable.closestReachable!, minimumClaimDistance);

                // after moving closer we can change the location from the unreachable to the reachable array
                unreachebleLocations.splice(unreachebleLocations.indexOf(closestUnreachable), 1);
                reachableLocations.push(closestUnreachable);
            }

            //now all linked stars should be reachable
        }

        return locations;
    }
}

export default new CircularBalancedMapGenerator();