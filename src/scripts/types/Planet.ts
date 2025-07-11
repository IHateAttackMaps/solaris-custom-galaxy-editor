import type { Container } from "pixi.js";

export interface Planet {
    index: number;
    container: Container;
    rotationSpeed: number;
    rotationDirection: boolean;
}