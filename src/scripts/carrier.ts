import { Graphics, Sprite, BitmapText, Container, type ColorSource, Circle, TextStyle } from 'pixi.js';
import TextureService from './texture';
import helper from './helper';
import { EventEmitter } from "events";
import type PathManager from './pathManager';
import type { Carrier } from './types/Carrier';
import type { Settings } from './types/Settings';
import type { Star } from './types/Star';
import type { Player } from './types/Player';
import { useGalaxyStore } from '@/stores/galaxy';

class CarrierObject extends EventEmitter {

    static culling_margin = 16;
    static zoomLevel = 140;

    container;
    graphics_ship: Graphics | Sprite;
    graphics_colour: Sprite | null;
    graphics_selected;
    isSelected: boolean;
    isMouseOver;
    zoomPercent;
    zoomDepth: number;
    specialistSprite: Sprite | null;
    text_ships: BitmapText | null;
    container_ships: Container | null;
    colour: ColorSource | null;

    pathManager: PathManager | null;
    pathIDs: string[];

    data: Carrier | null;
    userSettings: Settings | null;
    player: Player | null;

    clampedScaling: boolean;
    baseScale: number;
    minScale: number;
    maxScale: number;

    constructor() {
        super()

        this.container = new Container();
        this.container.eventMode = 'static';
        this.container.interactiveChildren = false;
        this.container.cursor = 'pointer';
        this.container.zIndex = 1;

        this.graphics_colour = new Sprite();
        this.graphics_selected = new Graphics();
        this.graphics_ship = new Graphics();

        this.container.addChild(this.graphics_colour);
        this.container.addChild(this.graphics_selected);
        this.container.addChild(this.graphics_ship);

        this.container.on('pointerup', this.onClicked.bind(this));
        this.container.on('mouseover', this.onMouseOver.bind(this));
        this.container.on('mouseout', this.onMouseOut.bind(this));

        this.pathManager = null;
        this.pathIDs = [];

        this.isMouseOver = false;
        this.zoomPercent = 100;

        this.isSelected = false;
        this.data = null;
        this.userSettings = null;
        this.player = null;

        this.clampedScaling = false;
        this.baseScale = NaN;
        this.minScale = NaN;
        this.maxScale = NaN;

        this.zoomDepth = NaN;
        this.specialistSprite = null;
        this.text_ships = null;
        this.container_ships = null;
        this.colour = null;
    }

    _getStars() {
        return useGalaxyStore().$state.galaxy.stars;
    }

    setup(data: Carrier, userSettings: Settings, pathManager: PathManager, player: Player) {
        this.data = data;
        this.player = player;
        this.colour = player.colour.value;

        this.pathManager = pathManager;

        this.container.position.x = data.location.x;
        this.container.position.y = data.location.y;
        // Add a larger hit radius so that the carrier is easily clickable
        this.container.hitArea = new Circle(0, 0, 10);

        this.userSettings = userSettings;

        this.clampedScaling = this.userSettings.visual.objectScaling == 'clamped';
        this.baseScale = 1
        this.minScale = this.userSettings.visual.objectMinimumScale / 4.0;
        this.maxScale = this.userSettings.visual.objectMaximumScale / 4.0;

        CarrierObject.zoomLevel = userSettings.visual.zoomLevels.carrier.carrierShips;

        this.clearPaths(); // clear on setup since this is used to reset waypoints
        this.enableInteractivity();
    }

    updateWaypoints() {
        this.drawCarrierWaypoints();
    }

    updateShips() {
        this.drawShips();
        this.onZoomChanging(this.zoomPercent);
    }

    draw() {
        this.drawShape();
        this.drawSelectedCircle();
        this.drawCarrier();
        this.drawShips();
        this.drawSpecialist();
        this.drawCarrierWaypoints();
    }

    drawActive() {
        this.drawShips();
    }

    drawShape() {
        if (this.graphics_colour) {
            this.container.removeChild(this.graphics_colour);
            this.graphics_colour = null;
        }

        if (this.data!.orbiting) return;

        if (Object.keys(TextureService.PLAYER_SYMBOLS).includes(this.player!.shape)) {
            this.graphics_colour = new Sprite(TextureService.PLAYER_SYMBOLS[this.player!.shape][4]);
        }

        this.graphics_colour!.anchor.set(0.5);
        this.graphics_colour!.width = 12;
        this.graphics_colour!.height = 12;
        this.graphics_colour!.tint = this.colour!;

        this.container.addChild(this.graphics_colour!);
    }

