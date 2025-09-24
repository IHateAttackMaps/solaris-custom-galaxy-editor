import { Container, Graphics, type ColorSource } from 'pixi.js';
import helper from './helper';
import type { Settings } from './types/Settings';
import GalaxyMap from './map';
import type CarrierObject from './carrier';
import type { Location } from './types/Location';
import type { Viewport } from 'pixi-viewport';
import type { Star } from './types/Star';
import type { Carrier } from './types/Carrier';

class PathManager {
    container: Container;
    chunksContainer: Container | null;
    chunklessContainer: Container | null;
    chunks: Container[][];
    firstChunkX: number;
    firstChunkY: number;
    lastChunkX: number;
    lastChunkY: number;
    chunksXlen: number;
    chunksYlen: number;

    userSettings: Settings | null;

    zoomPercent: number;
    chunkSize: number;

    clampedScaling: boolean;
    baseScale: number;
    minScale: number;
    maxScale: number;

    paths: Map<CarrierObject, { graphics: Graphics, pointA: Location, pointB: Location }[]>;

    constructor() {
        this.zoomPercent = 100;
        this.chunkSize = GalaxyMap.chunkSize;

        this.container = new Container({ isRenderGroup: true });
        this.chunksContainer = null;
        this.chunklessContainer = null;
        this.chunks = [];
        this.firstChunkX = NaN;
        this.firstChunkY = NaN;

        this.userSettings = null;

        this.paths = new Map();

        this.clampedScaling = false;
        this.baseScale = NaN;
        this.minScale = NaN;
        this.maxScale = NaN;
        this.lastChunkX = NaN;
        this.lastChunkY = NaN;
        this.chunksXlen = NaN;
        this.chunksYlen = NaN;
    }

    setup(userSettings: Settings) {
        this.userSettings = userSettings;
        this._loadSettings();

        this.paths.clear();
        /*
         * {
         *  id: mapObject1.id + " + mapObject2.id
         *  carriers: array of carrier IDs
         *  graphics: Graphics
         * }
        */
        if (this.chunklessContainer) {
            this.container.removeChild(this.chunklessContainer);
        }
        if (this.chunksContainer) {
            this.container.removeChild(this.chunksContainer);
        }

        this.chunksContainer = new Container();
        this.chunklessContainer = new Container();
        this.container.addChild(this.chunklessContainer);
        this.container.addChild(this.chunksContainer);

        this.setupChunks();
    }

    setupChunks() {
        if (this.chunksContainer) {
            this.chunksContainer.removeChildren();
        }

        if (this.chunks) {
            this.chunks = [];
        }

        const minX = helper.calculateMinStarX();
        const minY = helper.calculateMinStarY();
        const maxX = helper.calculateMaxStarX();
        const maxY = helper.calculateMaxStarY();

        this.firstChunkX = Math.floor(minX / this.chunkSize);
        this.firstChunkY = Math.floor(minY / this.chunkSize);
        const lastChunkX = Math.floor(maxX / this.chunkSize);
        const lastChunkY = Math.floor(maxY / this.chunkSize);

        const chunksXlen = (lastChunkX - this.firstChunkX) + 1;
        const chunksYlen = (lastChunkY - this.firstChunkY) + 1;

        this.chunks = Array(chunksXlen);
        for (let x = 0; x < chunksXlen; x++) {
            this.chunks[x] = Array(chunksYlen);
            for (let y = 0; y < chunksYlen; y++) {
                this.chunks[x][y] = new Container({
                    isRenderGroup: true
                });
                this.chunksContainer!.addChild(this.chunks[x][y]);
            }
        }

        for (let paths of this.paths.values()) {
            paths.forEach(p => this.addPathToChunk(p.graphics, p.pointA, p.pointB));
        }
    }

    _loadSettings() {
        this.clampedScaling = this.userSettings!.visual.objectScaling === 'clamped';
        this.baseScale = 1;
        this.minScale = this.userSettings!.visual.objectMinimumScale / 4.0;
        this.maxScale = this.userSettings!.visual.objectMaximumScale / 4.0;
    }

