import { Circle, Container, Graphics, type Application, type ColorSource } from 'pixi.js';
import StarObject from './star';
import RulerService from './ruler';
import helper from './helper';
import WormHoleLayer from './wormHole';
import TooltipLayer from './tooltip';
import { EventEmitter } from "events";
import type { Settings } from './types/Settings';
import type { Star } from './types/Star';
import GalaxyEditor from './editor';
import type { Location } from './types/Location';
import Waypoints from './waypoints';
import CarrierObject from './carrier';
import type { Carrier } from './types/Carrier';
import PathManager from './pathManager';
import { useGalaxyStore } from '@/stores/galaxy';
import type { CarrierWaypoint } from './types/CarrierWaypoint';
import Brush from './brush';
import StarSelection from './starSelection';

interface Chunk extends Container {
    mapObjects: (StarObject | CarrierObject)[],
    visualizer?: Graphics;
}

class GalaxyMap extends EventEmitter {
    static chunkSize = 1024;
    static lightYearDistance = 50;
    static warpSpeedMultiplier = 3;
    // Represents the current galaxy mode, these are as follows:
    // galaxy - Normal galaxy view
    // waypoints - Displays waypoints overlay for a given carrier
    mode = 'galaxy';
    modeArgs: any;

    app;
    editor;
    container;
    chunksContainer: Container | null;
    wormHoleContainer: Container | null;
    starContainer: Container | null;
    rulerPointContainer: Container | null;
    highlightLocationsContainer: Container | null;
    tooltipContainer: Container | null;
    waypointContainer: Container | null;
    brushContainer: Container | null;
    selectionContainer: Container | null;
    selectionTopContainer: Container | null;

    galaxyCenterGraphics: Graphics | null;

    rulerService: RulerService | null;
    wormHoleLayer: WormHoleLayer | null;
    tooltipLayer: TooltipLayer | null;
    waypoints: Waypoints | null;
    pathManager: PathManager | null;
    brush: Brush | null;
    starSelection: StarSelection | null;

    zoomPercent: number;
    lastZoomPercent: number;
    lastZoomState: {
        shipCount: boolean,
        id: boolean,
        resources: boolean,
        infrastructure: boolean,
        carrierShips: boolean
    } | null;
    minMouseChunkX: number;
    minMouseChunkY: number;
    maxMouseChunkX: number;
    maxMouseChunkY: number;
    firstChunkX: number;
    firstChunkY: number;
    lastChunkX: number;
    lastChunkY: number;
    numof_chunkX: number;
    numof_chunkY: number;

    stars: StarObject[];
    carriers: CarrierObject[];
    userSettings: Settings | null;

    chunks: Chunk[][];
    lastViewportCenter: {
        x: number,
        y: number
    } | null;
    currentViewportCenter: {
        x: number,
        y: number
    } | null;
    lastPointerDownPosition: {
        x: number,
        y: number
    } | null;

    currentClickedStar: Star | null;
    pointerOverStar: boolean;

    constructor(app: Application, editor: typeof GalaxyEditor) {
        super()

        this.app = app;
        this.editor = editor;
        this.container = new Container();
        this.container.sortableChildren = true;

        this.rulerService = null;
        this.wormHoleLayer = null;
        this.tooltipLayer = null;
        this.pathManager = null;
        this.brush = null;
        this.starSelection = null;

        this.galaxyCenterGraphics = null;

        this.stars = [];
        this.carriers = [];
        this.userSettings = null;

        this.zoomPercent = 0;
        this.minMouseChunkX = 0;
        this.maxMouseChunkX = 0;
        this.minMouseChunkY = 0;
        this.maxMouseChunkY = 0;
        this.firstChunkX = NaN;
        this.firstChunkY = NaN;
        this.lastChunkX = NaN;
        this.lastChunkY = NaN;
        this.numof_chunkX = NaN;
        this.numof_chunkY = NaN;

        this.zoomPercent = 100;
        this.lastZoomPercent = 100;
        this.lastZoomState = null;

        this.chunksContainer = null;
        this.wormHoleContainer = null;
        this.starContainer = null;
        this.waypointContainer = null;
        this.rulerPointContainer = null;
        this.highlightLocationsContainer = null;
        this.tooltipContainer = null;
        this.brushContainer = null;
        this.selectionContainer = null;
        this.selectionTopContainer = null;

        this.waypoints = null;

        this.chunks = [];
        this.lastViewportCenter = null;
        this.currentViewportCenter = null;
        this.lastPointerDownPosition = null;

        this.currentClickedStar = null;
        this.pointerOverStar = false;
    }

