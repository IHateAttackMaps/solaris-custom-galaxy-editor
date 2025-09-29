import RNG, { type RandomSeed } from "random-seed";

export default class SeededRandomGen {
    private rg: RandomSeed;

    constructor(seed: string) {
        this.rg = RNG.create(seed);
        this.random = this.random.bind(this);
    }

    getRandomNumber(max: number): number {
        return Math.floor(this.random() * (max + 1))
    }

    getRandomNumberBetween(min: number, max: number): number {
        return Math.floor(this.random() * (max - min + 1) + min);
    }

    random(): number {
        return this.rg.random();
    }
}