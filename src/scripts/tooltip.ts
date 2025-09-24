import { BitmapText, Circle, Container, Graphics } from 'pixi.js';
import helper from './helper';
import type { Star } from './types/Star';
import type { Tooltip } from './types/Tooltip';
import type { Carrier } from './types/Carrier';

export default class {
    container: Container;
    intervalDraw: number | null;
    tooltip: Tooltip | null;

    constructor() {
        this.container = new Container();
        this.container.eventMode = 'passive';
        this.container.cursor = '';
        this.container.hitArea = new Circle(0, 0, 0);
        this.intervalDraw = null;

        this.tooltip = null;
    }

    setup() {

    }

    clear() {
        if (this.intervalDraw) {
            clearInterval(this.intervalDraw);
            this.intervalDraw = null;
        }

        this.container.removeChildren();
        this.tooltip = null;
    }

    _drawTooltip(tooltipData: Tooltip) {
        this.container.removeChildren();
        this.tooltip = null;

        const player = helper.getPlayerById(tooltipData.playerId);
        if (player == null) return;

        const paddingX = 2;
        const paddingY = 2;

        const internalContainer = new Container();
        internalContainer.x = paddingX;
        internalContainer.y = paddingY;

        for (let i = 0; i < tooltipData.detail.length; i++) {
            const text = new BitmapText({
                text: tooltipData.detail[i],
                style: {
                    fontFamily: 'chakrapetch',
                    fontSize: 6
                }
            });

            const prev = internalContainer.children[i - 1];

            if (prev) {
                text.y = prev.y + prev.getBounds().height;
            } else {
                text.y = 0;
            }

            internalContainer.addChild(text);
        }

        const graphics = new Graphics();
        graphics.roundRect(0, 0, internalContainer.width + (paddingX * 2), internalContainer.height + (paddingY * 2), 1);
        graphics.fill(0x000000);
        graphics.stroke({ width: 1, color: player!.colour.value });

        this.container.addChild(graphics);
        this.container.addChild(internalContainer);

        if (tooltipData.offset.relative) {
            this.container.x = tooltipData.location.x + tooltipData.offset.x;
            this.container.y = tooltipData.location.y - (this.container.height / 2) + tooltipData.offset.y;
        } else {
            this.container.x = tooltipData.location.x + tooltipData.offset.x;
            this.container.y = tooltipData.location.y + tooltipData.offset.y;
        }
    }

    drawTooltipStar(star: Star) {
        this.clear();

        if (star.playerId == null) return;

        const carriers = helper.getCarriersOrbitingStar(star);

        if (!carriers.length) {
            return;
        }

        let detail = [];

        if (star.ships != null && star.ships > 0) {
            detail.push(
                `⭐ ${star.ships == null ? '???' : star.ships} garrisoned\n`
            );
        }

        const carrierStrings = carriers.map(carrier => {
            let result = `\nCarrier ${carrier.name ? carrier.name : carrier.id}` + `\n 🚀 ${carrier.ships || '???'} ship${carrier.ships !== 1 ? 's' : ''}`;

            if (carrier.specialist && carrier.specialist.name) {
                result += `\n 🧑‍🚀 ${carrier.specialist.name}`;
            }

            return result;
        })

        carrierStrings[0] = carrierStrings[0].trim();

        detail = detail.concat(carrierStrings);

        this._drawTooltip({
            playerId: star.playerId,
            location: star.location,
            detail,
            offset: {
                relative: false,
                x: 0,
                y: 6
            }
        });
    }

    drawTooltipCarrier(carrier: Carrier) {
        this.clear();

        const ticks = helper.getTicksToArrival(carrier, false);
        const warpTicks = helper.getTicksToArrival(carrier, true);

        const detail = [`⏱️ Base ` + ticks + ` tick${ticks !== 1 ? 's' : ''}`]; // Since ETA for 1st waypoint is displayed when the carrier is clicked, do not calculate it here
        detail.push(`⏱️ Warp ` + warpTicks + ` tick${warpTicks !== 1 ? 's' : ''}`)

        detail.push(`${carrier.waypointsLooped ? '🔄' : '📍'} ${carrier.waypoints.length} waypoint${carrier.waypoints.length !== 1 ? 's' : ''}`);

        this._drawTooltip({
            playerId: carrier.playerId,
            location: carrier.location,
            detail,
            offset: {
                relative: true,
                x: 6,
                y: 2
            }
        });

    }
}