    _setupContainers() {
        this.chunksContainer = new Container({ isRenderGroup: true });
        this.chunksContainer.zIndex = 7;
        this.wormHoleContainer = new Container({ isRenderGroup: true });
        this.wormHoleContainer.zIndex = 0;
        this.starContainer = new Container({ isRenderGroup: true });
        this.starContainer.zIndex = 3;
        this.waypointContainer = new Container({ isRenderGroup: true });
        this.waypointContainer.zIndex = 8;
        this.waypointContainer.eventMode = 'none';
        this.rulerPointContainer = new Container({ isRenderGroup: true });
        this.rulerPointContainer.zIndex = 7;
        this.highlightLocationsContainer = new Container({ isRenderGroup: true });
        this.highlightLocationsContainer.zIndex = 5;
        this.tooltipContainer = new Container({ isRenderGroup: true });
        this.tooltipContainer.zIndex = 8;
        this.pathManager!.container.zIndex = 6;
        this.brushContainer = new Container({ isRenderGroup: true });
        this.brushContainer.zIndex = 10;
        this.selectionContainer = new Container({ isRenderGroup: true });
        this.selectionContainer.zIndex = 2;
        this.starSelection!.topContainer.zIndex = 10;

        this.container.addChild(this.wormHoleContainer);
        this.container.addChild(this.rulerPointContainer);
        this.container.addChild(this.waypointContainer);
        this.container.addChild(this.chunksContainer);
        this.container.addChild(this.starContainer);
        this.container.addChild(this.highlightLocationsContainer);
        this.container.addChild(this.tooltipContainer);
        this.container.addChild(this.pathManager!.container);
        this.container.addChild(this.brushContainer);
        this.container.addChild(this.selectionContainer);
        this.container.addChild(this.starSelection!.topContainer);

        // zIndex
        // WormHoleContainer (wormhole paths)
        // StarContainer (nebula, wormhole, asteroid field, hyperspace range, scanning)
        // HighlightLocationsContainer (waypoint highlight)
        // PathManager (existing waypoint paths)
        // RulerPointContainer (ruler paths)
        // ChunkContainer (chunk objects: stars, carriers)
        // TooltipContainer (tooltips)
        // BrushContainer (brush)

        this.container.sortChildren();
    }

    _getGalaxy() {
        return useGalaxyStore().$state.galaxy;
    }

    setup(userSettings: Settings) {
        this.userSettings = userSettings;

        // Create the Path Manager
        this.pathManager = new PathManager();
        this.pathManager.setup(userSettings);

        // Begin Selection setup
        this.starSelection = new StarSelection();
        this.starSelection.setup(this.userSettings);

        // Cleanup events
        this.stars.forEach(s => s.removeAllListeners());
        this.carriers.forEach(c => c.removeAllListeners());

        this.container.removeChildren();
        this._setupContainers();

        // Reset the canvas
        this.stars = [];
        this.carriers = [];

        // Add stars
        for (let i = 0; i < this._getGalaxy().stars.length; i++) {
            this.setupStar(userSettings, this._getGalaxy().stars[i]);
        }

        // Add carriers
        for (let i = 0; i < this._getGalaxy().carriers.length; i++) {
            this.setupCarrier(userSettings, this._getGalaxy().carriers[i]);
        }

        // -----------
        // Set up Waypoints
        if (this.waypoints) {
            this.waypoints.removeAllListeners();
        }

        this.waypoints = new Waypoints();
        this.waypoints.setup();
        this.waypoints.onWaypointCreatedHandler = this.waypoints.on('onWaypointCreated', this.onWaypointCreated.bind(this));
        this.waypoints.onWaypointOutOfRangeHandler = this.waypoints.on('onWaypointOutOfRange', this.onWaypointOutOfRange.bind(this));

        this.waypointContainer!.addChild(this.waypoints.container);

        // -----------
        // Set up Ruler Points
        if (this.rulerService) {
            this.rulerService.removeAllListeners();
        }

        this.rulerService = new RulerService();
        this.rulerService.setup();
        this.rulerService.onRulerPointCreatedHandler = this.rulerService.on('onRulerPointCreated', this.onRulerPointCreated.bind(this));
        this.rulerService.onRulerPointsClearedHandler = this.rulerService.on('onRulerPointsCleared', this.onRulerPointsCleared.bind(this));
        this.rulerService.onRulerPointRemovedHandler = this.rulerService.on('onRulerPointRemoved', this.onRulerPointRemoved.bind(this));

        this.rulerPointContainer!.addChild(this.rulerService.container);

        // -----------
        // Set up Worm Hole Paths
        this.wormHoleLayer = new WormHoleLayer();
        this.drawWormHoles();
        this.wormHoleContainer!.addChild(this.wormHoleLayer.container);

        // -----------
        // Set up Chunks
        this._setupChunks();

        // -----------
        // Set up Tooltip Layer
        this.tooltipLayer = new TooltipLayer();
        this.tooltipLayer.setup();
        this.tooltipContainer!.addChild(this.tooltipLayer.container);

        // -----------
        // Set up Brush
        this.brush = new Brush();
        this.brush.setup(this.userSettings);
        this.brushContainer!.addChild(this.brush.container);

        // Finish Selection setup
        this.selectionContainer!.addChild(this.starSelection.container);
        this.starSelection.onSelectionMoveEndedHandler = this.starSelection.on('onSelectionMoveEnded', this.onSelectionMoveEnded.bind(this));
    }

    setupStar(userSettings: Settings, starData: Star, interactive: boolean = true) {
        let star = this.stars.find(x => x.data!.id === starData.id);

        if (!star) {
            star = new StarObject(this.app);
            this.stars.push(star);

            this.starContainer!.addChild(star.fixedContainer);

            star.on('onStarClicked', this.onStarClicked.bind(this));
            star.on('onStarRightClicked', this.onStarRightClicked.bind(this));
            star.on('onStarDefaultClicked', this.onStarDefaultClicked.bind(this));
            star.on('onStarMouseOver', this.onStarMouseOver.bind(this));
            star.on('onStarMouseOut', this.onStarMouseOut.bind(this));
        }

        star.setup(starData, userSettings, GalaxyMap.lightYearDistance, interactive);

        return star;
    }

