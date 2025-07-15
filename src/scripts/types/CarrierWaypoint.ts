export const CarrierWaypointActionTypes = ['nothing', 'collectAll', 'dropAll', 'collect', 'drop', 'collectAllBut', 'dropAllBut', 'dropPercentage', 'collectPercentage', 'garrison'] as const;

export type CarrierWaypointActionType = typeof CarrierWaypointActionTypes[number];

export interface CarrierWaypointBase {
    source: string;
    destination: string;
    action: CarrierWaypointActionType;
    actionShips: number;
    delayTicks: number;
};

export interface CarrierWaypoint extends CarrierWaypointBase {
    ticks?: number;
    warpTicks?: number;
};