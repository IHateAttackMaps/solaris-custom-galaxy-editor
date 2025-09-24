import { Application, BitmapText, FederatedPointerEvent, Graphics, type TickerCallback } from 'pixi.js';
import { Viewport } from 'pixi-viewport';
import type { Settings } from './types/Settings';
import GalaxyMap from './map';
import helper from './helper';
import textureService from './texture';
import type { Star } from './types/Star';
import type { Carrier } from './types/Carrier';
import { useGalaxyStore } from '@/stores/galaxy';

class GalaxyEditor {
    app: Application | null;
    viewport: Viewport | null;
    frames: number;
    dtAccum: number;
    lowest: number;
    previousDTs: number[];
    ma32accum: number;

    map: GalaxyMap | null;
    userSettings: Settings | null;

    fpsNowText: BitmapText | null;
    fpsMAText: BitmapText | null;
    fpsMA32Text: BitmapText | null;
    jitterText: BitmapText | null;
    lowestText: BitmapText | null;
    zoomText: BitmapText | null;
    scaleText: BitmapText | null;
    scaleBar: Graphics | null;
    pointerText: BitmapText | null;

    onTickCallback: TickerCallback<any> | null;
    updateScaleCallback: TickerCallback<any> | null;
    calcFPSCallback: TickerCallback<any> | null;

    pointerMoveHandler: any;

    constructor() {
        this.app = null;
        this.viewport = null;
        this.map = null;
        this.userSettings = null;

        //Graphics.curves.minSegments = 20; // Smooth arcs

        this.frames = 0;
        this.dtAccum = 33.0 * 16;
        this.lowest = 1000;
        this.previousDTs = [33.0, 33.0, 33.0, 33.0, 33.0, 33.0, 33.0, 33.0, 33.0, 33.0, 33.0, 33.0, 33.0, 33.0, 33.0, 33.0];
        this.ma32accum = 0;

        this.fpsNowText = null;
        this.fpsMAText = null;
        this.fpsMA32Text = null;
        this.jitterText = null;
        this.lowestText = null;
        this.zoomText = null;
        this.scaleText = null;
        this.scaleBar = null;
        this.pointerText = null;

        this.onTickCallback = null;
        this.updateScaleCallback = null;
        this.calcFPSCallback = null;

        this.pointerMoveHandler = null;
    }

    async setupApp() {
        this.app = new Application();

        await this.app.init({
            width: window.innerWidth,
            height: window.innerHeight - 45,
            backgroundColor: 0x000000,
            resolution: window.devicePixelRatio || 1,
            antialias: true,
            autoDensity: true,
            resizeTo: window
        });
    }

    destroy() {
        if (this.viewport) {
            this.viewport.destroy();
            this.viewport = null;
        }

        // Cleanup if the app already exists.
        if (this.app) {
            this.app.destroy(false, {
                children: true
            });

            this.app = null;
        }
    }

    zoomIn() {
        this.viewport!.zoomPercent(0.5, true);
    }

    zoomOut() {
        this.viewport!.zoomPercent(-0.3, true);
    }

    async setupViewport() {
        // create viewport
        this.viewport = new Viewport({
            screenWidth: window.innerWidth,
            screenHeight: window.innerHeight,

            worldWidth: Number.MAX_VALUE,
            worldHeight: Number.MAX_VALUE,

            stopPropagation: true,
            passiveWheel: true,

            disableOnContextMenu: true,
            events: this.app!.renderer.events
        });

        // Add a new map to the viewport
        this.map = new GalaxyMap(this.app!, this);
        this.viewport.addChild(this.map.container);

        // add the viewport to the stage
        this.app!.stage.addChild(this.viewport);

        const starFieldLeft = helper.calculateMinStarX() - 1500;
        const starFieldRight = helper.calculateMaxStarX() + 1500;
        const starFieldTop = helper.calculateMinStarY() - 750;
        const starFieldBottom = helper.calculateMaxStarY() + 750;

        const maxWidth = 2 * (starFieldRight - starFieldLeft);
        const maxHeight = 2 * (starFieldBottom - starFieldTop);

        this.viewport!.resize(window.innerWidth, window.innerHeight, maxWidth, maxHeight);
        this.viewport!.moveCenter((starFieldLeft + starFieldRight) / 2, (starFieldTop + starFieldBottom) / 2);

        // activate plugins
        this.viewport!
            .drag()
            .pinch()
            .wheel({
                // percent: 2,
                smooth: 5
            })
            .decelerate({ friction: 0.9 })
            .clampZoom({
                minWidth: 50,
                minHeight: 50,
                maxWidth: maxWidth * 1.5,
                maxHeight: maxHeight * 1.5,
            });
    }

