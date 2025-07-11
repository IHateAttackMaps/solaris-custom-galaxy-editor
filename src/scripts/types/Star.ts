import type { MapObject } from "./MapObject";
import type { PlayerTechnologyLevels } from "./Player";
import type { Specialist } from "./Specialist";

export interface NaturalResources {
    economy: number;
    industry: number;
    science: number;
};

export type TerraformedResources = NaturalResources;

export type InfrastructureType = 'economy' | 'industry' | 'science';

export interface Infrastructure {
    economy: number | null;
    industry: number | null;
    science: number | null;
};

export interface Star extends MapObject {
    naturalResources: NaturalResources;
    terraformedResources?: TerraformedResources;
    playerId?: string | null;
    ships: number | null;
    shipsActual: number;
    specialistId: number | null;
    specialistExpireTick: number | null;
    homeStar: boolean;
    warpGate: boolean;
    isNebula: boolean;
    isAsteroidField: boolean;
    isBinaryStar: boolean;
    isBlackHole: boolean;
    isPulsar: boolean;
    wormHoleToStarId: string | null;
    infrastructure: Infrastructure;
    isKingOfTheHillStar?: boolean;
    specialist?: Specialist | null;
    targeted?: boolean;
    manufacturing?: number;
    effectiveTechs?: PlayerTechnologyLevels;
    name?: string
}