    setupCarrier(userSettings: Settings, carrierData: Carrier) {
        let carrier = this.carriers.find(x => x.data!.id === carrierData.id);

        if (!carrier) {
            carrier = new CarrierObject();
            this.carriers.push(carrier);

            carrier.on('onCarrierClicked', this.onCarrierClicked.bind(this));
            carrier.on('onCarrierRightClicked', this.onCarrierRightClicked.bind(this));
            carrier.on('onCarrierMouseOver', this.onCarrierMouseOver.bind(this));
            carrier.on('onCarrierMouseOut', this.onCarrierMouseOut.bind(this));
        }

        const player = helper.getPlayerById(carrierData.playerId);
        if (player == null) throw new Error("Carriers must have a valid player owner! " + JSON.stringify(carrierData));

        carrier.setup(carrierData, userSettings, this.pathManager!, player);

        return carrier;
    }

    draw() {
        this.drawGalaxyCenter();
        this.drawStars();
        this.drawCarriers();
        this.drawStarSelection();

        if (this.mode === 'ruler') {
            this.drawRulerPoints();
        } else {
            this.clearRulerPoints();
        }

        if (this.mode === 'waypoints') {
            this.drawWaypoints();
        } else {
            this.clearWaypoints();
        }
    }

    drawGalaxyCenter() {
        if (this.galaxyCenterGraphics) {
            this.starContainer!.removeChild(this.galaxyCenterGraphics);
            this.galaxyCenterGraphics = null;
        }

        if (this.userSettings!.visual.displayGalaxyCenter === 'disabled') return;

        this.galaxyCenterGraphics = new Graphics();
        const size = 10;
        let location: Location = { x: 0, y: 0 };
        let color: ColorSource = 0xFFFFFF;

        if (this.userSettings!.visual.displayGalaxyCenter === 'midpoint') {
            location = helper.calculateGalaxyMidpoint();
            color = 0x00BB00;
        } else if (this.userSettings!.visual.displayGalaxyCenter === 'centroid') {
            location = helper.calculateGalaxyCentroid();
            color = 0x00BBBB;
        }

        this.galaxyCenterGraphics.moveTo(location.x, location.y - size);
        this.galaxyCenterGraphics.lineTo(location.x, location.y + size);
        this.galaxyCenterGraphics.moveTo(location.x - size, location.y);
        this.galaxyCenterGraphics.lineTo(location.x + size, location.y);
        this.galaxyCenterGraphics.stroke({ width: 2, color: color, alpha: 1 });
        this.galaxyCenterGraphics.alpha = 0.75;
        this.galaxyCenterGraphics.zIndex = 0;
        this.galaxyCenterGraphics.hitArea = new Circle(0, 0, 0);

        this.starContainer!.addChild(this.galaxyCenterGraphics);
    }

    _setupChunks() {
        if (this.chunksContainer) {
            this.chunksContainer.removeChildren();
        }

        if (this.chunks) {
            this.chunks = [];
        }

        /* 
        Min and max coordinate values should always belong to star objects,
        as any carrier must either be at the same position as the most
        extreme star, or between two stars, meaning its coordinates cannot
        be more extreme than either of those stars.
        */

        const minX = helper.calculateMinStarX();
        const minY = helper.calculateMinStarY();
        const maxX = helper.calculateMaxStarX();
        const maxY = helper.calculateMaxStarY();

        this.firstChunkX = Math.floor(minX / GalaxyMap.chunkSize);
        this.firstChunkY = Math.floor(minY / GalaxyMap.chunkSize);

        this.lastChunkX = Math.floor(maxX / GalaxyMap.chunkSize);
        this.lastChunkY = Math.floor(maxY / GalaxyMap.chunkSize);

        this.numof_chunkX = this.lastChunkX - this.firstChunkX + 1;
        this.numof_chunkY = this.lastChunkY - this.firstChunkY + 1;

        const chunkColumns = Array(this.numof_chunkX);
        for (let i = 0; i < this.numof_chunkX; i++) { chunkColumns[i] = Array(this.numof_chunkY); }

        this.chunks = chunkColumns;

        for (let ix = 0; ix < this.numof_chunkX; ix++) {
            for (let iy = 0; iy < this.numof_chunkY; iy++) {
                this.chunks[ix][iy] = new Container({
                    isRenderGroup: true,
                    sortableChildren: true
                }) as Chunk;
                this.chunksContainer!.addChild(this.chunks[ix][iy]);
                this.chunks[ix][iy].mapObjects = [];
                if (this.userSettings!.technical.chunkVisualizer === 'enabled') {
                    const chunkVisualizer = new Graphics();
                    chunkVisualizer.hitArea = new Circle(0, 0, 0);
                    chunkVisualizer.zIndex = -10;
                    chunkVisualizer.alpha = 0.5;
                    chunkVisualizer.rect(
                        (this.firstChunkX + ix) * GalaxyMap.chunkSize, (this.firstChunkY + iy) * GalaxyMap.chunkSize,
                        GalaxyMap.chunkSize, GalaxyMap.chunkSize
                    );
                    chunkVisualizer.stroke({ width: 4, color: 0xFF0000, alpha: 1 });
                    this.chunks[ix][iy].addChild(chunkVisualizer);
                    this.chunks[ix][iy].visualizer = chunkVisualizer;
                }
            }
        }

        this.stars.forEach(s => this.addContainerToChunk(s, this.chunks));
        this.carriers.forEach(c => this.addContainerToChunk(c, this.chunks));

        this.pathManager!.setupChunks();
    }

