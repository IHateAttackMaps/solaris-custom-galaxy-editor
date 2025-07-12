import type { CarrierWaypoint } from "./CarrierWaypoint";
import type { MapObject } from "./MapObject";
import type { Specialist } from "./Specialist";

export interface Carrier extends MapObject {
    orbiting: string | null;
    waypointsLooped: boolean;
    ships: number;
    specialistId: number | null;
    specialistExpireTick: number | null;
    specialist?: Specialist;
    isGift: boolean;
    waypoints: CarrierWaypoint[];
    playerId: string;
    progress?: number;
    name?: string;
};