    async setup(userSettings: Settings) {
        this.userSettings = userSettings;
        await textureService.loadAssets();
        await textureService.initialize();

        this.map!.setup(userSettings);

        // Adding this here in order to prevent problems with the userSettings being undefined
        this.onTickCallback = this.onTick.bind(this);
        this.app!.ticker.add(this.onTickCallback);
        this.app!.ticker.maxFPS = 0;

        this.viewport!.on('zoomed-end', this.onViewportZoomed.bind(this));
        this.viewport!.on('pointerdown', this.map!.onViewportPointerDown.bind(this.map));
        this.viewport!.on('pointerup', this.map!.onViewportPointerUp.bind(this.map));
    }

    async draw() {
        this.map!.draw();
        this.drawOverlay();
    }

    drawOverlay() {
        const bitmapFont = { fontName: "chakrapetch", fontSize: 16 };
        const top = 45 + 5;
        let nextAvailY = top;
        let left = 5;
        const sidebarDisplayed = document.getElementById('sidebarMenu')?.checkVisibility() === true;
        if (sidebarDisplayed) left += 50;

        this.clearScaleBar();

        this.clearPerformanceMonitor();

        this.clearCursorCoordinates();

        if (this.userSettings!.visual.displayScaleBar === 'enabled') {
            this.scaleText = new BitmapText({ text: '1 light year:', style: bitmapFont });
            this.scaleText.x = left;
            this.scaleText.y = nextAvailY;
            this.scaleBar = new Graphics();
            this.scaleBar.rect(0, 0, GalaxyMap.lightYearDistance, this.scaleText.height / 4);
            this.scaleBar.fill(0xFFFFFF);
            this.scaleBar.x = left + this.scaleText.width + 8;
            this.scaleBar.y = nextAvailY + (this.scaleText.height - this.scaleBar.height) / 2;
            this.app!.stage.addChild(this.scaleText);
            this.app!.stage.addChild(this.scaleBar);
            nextAvailY += this.scaleText.height + 2;

            this.updateScaleCallback = this._updateScale.bind(this);
            this.app!.ticker.add(this.updateScaleCallback);
        }

        if (this.userSettings?.technical.performanceMonitor === 'enabled') {
            this.fpsNowText = new BitmapText({ text: '', style: bitmapFont });
            this.fpsMAText = new BitmapText({ text: '', style: bitmapFont });
            this.fpsMA32Text = new BitmapText({ text: '', style: bitmapFont });
            this.jitterText = new BitmapText({ text: '', style: bitmapFont });
            this.lowestText = new BitmapText({ text: '', style: bitmapFont });
            this.zoomText = new BitmapText({ text: '', style: bitmapFont });
            this.fpsNowText.x = left;
            this.fpsNowText.y = nextAvailY + 64;
            this.fpsMAText.x = left;
            this.fpsMAText.y = this.fpsNowText.y + this.fpsNowText.height + 2;
            this.fpsMA32Text.x = left;
            this.fpsMA32Text.y = this.fpsMAText.y + this.fpsMAText.height + 2;
            this.jitterText.x = left;
            this.jitterText.y = this.fpsMA32Text.y + this.fpsMA32Text.height + 2;
            this.lowestText.x = left;
            this.lowestText.y = this.jitterText.y + this.jitterText.height + 2;
            this.zoomText.x = left;
            this.zoomText.y = this.lowestText.y + this.lowestText.height + 2;
            this.app!.stage.addChild(this.fpsNowText);
            this.app!.stage.addChild(this.jitterText);
            this.app!.stage.addChild(this.lowestText);
            this.app!.stage.addChild(this.fpsMAText);
            this.app!.stage.addChild(this.fpsMA32Text);
            this.app!.stage.addChild(this.zoomText);

            this.calcFPSCallback = this._calcFPS.bind(this);
            this.app!.ticker.add(this.calcFPSCallback);
        }

        if (this.userSettings?.visual.displayCursorCoordinates === 'enabled') {
            this.pointerText = new BitmapText({ text: 'Cursor position: (0, 0)', style: bitmapFont });
            this.pointerText.x = left;

            this.pointerText.y = nextAvailY;
            this.app!.stage.addChild(this.pointerText);

            this.app!.stage.interactive = true;
            this.pointerMoveHandler = ((e: FederatedPointerEvent) => { this._onCursorMoved(e) }).bind(this);
            this.app!.stage.addListener('pointermove', this.pointerMoveHandler);
        }
    }