    addContainerToChunk(mapObject: StarObject | CarrierObject, chunks: Chunk[][]) { // Star or carrier
        const chunkX = Math.floor(mapObject.data!.location.x / GalaxyMap.chunkSize);
        const chunkY = Math.floor(mapObject.data!.location.y / GalaxyMap.chunkSize);

        if (chunkX < this.firstChunkX || chunkX > this.lastChunkX || chunkY < this.firstChunkY || chunkY > this.lastChunkY) {
            this._setupChunks();
            return; // We will be adding this container twice otherwise.
        }

        const ix = chunkX - this.firstChunkX;
        const iy = chunkY - this.firstChunkY;

        chunks[ix][iy].addChild(mapObject.container);
        (chunks[ix][iy] as any).mapObjects.push(mapObject);
    }

    removeContainerFromChunk(mapObject: StarObject | CarrierObject, chunks: Chunk[][]) {
        const chunkX = Math.floor(mapObject.data!.location.x / GalaxyMap.chunkSize);
        const chunkY = Math.floor(mapObject.data!.location.y / GalaxyMap.chunkSize);
        const ix = chunkX - this.firstChunkX;
        const iy = chunkY - this.firstChunkY;

        chunks[ix][iy].removeChild(mapObject.container);
        const index = (chunks[ix][iy] as any).mapObjects.indexOf(mapObject);
        if (index > -1) { (chunks[ix][iy] as any).mapObjects.splice(index, 1); }
    }

    removeMapObjectFromChunks(mapObject: StarObject | CarrierObject, chunks: Chunk[][]) {
        for (const chunkX of chunks) {
            for (const chunkY of chunkX) {
                if ((chunkY as any).mapObjects.indexOf(mapObject) > -1) {
                    (chunkY as any).mapObjects.splice((chunkY as any).mapObjects.indexOf(mapObject), 1);
                    (chunkY as any).removeChild(mapObject.container);
                    if ((chunkY as any).mapObjects.includes(mapObject)) throw new Error('Could not remove map object from chunks!');
                }
            }
        }
    }

    reloadGalaxy(userSettings: Settings) {
        this.userSettings = userSettings;

        this.setup(userSettings);
        this.draw();
    }


    _disableCarriersInteractivity() {
        for (let i = 0; i < this.carriers.length; i++) {
            const c = this.carriers[i];

            c.disableInteractivity();
        }
    }

    _enableCarriersInteractivity() {
        for (let i = 0; i < this.carriers.length; i++) {
            const c = this.carriers[i];

            c.enableInteractivity();
        }
    }

    disableStarsInteractivity() {
        for (let i = 0; i < this.stars.length; i++) {
            const s = this.stars[i];

            s.disableInteractivity();
        }
    }

    enableStarsInteractivity() {
        for (let i = 0; i < this.stars.length; i++) {
            const s = this.stars[i];

            s.enableInteractivity();
        }
    }

    setMode(mode: string, args: any) {
        this.mode = mode;
        this.modeArgs = args;

        this.unselectAllStars();
        this.clearRulerPoints();
        this.clearWaypoints();
        this.unselectAllCarriers();
        this.clearBrush();
        this.clearSelectionForModeChange();

        switch (this.mode) {
            case 'select':
                this._disableCarriersInteractivity();
                break;
            case 'ruler':
                this.drawRulerPoints();
                break;
            case 'waypoints':
                this._disableCarriersInteractivity();
                this.drawWaypoints();
                break;
            case 'brush':
                this._disableCarriersInteractivity();
                this.drawBrush();
                break;
            case 'galaxy':
            default:
                this._enableCarriersInteractivity();
                this.enableStarsInteractivity();
        }
    }

    resetMode() {
        this.setMode('galaxy', this.modeArgs);
    }

    setModeArgs(args: any) {
        this.modeArgs = args;
    }

    setModeArg(index: number, arg: any) {
        if (index < 0 || index >= this.modeArgs.length) return;
        this.modeArgs[index] = arg;
    }

    removeLastRulerPoint() {
        this.rulerService!.removeLastRulerPoint();
    }

    updateBrush(radius: number, shape: string) {
        this.brush!.draw(radius, shape);
    }

    drawStars() {
        for (let i = 0; i < this.stars.length; i++) {
            const star = this.stars[i];

            this.drawStar(star);
        }
    }

    drawStar(star: StarObject) {
        star.draw();
        star.onZoomChanging(this.zoomPercent, true);
    }

    _undrawStar(star: StarObject) {
        star.removeAllListeners();
        star.cleanUpEventHandlers();

        this.starContainer!.removeChild(star.fixedContainer);

        this.removeMapObjectFromChunks(star, this.chunks);

        this.stars.splice(this.stars.indexOf(star), 1);

        star.destroy();

        this.tooltipLayer!.clear();
    }

    undrawStar(starData: Star) {
        const existing = this.stars.find(x => x.data!.id === starData.id);

        if (existing) {
            this._undrawStar(existing);
        }
    }

    _updateStarShips(star: StarObject) {
        star.updateShips();
    }

    updateStarShips(starData: Star) {
        const existing = this.stars.find(x => x.data!.id === starData.id);

        if (existing) {
            this._updateStarShips(existing);
        }
    }

    _updateStarId(star: StarObject, newId: string) {
        star.updateId(newId);
    }