    addPath(objectA: Star | Carrier, objectB: Star | Carrier, carrierMapObject: CarrierObject) {
        const PATH_WIDTH = 0.5 * this.userSettings!.visual.carrierPathWidth;
        const looped = carrierMapObject.data!.waypointsLooped;
        const lineAlpha = looped ? 0.5 : 0.5;

        let graphics: Graphics;
        if (looped) {
            graphics = this._createLoopedPathGraphics(objectA, objectB, carrierMapObject.colour!);
        } else {
            const lineWidth = PATH_WIDTH;
            graphics = this._createSolidPathGraphics(lineWidth, objectA, objectB, carrierMapObject.colour!);
        }
        graphics.alpha = lineAlpha;

        const path = {
            graphics: graphics,
            pointA: objectA.location,
            pointB: objectB.location
        };

        if (this.paths.has(carrierMapObject)) {
            this.paths.get(carrierMapObject)!.push(path);
        } else {
            this.paths.set(carrierMapObject, [path]);
        }
    }

    removePaths(carrierMapObject: CarrierObject, pathsToKeep: number = 0) {
        const paths = this.paths.get(carrierMapObject);
        if (!paths) return;

        for (let i = pathsToKeep; i < paths.length; i++) {
            const pathGraphics = paths[i].graphics;

            if ((pathGraphics as any).chunk) {
                (pathGraphics as any).chunk.removeChild(pathGraphics);
            } else {
                this.chunklessContainer!.removeChild(pathGraphics);
            }
        }

        paths.length = pathsToKeep;
    }

    addPathToChunk(pathGraphics: Graphics, locA: Location, locB: Location) {
        const chunkXA = Math.floor(locA.x / this.chunkSize);
        const chunkYA = Math.floor(locA.y / this.chunkSize);
        const chunkXB = Math.floor(locB.x / this.chunkSize);
        const chunkYB = Math.floor(locB.y / this.chunkSize);

        if ((chunkXA === chunkXB) && (chunkYA === chunkYB)) {
            const ix = chunkXA - this.firstChunkX;
            const iy = chunkYA - this.firstChunkY;

            this.chunks[ix][iy].addChild(pathGraphics);
            (pathGraphics as any).chunk = this.chunks[ix][iy];
        } else {
            this.chunklessContainer!.addChild(pathGraphics);
        }
        this._updatePathScale(pathGraphics);
    }

    onTick(zoomPercent: number, viewport: Viewport, zoomChanging: boolean) {
        this.setScale(zoomPercent, viewport, zoomChanging);
        this.zoomPercent = zoomPercent;
    }

    setScale(zoomPercent: number, viewport: Viewport, zoomChanging: boolean) {
        let yscale = this.baseScale;
        if (this.clampedScaling) {
            const currentScale = zoomPercent / 100;
            if (currentScale < this.minScale) {
                yscale = (1 / currentScale) * this.minScale;
            } else if (currentScale > this.maxScale) {
                yscale = (1 / currentScale) * this.maxScale;
            }
        }

        if (zoomChanging) {
            for (const path of this.chunklessContainer!.children) {
                path.scale = { x: 1, y: yscale };
            }
        }

        //chunk culling
        const firstX = Math.floor(viewport.left / this.chunkSize);
        const firstY = Math.floor(viewport.top / this.chunkSize);

        const lastX = Math.floor(viewport.right / this.chunkSize);
        const lastY = Math.floor(viewport.bottom / this.chunkSize);

        for (let ix = 0; ix < this.chunksXlen; ix += 1) {
            for (let iy = 0; iy < this.chunksYlen; iy += 1) {
                if (
                    (ix >= (firstX - this.firstChunkX)) && (ix <= (lastX - this.firstChunkX)) &&
                    (iy >= (firstY - this.firstChunkY)) && (iy <= (lastY - this.firstChunkY))
                ) {
                    if (!this.chunks[ix][iy].visible) {
                        this.chunks[ix][iy].visible = true
                        for (const path of this.chunks[ix][iy].children) {
                            path.scale = { x: 1, y: yscale };
                        }
                    }
                    else {
                        if (zoomChanging) {
                            for (const path of this.chunks[ix][iy].children) {
                                path.scale = { x: 1, y: yscale };
                            }
                        }
                    }
                }
                else {
                    this.chunks[ix][iy].visible = false;
                }
            }
        }
    }