    clearScaleBar() {
        if (this.scaleText) {
            this.scaleText.destroy();
            this.scaleText = null;
            this.scaleBar!.destroy();
            this.scaleBar = null;
            this.app!.ticker.remove(this.updateScaleCallback!);
        }
    }

    clearPerformanceMonitor() {
        if (this.fpsNowText) {
            this.fpsNowText.destroy();
            this.fpsNowText = null;
            this.fpsMAText!.destroy();
            this.fpsMAText = null;
            this.fpsMA32Text!.destroy();
            this.fpsMA32Text = null;
            this.jitterText!.destroy();
            this.jitterText = null;
            this.lowestText!.destroy();
            this.lowestText = null;
            this.zoomText!.destroy();
            this.zoomText = null;
            this.app!.ticker.remove(this.calcFPSCallback!);
        }
    }

    clearCursorCoordinates() {
        if (this.pointerText) {
            this.pointerText.destroy();
            this.pointerText = null;
            this.app!.stage.removeEventListener('pointermove', this.pointerMoveHandler);
        }
    }

    reloadGalaxy(userSettings: Settings) {
        this.userSettings = userSettings;
        this.map!.reloadGalaxy(userSettings);
        this.drawOverlay();
        useGalaxyStore().setGalaxyIsReady(true);
        this.viewport!.visible = true;
        this.viewport!.interactive = true;
        this.viewport!.interactiveChildren = true;

        // Reset viewport size and position
        const starFieldLeft = helper.calculateMinStarX() - 1500;
        const starFieldRight = helper.calculateMaxStarX() + 1500;
        const starFieldTop = helper.calculateMinStarY() - 750;
        const starFieldBottom = helper.calculateMaxStarY() + 750;

        const maxWidth = 2 * (starFieldRight - starFieldLeft);
        const maxHeight = 2 * (starFieldBottom - starFieldTop);

        this.viewport!.resize(window.innerWidth, window.innerHeight, maxWidth, maxHeight);
        this.viewport!.moveCenter((starFieldLeft + starFieldRight) / 2, (starFieldTop + starFieldBottom) / 2);
        this.viewport!.fit(true, (starFieldRight - starFieldLeft), (starFieldBottom - starFieldTop));
    }

    createStar(star: Star, interactive: boolean = true) {
        const starObject = this.map!.setupStar(this.userSettings!, star, interactive);
        this.map!.addContainerToChunk(starObject, this.map!.chunks);
        this.map!.drawStar(starObject);
        this.map!.drawGalaxyCenter();
    }

