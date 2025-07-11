import { Circle, Container, Graphics, Sprite } from "pixi.js";
import type { Location } from "./types/Location";
import TextureService from "./texture";
import type { Settings } from "./types/Settings";

class Brush {
    container: Container;

    graphics_brush_circle: Graphics | null;
    graphics_brush_square: Graphics | null;
    graphics_brush_point: Sprite | null;

    userSettings: Settings | null;

    constructor() {
        this.container = new Container();
        this.container.hitArea = new Circle(0, 0, 0);

        this.graphics_brush_circle = null;
        this.graphics_brush_square = null;
        this.graphics_brush_point = null;

        this.userSettings = null;
    }

    setup(userSettings: Settings) {
        this.userSettings = userSettings;
    }

    draw(radius: number, shape: string) {
        this.clear();

        if (radius === 0) {
            this._drawPoint();
            return;
        }

        switch (shape) {
            case 'circle':
                this._drawCircle(radius);
                break;
            case 'square':
                this._drawSquare(radius);
                break;
        }
    }

    clear() {
        this.container.removeChildren();
    }

    _drawCircle(radius: number) {
        const WIDTH = 0.5 * this.userSettings!.visual.brushGraphicsWidth;

        if (this.graphics_brush_circle != null) {
            this.container.removeChild(this.graphics_brush_circle);
            this.graphics_brush_circle = null;
        }

        this.graphics_brush_circle = new Graphics();

        this.graphics_brush_circle.circle(0, 0, radius);
        this.graphics_brush_circle.stroke({ width: WIDTH, color: 0xFFFFFF, alpha: this.userSettings!.visual.brushGraphicsOpacity });

        this.container.addChild(this.graphics_brush_circle);
    }

    _drawSquare(radius: number) {
        const WIDTH = 0.5 * this.userSettings!.visual.brushGraphicsWidth;

        if (this.graphics_brush_square != null) {
            this.container.removeChild(this.graphics_brush_square);
            this.graphics_brush_square = null;
        }

        this.graphics_brush_square = new Graphics();

        this.graphics_brush_square.rect(-radius, -radius, 2 * radius, 2 * radius);
        this.graphics_brush_square.stroke({ width: WIDTH, color: 0xFFFFFF, alpha: this.userSettings!.visual.brushGraphicsOpacity });

        this.container.addChild(this.graphics_brush_square);
    }

    _drawPoint() {
        if (this.graphics_brush_point != null) {
            this.container.removeChild(this.graphics_brush_point);
            this.graphics_brush_point = null;
        }

        this.graphics_brush_point = new Sprite(TextureService.STAR_SYMBOLS['scannable']);
        this.graphics_brush_point.alpha = this.userSettings!.visual.brushPointOpacity;
        this.graphics_brush_point.anchor.set(0.5);
        this.graphics_brush_point.width = 24.0 / 2.0;
        this.graphics_brush_point.height = 24.0 / 2.0;

        this.container.addChild(this.graphics_brush_point);
        
    }

    updatePosition(newPos: Location) {
        this.container.position = newPos;
    }
}

export default Brush;