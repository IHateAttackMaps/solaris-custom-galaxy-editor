import { Circle, Container, Graphics } from "pixi.js";
import { EventEmitter } from "events";
import GalaxyMap from './map';
import type { RulerPoint } from './types/RulerPoint';
import helper from './helper';

class RulerService extends EventEmitter {
    container: Container;

    lightYearDistance: number;
    rulerPoints: RulerPoint[];

    onRulerPointCreatedHandler: any;
    onRulerPointsClearedHandler: any;
    onRulerPointRemovedHandler: any;


    constructor() {
        super();

        this.container = new Container();
        this.container.hitArea = new Circle(0, 0, 0);

        this.lightYearDistance = GalaxyMap.lightYearDistance;
        this.rulerPoints = [];
    }

    setup() {
        this.rulerPoints = [];

        this.emit('onRulerPointsCleared');

        this.clear();
    }

    clear() {
        this.container.removeChildren();
    }

    draw() {
        this.clear();

        this.drawPaths();
        this.drawHyperspaceRange();
    }

    drawPaths() {
        if (!this.rulerPoints.length) {
            return;
        }

        // Draw all paths to each ruler point
        const graphics = new Graphics();

        // Start the line from where the first point is.
        const firstPoint = this.rulerPoints[0];
        graphics.moveTo(firstPoint.location.x, firstPoint.location.y);

        // Draw a line to each other point
        for (let i = 1; i < this.rulerPoints.length; i++) {
            const point = this.rulerPoints[i];

            graphics.lineTo(point.location.x, point.location.y);
            graphics.stroke({ width: 1, color: 0xFFFFFF, alpha: 0.8 });
        }

        this.container.addChild(graphics);
    }

    drawHyperspaceRange() {
        const lastPoint = this.rulerPoints[this.rulerPoints.length - 1];

        if (!lastPoint) {
            return;
        }

        let techLevel = 1;
        let radius = 0;
        const originObject = this.rulerPoints[0].object;

        if (originObject.playerId != null) {
            const graphics = new Graphics();
            const effectiveTechs = helper.getEffectiveTechs(originObject);
            if (this.rulerPoints[0].type === 'carrier' && effectiveTechs != null) {
                techLevel = effectiveTechs.hyperspace;
                radius = ((techLevel || 1) + 1.5) * this.lightYearDistance;
            } else {
                const originObjectOwner = helper.getPlayerById(originObject.playerId);
                if (originObjectOwner != null) {
                    techLevel = originObjectOwner.technologies.hyperspace;
                    radius = ((techLevel || 1) + 1.5) * this.lightYearDistance;
                }
            }

            graphics.star(lastPoint.location.x, lastPoint.location.y, radius, radius, radius - 3);
            graphics.fill({ color: 0xFFFFFF, alpha: 0.075 });
            graphics.stroke({ width: 1, color: 0xFFFFFF, alpha: 0.2 });
            graphics.zIndex = -1;

            this.container.addChild(graphics);
        }
    }

    onStarClicked(e: any) {
        this._createRulerPoint({
            type: 'star',
            object: e,
            location: e.location
        });
    }

    onCarrierClicked(e: any) {
        this._createRulerPoint({
            type: 'carrier',
            object: e,
            location: e.location
        });
    }

    removeLastRulerPoint() {
        const old = this.rulerPoints.pop();

        this.draw();

        this.emit('onRulerPointRemoved', old);
    }

    _createRulerPoint(desiredPoint: RulerPoint) {
        const lastPoint = this.rulerPoints[this.rulerPoints.length - 1];

        if (lastPoint &&
            lastPoint.location.x === desiredPoint.location.x &&
            lastPoint.location.y === desiredPoint.location.y) {
            return;
        }

        desiredPoint.distance = this.rulerPoints.push(desiredPoint);

        this.draw();

        this.emit('onRulerPointCreated', desiredPoint);
    }
}

export default RulerService;