    _updatePathScale(path: any) {
        let yscale = this.baseScale;
        if (this.clampedScaling) {
            const currentScale = this.zoomPercent / 100;
            if (currentScale < this.minScale) {
                yscale = (1 / currentScale) * this.minScale;
            } else if (currentScale > this.maxScale) {
                yscale = (1 / currentScale) * this.maxScale;
            }
        }
        path.scale = { x: 1, y: yscale };
    }

    _createLoopedPathGraphics(objectA: Star | Carrier, objectB: Star | Carrier, pathColour: ColorSource) {
        const PATH_WIDTH = 0.5 * this.userSettings!.visual.carrierPathWidth;
        const lineWidth = PATH_WIDTH;

        let pathGraphics
        if (this.userSettings!.visual.carrierLoopStyle === 'solid') {
            pathGraphics = this._createSolidPathGraphics(lineWidth / 3.0, objectA, objectB, pathColour);
        }
        else {
            pathGraphics = this._createDashedPathGraphics(lineWidth, objectA, objectB, pathColour);
        }
        return pathGraphics;
    }

    _createDashedPathGraphics(lineWidth: number, objectA: Star | Carrier, objectB: Star | Carrier, pathColour: ColorSource) {
        const pointA = objectA.location;
        const pointB = objectB.location;
        const DASH_LENGTH = Math.min(Math.max(1, this.userSettings!.visual.carrierPathDashLength), 16);
        const VOID_LENGTH = DASH_LENGTH / 2.0;
        const COMBINED_LENGTH = DASH_LENGTH + VOID_LENGTH;

        const pathLength = helper.getDistanceBetweenLocations(pointA, pointB);

        const dashCount = Math.floor(pathLength / (DASH_LENGTH + VOID_LENGTH));
        const endpointsLength = pathLength - (dashCount * (DASH_LENGTH + VOID_LENGTH));

        const initialX = (endpointsLength / 2.0) + (VOID_LENGTH / 2.0);
        const path = new Graphics();

        path.moveTo(0, lineWidth);
        path.lineTo(0, -lineWidth);
        path.lineTo(Math.max(initialX - VOID_LENGTH, 0), -lineWidth);
        path.lineTo(Math.max(initialX - VOID_LENGTH, 0), lineWidth);
        path.fill(pathColour);

        for (let i = 0; i < dashCount; i++) {
            path.moveTo(initialX + (i * COMBINED_LENGTH), lineWidth);
            path.lineTo(initialX + (i * COMBINED_LENGTH), -lineWidth);
            path.lineTo(initialX + (i * COMBINED_LENGTH) + DASH_LENGTH, -lineWidth);
            path.lineTo(initialX + (i * COMBINED_LENGTH) + DASH_LENGTH, lineWidth);
            path.fill(pathColour);
        }

        path.moveTo(Math.min(initialX + (dashCount * COMBINED_LENGTH), pathLength), lineWidth);
        path.lineTo(Math.min(initialX + (dashCount * COMBINED_LENGTH), pathLength), -lineWidth);
        path.lineTo(pathLength, -lineWidth);
        path.lineTo(pathLength, lineWidth);
        path.fill(pathColour);

        path.rotation = Math.atan2(pointB.y - pointA.y, pointB.x - pointA.x);
        path.position = pointA;

        this.addPathToChunk(path, pointA, pointB);
        return path;
    }

    _createSolidPathGraphics(lineWidth: number, objectA: Star | Carrier, objectB: Star | Carrier, pathColour: ColorSource) {
        const pointA = objectA.location;
        const pointB = objectB.location;
        const pathLength = helper.getDistanceBetweenLocations(pointA, pointB);

        const path = new Graphics();
        path.moveTo(0, lineWidth);
        path.lineTo(0, -lineWidth);
        path.lineTo(pathLength, -lineWidth);
        path.lineTo(pathLength, lineWidth);
        path.fill(pathColour);
        path.rotation = Math.atan2(pointB.y - pointA.y, pointB.x - pointA.x);
        path.position = pointA;

        this.addPathToChunk(path, pointA, pointB);
        return path;
    }
}

export default PathManager;