    deleteStar(star: Star) {
        this.map!.undrawStar(star);
        this.map!.drawGalaxyCenter();
    }

    updateStarId(star: Star) {
        this.map!.updateStarId(star);
    }

    updateStarShips(star: Star) {
        this.map!.updateStarShips(star);
    }

    reloadStar(star: Star) {
        const starObject = this.map!.setupStar(this.userSettings!, star);
        this.map!.drawStar(starObject);
    }

    transformStar(star: Star) {
        this.map!.transformStar(star);
        this.map!.drawGalaxyCenter();
    }

    createCarrierAtStar(star: Star, carrierData?: Carrier): Carrier {
        const newCarrier = carrierData == null ? {
            id: useGalaxyStore().getLowestValidCarrierId().toString(),
            orbiting: star.id,
            waypointsLooped: false,
            ships: 1,
            isGift: false,
            playerId: star.playerId,
            specialistId: null,
            specialistExpireTick: null,
            waypoints: [],
            location: star.location
        } as Carrier : carrierData;

        useGalaxyStore().addCarrier(newCarrier);
        this.reloadCarrier(newCarrier);
        this.map!.updateStarShips(star);

        return newCarrier;
    }

    updateWaypointsOnStarDeletion(star: Star) {
        this.map!.updateWaypointsOnStarDeletion(star);
    }

    updateWaypointsOnMultipleStarDeletion(starIds: Set<string>) {
        this.map!.updateWaypointsOnMultipleStarDeletion(starIds);
    }

    updateWormholes() {
        this.map!.drawWormHoles();
    }

    createCarrier(carrier: Carrier) { // Use createCarrierAtStar instead
        const carrierObject = this.map!.setupCarrier(this.userSettings!, carrier);
        this.map!.addContainerToChunk(carrierObject, this.map!.chunks);
        this.map!.drawCarrier(carrierObject);
    }

    deleteCarrier(carrier: Carrier) {
        this.map!.undrawCarrier(carrier);
    }

    updateCarrierShips(carrier: Carrier) {
        this.map!.updateCarrierShips(carrier);
    }

    updateCarrierWaypoints(carrier: Carrier) {
        this.map!.updateCarrierWaypoints(carrier);
    }

    reloadCarrier(carrier: Carrier) {
        const carrierObject = this.map!.setupCarrier(this.userSettings!, carrier);
        this.map!.resetMapObjectChunk(carrierObject);
        this.map!.drawCarrier(carrierObject);
    }

    redrawActiveWaypoints() {
        this.map!.drawWaypoints();
    }

    getViewportZoomPercentage() {
        const viewportWidth = this.viewport!.right - this.viewport!.left;
        const viewportPercent = (this.viewport!.screenWidth / viewportWidth) * 100;

        return viewportPercent;
    }

    onTick() {
        this.map!.onTick();
    }

    onViewportZoomed(e: any) {
        const zoomPercent = this.getViewportZoomPercentage();

        this.map!.refreshZoom(zoomPercent);
    }

    setMode(mode: string, args: any) {
        this.map!.setMode(mode, args);
    }

    setModeArgs(args: any) {
        this.map!.setModeArgs(args);
    }

    setModeArg(index: number, arg: any) {
        this.map!.setModeArg(index, arg);
    }

    resetMode() {
        this.map!.resetMode();
    }

    resize() {
        this.app!.renderer.resize(
            window.innerWidth,
            window.innerHeight
        );

        this.viewport!.resize(
            window.innerWidth,
            window.innerHeight,
            Number.MAX_VALUE,
            Number.MAX_VALUE
        );
    }

