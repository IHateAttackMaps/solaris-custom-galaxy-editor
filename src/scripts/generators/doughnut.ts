import helper from "../helper";
import type { MapGenerator } from "../types/Generator";
import type { Location } from "../types/Location";

class DoughnutMapGenerator implements MapGenerator {
    generateLocations(playerCount: number, starsPerPlayer: number) {
        const starCount = playerCount * starsPerPlayer;
        // The starDensity constant can really be a setting, once it is turned into an intuitive variable...
        const starDensity = 1.3 * 10 ** -4;
        const maxRadius = ((4 * starCount) / (3 * Math.PI * starDensity)) ** 0.5;
        const locations: Location[] = [];

        // Generating locations for each star on the map
        do {
            // Try and find a suitable position for star X
            while (true) {
                const location = helper.getRandomPositionInDoughnut(0.5 * maxRadius, maxRadius);

                if (!helper.isLocationTooCloseToOthers(location, locations)) {
                    locations.push(location);
                    break;
                }
            }

        } while (locations.length < starCount);

        return locations;
    }
}

export default new DoughnutMapGenerator();