    updateStarId(starData: Star) {
        const existing = this.stars.find(x => x.data!.id === starData.id);

        if (existing) {
            this._updateStarId(existing, starData.id);
        }
    }

    _updateStarName(star: StarObject, newName?: string) {
        star.updateName(newName);
    }

    updateStarName(starData: Star) {
        const existing = this.stars.find(x => x.data!.id === starData.id);

        if (existing) {
            this._updateStarName(existing, starData.name);
        }
    }

    _transformStar(star: StarObject) {
        star.updatePosition();
    }

    transformStar(starData: Star) {
        const existing = this.stars.find(x => x.data!.id === starData.id);

        if (existing) {
            this._transformStar(existing);
            this.resetMapObjectChunk(existing);
        }
    }

    updateWaypointsOnStarDeletion(starData: Star) {
        for (const carrier of this.carriers) {
            for (let i = 0; i < carrier.data!.waypoints.length; i++) {
                if (carrier.data!.waypoints[i].destination === starData.id) {
                    carrier.data!.waypoints.length = i;
                    this._updateCarrierWaypoints(carrier, carrier.data!.waypoints); // Still need to draw the new waypoints
                }
            }
        }
    }

    updateWaypointsOnMultipleStarDeletion(starIds: Set<string>) {
        for (const carrier of this.carriers) {
            for (let i = 0; i < carrier.data!.waypoints.length; i++) {
                if (starIds.has(carrier.data!.waypoints[i].destination)) {
                    carrier.data!.waypoints.length = i;
                    this._updateCarrierWaypoints(carrier, carrier.data!.waypoints); // Still need to draw the new waypoints
                }
            }
        }
    }

    drawCarriers() {
        for (let i = 0; i < this.carriers.length; i++) {
            const carrier = this.carriers[i];

            this.drawCarrier(carrier);
        }
    }

    drawCarrier(carrier: CarrierObject) {
        carrier.draw();
        carrier.onZoomChanging(this.zoomPercent);
    }

    _undrawCarrier(carrier: CarrierObject) {
        carrier.removeAllListeners();
        carrier.cleanUpEventHandlers();
        carrier.clearPaths();

        this.removeMapObjectFromChunks(carrier, this.chunks);

        this.carriers.splice(this.carriers.indexOf(carrier), 1);

        carrier.destroy();

        this.tooltipLayer!.clear();
    }

    undrawCarrier(carrierData: Carrier) {
        const existing = this.carriers.find(x => x.data!.id === carrierData.id);

        if (existing) {
            this._undrawCarrier(existing);
        }
    }

    _updateCarrierWaypoints(carrier: CarrierObject, waypoints: CarrierWaypoint[]) {
        carrier.updateWaypoints();
    }

    updateCarrierWaypoints(carrierData: Carrier) {
        const existing = this.carriers.find(x => x.data!.id === carrierData.id);

        if (existing) {
            this._updateCarrierWaypoints(existing, carrierData.waypoints);
        }
    }

    _updateCarrierShips(carrier: CarrierObject) {
        carrier.updateShips();
    }

    updateCarrierShips(carrier: Carrier) {
        const existing = this.carriers.find(x => x.data!.id === carrier.id);

        if (existing) {
            this._updateCarrierShips(existing);
        }
    }

    resetMapObjectChunk(mapObject: StarObject | CarrierObject) {
        this.removeMapObjectFromChunks(mapObject, this.chunks);
        this.addContainerToChunk(mapObject, this.chunks);
    }

    drawWaypoints() {
        this.waypoints!.draw(this.modeArgs[0]);
    }

    clearWaypoints() {
        this.waypoints!.clear();
    }

    drawRulerPoints() {
        this.rulerService!.draw();
    }

    clearRulerPoints() {
        this.rulerService!.setup();
    }

    drawWormHoles() {
        this.wormHoleLayer!.setup();
        this.wormHoleLayer!.draw();
    }

    drawBrush() {
        this.brush!.draw(this.modeArgs[0], this.modeArgs[1]);
    }

    clearBrush() {
        this.brush!.clear();
    }

    drawStarSelection() {
        this.starSelection!.draw();
    }

    clearStarSelection() {
        this.starSelection!.clear();
    }

    clearSelectionForModeChange() {
        this.starSelection!.clearForModeChange();
    }

    setupStarSelectionMoveGraphics() {
        this.starSelection!.setupMoveGraphics();
    }

    cancelCurrentSelectionAction() {
        this.starSelection!.cancelCurrentAction(this.modeArgs[1]);
    }

    setSelectionIsCopy(isCopy: boolean) {
        this.starSelection!.setIsCopy(isCopy);
    }

    setSelectionContainerInteractivity(interactive: boolean) {
        this.starSelection!.setContainerInteractivity(interactive);
    }

    endSelectionMove() {
        this.starSelection!.endSelectionMove();
    }

    panToCarrier(carrier: Carrier) {
        this.panToLocation(carrier.location);
    }

    panToStar(star: Star) {
        this.panToLocation(star.location);
    }

    panToLocation(location: Location) {
        this.editor.viewport!.moveCenter(location.x, location.y);
    }

    clickStar(starId: string) {
        const star = this.stars.find(s => s.data!.id === starId);

        star!.onClicked(null, false);
        star!.select();
    }

