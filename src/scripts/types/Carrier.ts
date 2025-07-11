import type { CarrierWaypoint } from "./CarrierWaypoint";
import type { MapObject } from "./MapObject";
import type { Specialist } from "./Specialist";

export interface Carrier extends MapObject {
    orbiting: string | null;
    waypointsLooped: boolean;

    ships: number;
    specialistId: number | null;
    specialistExpireTick: number | null;
    specialist?: Specialist | null;
    isGift: boolean;
    waypoints: CarrierWaypoint[];
    playerId: string;
    progress?: number;
    name?: string;
};

export interface CarrierPosition {
    carrier: Carrier;
    source: string;
    destination: string;
    locationCurrent: Location;
    locationNext: Location;
    distanceToSourceCurrent: number;
    distanceToDestinationCurrent: number;
    distanceToSourceNext: number;
    distanceToDestinationNext: number;
};