import type { Location } from "./Location";

export interface GeneratorOutput extends Location {
    linked?: boolean;
    linkedLocations?: GeneratorOutput[];
    homeStar?: boolean;
}

export interface MapGenerator {
    generateLocations: (playerCount: number, starsPerPlayer: number, seed?: string | null, startingStars?: number, initialHyperspaceRange?: number) => GeneratorOutput[];
}

export const GeneratorTypes = [
    { id: 'circular', name: 'Circular', requiresSeed: false, requiresStartingStars: false, requiresHyperspaceRange: false, usesLinkedLocations: false },
    { id: 'circularBalanced', name: 'Circular Balanced', requiresSeed: true, requiresStartingStars: true, requiresHyperspaceRange: true, usesLinkedLocations: true },
    { id: 'doughnut', name: 'Doughnut', requiresSeed: false, requiresStartingStars: false, requiresHyperspaceRange: false, usesLinkedLocations: false },
    { id: 'irregular', name: 'Irregular', requiresSeed: true, requiresStartingStars: true, requiresHyperspaceRange: true, usesLinkedLocations: true },
    { id: 'spiral', name: 'Spiral', requiresSeed: true, requiresStartingStars: false, requiresHyperspaceRange: false, usesLinkedLocations: false }
] as const;

export type GeneratorType = typeof GeneratorTypes[number];

export type PlayerDistribution = 'circular' | 'circularSequential' | 'random';