    clickCarrier(carrierId: string) {
        const carrier = this.carriers.find(c => c.data!.id === carrierId);

        carrier!.onClicked(null, false);
        carrier!.select();
    }

    unselectAllStars() {
        for (let i = 0; i < this.stars.length; i++) {
            const s = this.stars[i];

            s.unselect();
        }
    }

    unselectAllCarriers() {
        for (let i = 0; i < this.carriers.length; i++) {
            const c = this.carriers[i];

            c.unselect();
        }
    }

    unselectAllStarsExcept(star: StarObject) {
        this.stars
            .filter(s => s.isSelected || s.data?.id === star.data?.id) // Get only stars that are selected or the e star.
            .forEach(s => {
                // Set all other stars to unselected.
                if (s.data!.id !== star.data!.id) {
                    s.unselect();
                }
            });
    }

    unselectAllCarriersExcept(carrier: CarrierObject) {
        this.carriers
            .filter(c => c.isSelected || c.data!.id === carrier.data!.id)
            .forEach(c => {
                // Set all other carriers to unselected.
                if (c.data!.id !== carrier.data!.id) {
                    c.unselect();
                }
            });
    }

    onTick() {
        const viewportWidth = this.editor.viewport!.right - this.editor.viewport!.left;
        //const viewportHeight = this.editor.viewport!.bottom - this.editor.viewport!.top;

        //const viewportXRadius = viewportWidth / 2.0;
        //const viewportYRadius = viewportHeight / 2.0;

        //const viewportCenter = this.editor.viewport!.center;

        this.lastViewportCenter = this.currentViewportCenter || null;
        this.currentViewportCenter = this.editor.viewport!.center;

        this.zoomPercent = (this.editor.viewport!.screenWidth / viewportWidth) * 100;

        /*
        const viewportData = {
            center: viewportCenter,
            xradius: viewportXRadius,
            yradius: viewportYRadius
        };
        */

        //chunk culling

        const firstX = Math.floor(this.editor.viewport!.left / GalaxyMap.chunkSize);
        const firstY = Math.floor(this.editor.viewport!.top / GalaxyMap.chunkSize);

        const lastX = Math.floor(this.editor.viewport!.right / GalaxyMap.chunkSize);
        const lastY = Math.floor(this.editor.viewport!.bottom / GalaxyMap.chunkSize);

        const positionChanging = this.lastViewportCenter == null || this.currentViewportCenter.x !== this.lastViewportCenter.x || this.currentViewportCenter.y !== this.lastViewportCenter.y;
        const zoomChanging = Math.abs(this.zoomPercent - this.lastZoomPercent) > (1.0 / 128.0);

        if (!positionChanging && !zoomChanging) {
            return;
        }

        let needToUpdate = false;
        const currentZoomState = {
            shipCount: this.zoomPercent > this.userSettings!.visual.zoomLevels.star.shipCount,
            id: this.zoomPercent > this.userSettings!.visual.zoomLevels.star.id,
            resources: this.zoomPercent > this.userSettings!.visual.zoomLevels.star.resources,
            infrastructure: this.zoomPercent > this.userSettings!.visual.zoomLevels.star.infrastructure,
            carrierShips: this.zoomPercent > this.userSettings!.visual.zoomLevels.carrier.carrierShips
        }

        if (zoomChanging) {
            if (
                this.lastZoomState == null ||
                currentZoomState.shipCount !== this.lastZoomState.shipCount ||
                currentZoomState.id !== this.lastZoomState.id ||
                currentZoomState.resources !== this.lastZoomState.resources ||
                currentZoomState.infrastructure !== this.lastZoomState.infrastructure ||
                currentZoomState.carrierShips !== this.lastZoomState.carrierShips
            ) {
                needToUpdate = true;
            }
        }

        for (let ix = 0; ix < this.numof_chunkX; ix++) {
            for (let iy = 0; iy < this.numof_chunkY; iy++) {
                if (
                    (ix >= (firstX - this.firstChunkX)) && (ix <= (lastX - this.firstChunkX)) &&
                    (iy >= (firstY - this.firstChunkY)) && (iy <= (lastY - this.firstChunkY))
                ) {
                    if (!this.chunks[ix][iy].visible) {
                        this.chunks[ix][iy].visible = true;
                        this.chunks[ix][iy].interactiveChildren = true;
                        if (this.userSettings!.technical.chunkVisualizer === 'enabled') (this.chunks[ix][iy] as any).visualizer.visible = true;
                        for (const mapObject of (this.chunks[ix][iy] as any).mapObjects) {
                            mapObject.onZoomChanging(this.zoomPercent, true);
                        }
                    }
                    else {
                        if (zoomChanging) {
                            for (const mapObject of (this.chunks[ix][iy] as any).mapObjects) {
                                mapObject.onZoomChanging(this.zoomPercent, needToUpdate);
                            }
                        }
                    }
                }
                else {
                    this.chunks[ix][iy].visible = false;
                    this.chunks[ix][iy].interactiveChildren = false;
                    if (this.userSettings!.technical.chunkVisualizer === 'enabled') (this.chunks[ix][iy] as any).visualizer.visible = false;
                }
            }
        }

        this.starSelection!.setRotateGraphicsScale(this.zoomPercent);

        this.pathManager!.onTick(this.zoomPercent, this.editor.viewport!, zoomChanging);

        this.lastZoomPercent = this.zoomPercent;
        this.lastZoomState = currentZoomState;
    }