    drawCarrier() {
        if (this.graphics_ship) {
            this.container.removeChild(this.graphics_ship);
        }

        if (this.data!.orbiting) return;

        this.graphics_ship = new Sprite(TextureService.CARRIER_TEXTURE);
        this.graphics_ship.anchor.set(0.5);
        this.graphics_ship.width = 10;
        this.graphics_ship.height = 10;
        this.container.addChild(this.graphics_ship);

        helper.rotateCarrierTowardsWaypoint(this.data!, this._getStars(), this.graphics_ship);
    }

    drawShips() {
        if (this.container_ships) {
            this.container.removeChild(this.container_ships);
            this.container_ships = null;
        }
        if (this.text_ships) {
            this.container.removeChild(this.text_ships);
            this.text_ships = null;
        }

        if (this.data!.orbiting) return;

        if (!this.container_ships) {
            this.container_ships = new Container();
            this.container.addChild(this.container_ships);
        }

        if (!this.text_ships) {
            const totalShips = this.data!.ships == null ? '???' : this.data!.ships;

            const shipsText = totalShips.toString();

            const bitmapFont = { fontFamily: "chakrapetch", fontSize: 4 };
            this.text_ships = new BitmapText({ text: shipsText, style: bitmapFont });

            this.container_ships.x = -(this.text_ships.width / 2.0);
            this.container_ships.y = 6;

            this.container_ships.addChild(this.text_ships);
            if (this.data!.isGift) {
                const style = new TextStyle({
                    fontFamily: `Chakra Petch,sans-serif;`,
                    fill: 0xFFFFFF,
                    padding: 3,
                    fontSize: 4,
                    fontWeight: 'bold'
                });
                const giftText = new BitmapText({ text: '🎁', style: style });
                giftText.position.x = this.text_ships.width;
                giftText.position.y = -0.4;
                this.container_ships.addChild(giftText);
            }
        }
    }

    drawSpecialist() {
        if (this.specialistSprite) {
            this.container.removeChild(this.specialistSprite);
            this.specialistSprite = null;
        }

        if (!this.hasSpecialist() || this.data!.orbiting) {
            return;
        }

        const specialistTexture = TextureService.getSpecialistTexture(this.data!.specialist!.key);
        this.specialistSprite = new Sprite(specialistTexture);
        this.specialistSprite.width = 6;
        this.specialistSprite.height = 6;
        this.specialistSprite.x = -3;
        this.specialistSprite.y = -3;

        this.container.addChild(this.specialistSprite);
    }

    hasSpecialist() {
        return this.data!.specialistId && this.data!.specialistId > 0 && this.data!.specialist;
    }

    clearPaths() {
        for (const pathID of this.pathIDs) {
            this.pathManager!.removePath(pathID, this);
        }
        this.pathIDs = [];
    }

    _isSourceLastDestination() {
        const numof_waypoints = this.data!.waypoints.length;
        const lastWaypoint = this.data!.waypoints[numof_waypoints - 1];
        if (numof_waypoints < 2) return false;
        return (this.data!.waypoints[0].source === lastWaypoint.destination);
    }

    drawCarrierWaypoints() {
        this.clearPaths();

        let lastPoint: Star | Carrier = this.data!;
        let sourceIsLastDestination = false;
        sourceIsLastDestination = this._isSourceLastDestination();
        // if looping and source is last destination, begin drawing path from the star instead of carrier
        if (this.data!.waypointsLooped) {
            if (sourceIsLastDestination) {
                lastPoint = this._getStars().find(s => s.id === this.data!.waypoints[0].source)!;
            }
        }
        let star;
        for (let i = 0; i < this.data!.waypoints.length; i++) {
            const waypoint = this.data!.waypoints[i];
            // Draw a line to each destination along the waypoints.
            star = this._getStars().find(s => s.id === waypoint.destination);
            if (!star) break;

            if (lastPoint == null) {
                this.pathIDs.push(this.pathManager!.addPath(this.data!, star, this));
            } else {
                this.pathIDs.push(this.pathManager!.addPath(lastPoint, star, this));
            }

            lastPoint = star;
        }
        //draw path back to the first destination
        if (this.data!.waypointsLooped) {
            if (!sourceIsLastDestination && this.data!.waypoints && this.data!.waypoints.length) {
                const firstPoint = this._getStars().find(s => s.id === this.data!.waypoints[0].destination);
                if (firstPoint && lastPoint && firstPoint !== lastPoint) {
                    this.pathIDs.push(this.pathManager!.addPath(star!, firstPoint, this));
                }
            }
        }
    }

