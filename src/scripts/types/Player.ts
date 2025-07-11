export type PlayerShape = 'circle' | 'square' | 'diamond' | 'hexagon';

export interface PlayerColour {
    alias?: string;
    value: string;
};

export interface PlayerTechnologyLevels {
    scanning: number;
    hyperspace: number;
    terraforming: number;
    experimentation: number;
    weapons: number;
    banking: number;
    manufacturing: number;
    specialists: number;
};

export interface Player {
    id: string;
    homeStarId: string | null;
    alias?: string;
    colour: PlayerColour;
    shape: PlayerShape;
    credits?: number;
    creditsSpecialists?: number;
    technologies: PlayerTechnologyLevels;
}