    onViewportPointerDown(e: any) {
        this.lastPointerDownPosition = Object.assign({}, e.global);

        if (
            this.mode === 'select' && this.lastPointerDownPosition != null &&
            !this.pointerOverStar && this.editor.viewport!.pause
        ) {
            const button = e.originalEvent.button;
            let isRemoving: boolean;
            // modeArgs[0] reverses action
            if (this.modeArgs[0]) {
                isRemoving = !(button === 2);
            } else {
                isRemoving = button === 2;
            }
            this.starSelection!.onViewportPointerDown(this.starContainer!.toLocal(this.lastPointerDownPosition), this.modeArgs[1], isRemoving);
        }
    }

    isDragMotion(position: { x: number, y: number }) {
        const DRAG_THRESHOLD = 8; //max distance in pixels
        const dxSquared = Math.pow(Math.abs(this.lastPointerDownPosition!.x - position.x), 2);
        const dySquared = Math.pow(Math.abs(this.lastPointerDownPosition!.y - position.y), 2);
        const distance = Math.sqrt(dxSquared + dySquared);

        return (distance > DRAG_THRESHOLD);
    }

    onStarClicked(dic: any) {
        const e = dic.starData;
        if (dic.eventData && this.isDragMotion(dic.eventData.global)) return;

        this.currentClickedStar = e;

        if (this.mode === 'galaxy' || this.mode === 'brush') {
            useGalaxyStore().starClicked({
                star: e,
                permitCallback: () => {
                    dic.permitCallback && dic.permitCallback();

                    if (this.mode === 'galaxy') this.selectStar(e, dic);
                }
            });
        } else if (this.mode === 'ruler') {
            this.rulerService!.onStarClicked(e);
        } else if (this.mode === 'waypoints') {
            this.waypoints!.onStarClicked(e);
        } else if (this.mode === 'select') {
            // modeArgs[0] reverses action
            if (this.modeArgs[0]) {
                this.starSelection!.onStarRightClicked(e);
            } else this.starSelection!.onStarClicked(e);
        }
    }

    selectStar(e: any, dic: any) {
        const selectedStar = this.stars.find(x => x.data!.id === e.id)!;

        this.unselectAllStarsExcept(selectedStar);
        this.unselectAllCarriers();

        if (!dic.tryMultiSelect || !this.tryMultiSelect(e.location)) {
            selectedStar.toggleSelected();
            this.emit('onStarClicked', e);
        }
    }

    onStarDefaultClicked(dic: any) {
        const e = dic.starData;
        if (dic.eventData && this.isDragMotion(dic.eventData.global)) return;

        this.selectStar(e, dic);
    }

    onStarRightClicked(dic: any) {
        const e = dic.starData;
        if (dic.eventData && this.isDragMotion(dic.eventData.global)) return;

        this.currentClickedStar = e;

        if (this.mode === 'galaxy') {
            this.emit('onStarRightClicked', e);
        } else if (this.mode === 'select') {
            // modeArgs[0] reverses action
            if (this.modeArgs[0]) {
                this.starSelection!.onStarClicked(e);
            } else this.starSelection!.onStarRightClicked(e);
        }
    }

    onStarMouseOver(e: any) {
        if (this.mode !== 'brush' && this.mode !== 'select') this.tooltipLayer!.drawTooltipStar(e.data);
        this.pointerOverStar = true;
    }

    onStarMouseOut(e: any) {
        this.tooltipLayer!.clear();
        this.pointerOverStar = false;
    }

    onCarrierClicked(dic: any) {
        // ignore clicks if it's a drag motion
        if (dic.eventData && this.isDragMotion(dic.eventData.global)) { return; }

        const e = dic.carrierData;
        // Clicking carriers should only raise events to the UI if in galaxy mode.
        if (this.mode === 'galaxy') {

            const selectedCarrier = this.carriers.find(x => x.data!.id === e.id)!;

            this.unselectAllStars();
            this.unselectAllCarriersExcept(selectedCarrier);

            selectedCarrier.toggleSelected();

            if (!dic.tryMultiSelect || !this.tryMultiSelect(e.location)) {
                this.emit('onCarrierClicked', e);
            } else {
                selectedCarrier.unselect();
            }
        } else if (this.mode === 'ruler') {
            this.rulerService!.onCarrierClicked(e);
        }
    }

    onCarrierRightClicked(e: any) {
        if (this.mode === 'galaxy') {
            this.emit('onCarrierRightClicked', e);
        }
    }

    onCarrierMouseOver(e: any) {
        // If the carrier is orbiting something then send the mouse over event
        // to the star.
        if (e.data.orbiting) {
            const star = this.stars.find(s => s.data!.id === e.data.orbiting)!;
            star.onMouseOver(e);
        }

        this.tooltipLayer!.drawTooltipCarrier(e.data);
    }

    onCarrierMouseOut(e: any) {
        // If the carrier is orbiting something then send the mouse over event
        // to the star.
        if (e.data.orbiting) {
            const star = this.stars.find(s => s.data!.id === e.data.orbiting)!;
            star.onMouseOut(e);
        }

        this.tooltipLayer!.clear();
    }

    onWaypointCreated(e: any) {
        this.emit('onWaypointCreated', e);
    }

    onWaypointOutOfRange(e: any) {
        this.emit('onWaypointOutOfRange', e);
    }

    onRulerPointCreated(e: any) {
        this.emit('onRulerPointCreated', e);
    }

