import type { Location } from "./Location";

export interface Tooltip {
    playerId: string;
    location: Location;
    detail: string[];
    offset: {
        relative: boolean;
        x: number;
        y: number;
    }
}