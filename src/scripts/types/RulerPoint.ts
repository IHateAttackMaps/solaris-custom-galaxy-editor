import type { Carrier } from "./Carrier";
import type { Location } from "./Location";
import type { Star } from "./Star";

export interface RulerPoint {
    location: Location;
    distance?: number;
    type: 'star' | 'carrier';
    object: Star | Carrier;
}