    onRulerPointRemoved(e: any) {
        this.emit('onRulerPointRemoved', e);
    }

    onRulerPointsCleared(e: any) {
        this.emit('onRulerPointsCleared', e);
    }

    onSelectionMoveEnded(e: any) {
        this.emit('onSelectionMoveEnded', e);
    }

    tryMultiSelect(location: Location) {
        // See if there are any other objects close by, if so then
        // we want to allow the user to select which one they want as there might be
        // objects on the map that are on top of each other or very close together.
        const distance = 10;

        const closeStars = this.stars
            .map(s => {
                return {
                    ref: s,
                    type: 'star',
                    distance: helper.getDistanceBetweenLocations(location, s.data!.location),
                    data: s.data!
                }
            })
            .filter(s => s.distance <= distance);

        const closeCarriers = this.carriers
            .map(c => {
                return {
                    ref: c,
                    type: 'carrier',
                    distance: helper.getDistanceBetweenLocations(location, c.data!.location),
                    data: c.data!
                }
            })
            .filter(c => c.distance <= distance);

        // order by closest first.
        const closeObjects = (closeStars as { ref: StarObject | CarrierObject, type: string, distance: number, data: Star | Carrier }[]).concat(closeCarriers)
            .sort((a, b) => {
                if (a.type !== b.type) { // Sort stars first
                    return b.type.localeCompare(a.type);
                }

                if (a.distance === b.distance) {
                    return a.data!.id.localeCompare(b.data!.id); // If the distances are identical, sort by id ascending.
                }

                return a.distance < b.distance ? -1 : 1; // Finally, sort by distance ascending.
            });

        if (closeObjects.length > 1) {
            const star = closeObjects.find(co => co.type === 'star');

            if (star) {
                star.ref.toggleSelected(); // Select to star to get the ranges drawn on the map
            }

            const eventObj = closeObjects.map(co => {
                return {
                    type: co.type,
                    data: co.data,
                    distance: co.distance
                }
            });

            this.emit('onObjectsClicked', eventObj);

            return true;
        }

        return false;
    }

    refreshZoom(zoomPercent: number) {
        this.zoomPercent = zoomPercent;

        let needToUpdate = false;
        const currentZoomState = {
            shipCount: this.zoomPercent > this.userSettings!.visual.zoomLevels.star.shipCount,
            id: this.zoomPercent > this.userSettings!.visual.zoomLevels.star.id,
            resources: this.zoomPercent > this.userSettings!.visual.zoomLevels.star.resources,
            infrastructure: this.zoomPercent > this.userSettings!.visual.zoomLevels.star.infrastructure
        }

        if (
            this.lastZoomState == null ||
            currentZoomState.shipCount !== this.lastZoomState.shipCount ||
            currentZoomState.id !== this.lastZoomState.id ||
            currentZoomState.resources !== this.lastZoomState.resources ||
            currentZoomState.infrastructure !== this.lastZoomState.infrastructure
        ) {
            needToUpdate = true;
        }

        this.stars.forEach(s => s.refreshZoom(zoomPercent, needToUpdate));
        this.carriers.forEach(c => c.refreshZoom(zoomPercent));
    }

    highlightLocation(location: Location, opacity = 1) {
        const graphics = new Graphics();
        const radius = 12;

        graphics.stroke({ width: 1, color: 0xFFFFFF, alpha: opacity });
        graphics.star(location.x, location.y, radius, radius, radius - 3);

        this.highlightLocationsContainer!.addChild(graphics);
    }

    clearHighlightedLocations() {
        this.highlightLocationsContainer!.removeChildren();
    }

    onCursorMoved(e: any) {
        const local = this.starContainer!.toLocal(e.global);
        if (this.mode === 'brush') {
            const snappedLoc = helper.getSnappedLocation(local, this.modeArgs[2], this.modeArgs[3], this.modeArgs[4], this.modeArgs[5], this.modeArgs[6]);
            this.brush!.updatePosition(snappedLoc);
        } else if (this.mode === 'select' && this.editor.viewport!.pause) {
            this.starSelection!.onCursorMove(local, this.modeArgs[1]);
        }
        return local;
    }

    onViewportPointerUp(e: any) {
        const local = this.starContainer!.toLocal(e.global);
        if (e.data && this.isDragMotion(e.global)) {
            if (this.mode !== 'select') return;
        }

        if (this.mode === 'brush') {
            if (e?.originalEvent) {
                const button = e.originalEvent.button;
                const snappedLoc = helper.getSnappedLocation(local, this.modeArgs[2], this.modeArgs[3], this.modeArgs[4], this.modeArgs[5], this.modeArgs[6]);
                if (button === 2) {
                    this.emit('onBrushRightClick', snappedLoc, this.currentClickedStar);
                } else {
                    this.emit('onBrushClick', snappedLoc, this.currentClickedStar);
                }
            }
        } else if (this.mode === 'select' && this.editor.viewport!.pause) {
            this.starSelection!.onViewportPointerUp(local, this.modeArgs[1]);
        }

        this.currentClickedStar = null;
    }

    drawStarSelectedCircle(starId: string, force: boolean = false) {
        const existing = this.stars.find(x => x.data!.id === starId);

        if (existing) {
            this._drawStarSelectedCircle(existing, force);
        }
    }

    _drawStarSelectedCircle(star: StarObject, force: boolean = false) {
        star.drawSelectedCircle(force);
    }
}

export default GalaxyMap;