    drawSelectedCircle() {
        this.graphics_selected.clear();

        if (this.isSelected) {
            this.graphics_selected.alpha = 0.3;
            this.graphics_selected.circle(0, 0, 15);
            this.graphics_selected.stroke({ width: 0.5, color: 0xFFFFFF });
        }
    }

    enableInteractivity() {
        // Can only be interactive if in transit
        if (!this.data!.orbiting) {
            this.container.eventMode = 'static';
            this.container.cursor = 'pointer';
        } else {
            this.container.eventMode = 'passive';
            this.container.cursor = undefined;
        }
    }

    disableInteractivity() {
        this.container.eventMode = 'passive';
        this.container.cursor = undefined;
    }

    onZoomChanging(zoomPercent: number) {
        this.zoomPercent = zoomPercent;
        this.setScale(zoomPercent);
        this.updateVisibility();
    }

    setScale(zoomPercent: number) {
        if (this.clampedScaling) {
            const currentScale = zoomPercent / 100;
            if (currentScale < this.minScale) {
                this.container.scale = { x: (1 / currentScale) * this.minScale, y: (1 / currentScale) * this.minScale };
            } else if (currentScale > this.maxScale) {
                this.container.scale = { x: (1 / currentScale) * this.maxScale, y: (1 / currentScale) * this.maxScale };
            }
            else {
                this.container.scale = { x: this.baseScale, y: this.baseScale };
            }
        }
        else {
            this.container.scale = { x: this.baseScale, y: this.baseScale };
        }
    }

    onClicked(e: any, tryMultiSelect = true) {
        if (e && e.data && e.data.originalEvent && e.data.originalEvent.button === 2) {
            this.emit('onCarrierRightClicked', this.data);
        } else {
            const eventData = e ? e.data : null;

            this.emit('onCarrierClicked', {
                carrierData: this.data,
                eventData,
                tryMultiSelect
            });

            // Need to do this otherwise sometimes text gets highlighted.
            this.deselectAllText();
        }
    }

    updateVisibility() {
        if (this.graphics_ship) this.graphics_ship.visible = !this.data!.orbiting && !this.hasSpecialist();
        if (this.container_ships) this.container_ships.visible = !this.data!.orbiting && (this.zoomPercent >= CarrierObject.zoomLevel || (this.isSelected && this.zoomPercent > CarrierObject.zoomLevel) || (this.isMouseOver && this.zoomPercent > CarrierObject.zoomLevel));
    }

    deselectAllText() {
        if (window.getSelection) { window.getSelection()!.removeAllRanges(); }
        else if (document.getSelection()) { document.getSelection()?.empty(); }
    }

    onMouseOver() {
        this.isMouseOver = true;

        this.emit('onCarrierMouseOver', this);
    }

    onMouseOut() {
        this.isMouseOver = false;

        this.emit('onCarrierMouseOut', this);
    }

    refreshZoom(zoomPercent: number) {
        this.zoomPercent = zoomPercent;
    }

    cleanUpEventHandlers() {
        this.container.off('pointerup', this.onClicked.bind(this));
        this.container.off('mouseover', this.onMouseOver.bind(this));
        this.container.off('mouseout', this.onMouseOut.bind(this));
    }

    destroy() {
        this.container.destroy();
    }

    select() {
        this.isSelected = true;
        this.drawSelectedCircle();
        this.emit('onSelected', this.data);
        this.updateVisibility();
    }

    unselect() {
        this.isSelected = false;
        this.drawSelectedCircle();
        this.emit('onUnselected', this.data);
        this.updateVisibility();
    }

    toggleSelected() {
        if (this.isSelected) {
            this.unselect();
        } else {
            this.select();
        }
    }
}

export default CarrierObject;