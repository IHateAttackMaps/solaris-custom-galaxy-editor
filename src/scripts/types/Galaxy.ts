import type { Carrier } from "./Carrier";
import type { Player } from "./Player";
import type { Star } from "./Star";
import type { Team } from "./Team";

export interface Galaxy {
    players: Player[];
    stars: Star[];
    carriers: Carrier[];
    teams?: Team[];
}