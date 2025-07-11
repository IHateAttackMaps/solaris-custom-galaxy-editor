import { Container, Graphics } from 'pixi.js';
import { useGalaxyStore } from '@/stores/galaxy';

class WormHoleLayer {
    container: Container;

    constructor() {
        this.container = new Container();
    }

    _getGalaxy() {
        return useGalaxyStore().$state.galaxy;
    }

    setup() {

    }

    clear() {
        this.container.removeChildren();
    }

    draw() {
        this.clear();

        const stars = this._getGalaxy().stars.filter(s => s.wormHoleToStarId);

        for (const star of stars) {
            const starPair = stars.find(s => s.id === star.wormHoleToStarId && s.wormHoleToStarId === star.id);

            if (!starPair) {
                continue;
            }

            const graphics = new Graphics();

            const alpha = 0.1;
            const lineWidth = 5;

            graphics.moveTo(star.location.x, star.location.y);
            graphics.lineTo(starPair.location.x, starPair.location.y);
            graphics.stroke({ width: lineWidth, color: 0xFFFFFF, alpha: alpha });

            this.container.addChild(graphics);
        }
    }

}

export default WormHoleLayer