    _calcFPS() {
        const elapsed = this.app!.ticker.elapsedMS;
        this.frames += 1;
        this.previousDTs.pop();
        this.previousDTs.unshift(elapsed);

        this.dtAccum = this.previousDTs.reduce((total, current) => { return total + current });
        this.ma32accum += elapsed;

        const movingAverageDT = this.dtAccum / 16.0;
        const movingAverageFPS = 1000.0 / movingAverageDT;
        const ma32DT = this.ma32accum / 32.0;

        const fps = 1000.0 / elapsed
        if (fps < this.lowest) { this.lowest = fps }
        if (this.fpsNowText) {
            this.fpsNowText.text = ('fps: ' + fps.toFixed(0));
        }

        if (this.frames == 31) {
            const ma32FPS = 1000.0 / ma32DT;

            if (this.fpsMAText) {
                this.fpsMAText.text = ('fpsMA: ' + movingAverageFPS.toFixed(0));
            }

            if (this.fpsMA32Text) {
                this.fpsMA32Text.text = ('fpsMA32: ' + ma32FPS.toFixed(0));
            }

            if (this.jitterText) {
                this.jitterText.text = ('jitter: ' + (movingAverageFPS - this.lowest).toFixed(0));
            }

            if (this.lowestText) {
                this.lowestText.text = ('lowest: ' + this.lowest.toFixed(0));
            }

            if (this.zoomText) {
                this.zoomText.text = ('zoom%: ' + this.map!.zoomPercent.toFixed(0));
            }

            this.frames = 0;
            this.lowest = 1000;
            this.ma32accum = 0;
        }
    }

    _updateScale() {
        const zoom = this.viewport!.screenWidth / (this.viewport!.right - this.viewport!.left);
        this.scaleBar!.scale = { x: zoom, y: 1 };
    }

    _onCursorMoved(e: any) {
        const pos = this.map!.onCursorMoved(e);
        this.pointerText!.text = `Cursor position: (${pos.x.toFixed(0)}, ${pos.y.toFixed(0)})`;
    }

    onMenuToggled(isActive: boolean, isHidden: boolean = false) {
        if (!useGalaxyStore().galaxyIsReady) return;

        const sidebarDisplayed = document.getElementById('sidebarMenu')?.checkVisibility() === true;
        let top = 45 + 5;
        if (isHidden) top += 66;
        let nextAvailY = top;

        let left = 5;
        if (sidebarDisplayed) left += 50;
        if (isActive && !isHidden) left += 473;

        if (this.userSettings!.visual.displayScaleBar === 'enabled') {
            this.scaleText!.x = left;
            this.scaleText!.y = nextAvailY;
            this.scaleBar!.x = left + this.scaleText!.width + 8;
            this.scaleBar!.y = nextAvailY + (this.scaleText!.height - this.scaleBar!.height) / 2;
            nextAvailY += this.scaleText!.height + 2;
        }

        if (this.userSettings!.technical.performanceMonitor === 'enabled') {
            this.fpsNowText!.x = left;
            this.fpsNowText!.y = nextAvailY + 64;
            this.fpsMAText!.x = left;
            this.fpsMAText!.y = this.fpsNowText!.y + this.fpsNowText!.height + 2;
            this.fpsMA32Text!.x = left;
            this.fpsMA32Text!.y = this.fpsMAText!.y + this.fpsMAText!.height + 2;
            this.jitterText!.x = left;
            this.jitterText!.y = this.fpsMA32Text!.y + this.fpsMA32Text!.height + 2;
            this.lowestText!.x = left;
            this.lowestText!.y = this.jitterText!.y + this.jitterText!.height + 2;
            this.zoomText!.x = left;
            this.zoomText!.y = this.lowestText!.y + this.lowestText!.height + 2;
        }

        if (this.userSettings!.visual.displayCursorCoordinates === 'enabled') {
            this.pointerText!.x = left;
            this.pointerText!.y = nextAvailY;
        }
    }

    pauseViewport() {
        this.viewport!.pause = true;
    }

    unpauseViewport() {
        this.viewport!.pause = false;
    }
}

export default new GalaxyEditor();

