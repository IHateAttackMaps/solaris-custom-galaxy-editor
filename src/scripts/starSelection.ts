import { Container, Graphics, Rectangle, Sprite, type ContainerChild } from "pixi.js";
import type { Settings } from "./types/Settings";
import type { Star } from "./types/Star";
import { useMenuStateStore } from "@/stores/menuState";
import { storeToRefs } from "pinia";
import { useGalaxyStore } from "@/stores/galaxy";
import helper from "./helper";
import TextureService from "./texture";
import editor from "./editor";
import { EventEmitter } from "events";


class StarSelection extends EventEmitter {
    container: Container;
    topContainer: Container;

    container_selected_stars: Container | null;
    graphics_selection_box: Graphics | null;
    graphics_selection_bounds: Graphics | null;

    container_move_selection: Container | null;
    graphics_move_bounds: Graphics | null;
    graphics_move_interactive: Graphics | null;
    container_move_rotate: Container | null;

    userSettings: Settings | null;
    selection: Star[];

    selectedStarsMap: Map<string, Graphics>;

    selectionBoxOrigin: { x: number, y: number } | null;
    selectionBoxIsRemoving: boolean;

    lastPointerPositionGlobal: { x: number, y: number } | null;
    cursorMoveFor: string

    isCopy: boolean;

    onSelectionMoveEndedHandler: any;

    constructor() {
        super();

        this.container = new Container();
        this.topContainer = new Container();

        this.container_selected_stars = null;
        this.graphics_selection_box = null;
        this.graphics_selection_bounds = null;

        this.container_move_selection = null;
        this.graphics_move_bounds = null;
        this.graphics_move_interactive = null;
        this.container_move_rotate = null;

        this.userSettings = null;
        this.selection = [];

        this.selectedStarsMap = new Map();

        this.selectionBoxOrigin = null;
        this.selectionBoxIsRemoving = false;

        this.lastPointerPositionGlobal = null;
        this.cursorMoveFor = 'none';

        this.isCopy = false;
    }

    setup(userSettings: Settings) {
        this.userSettings = userSettings;
        this.selection = storeToRefs(useMenuStateStore()).selection.value;
    }

    clear() {
        this.container.removeChildren();
        this.container_selected_stars = null;
        this.selectedStarsMap.clear();
    }

    clearForModeChange() {
        this._clearSelectionBox();
        this._clearMoveGraphics();
    }

    draw() {
        this.clear();

        this._drawSelectionBounds();
        this._drawSelectedStarMarkers(this.selection);
    }

    drawSelectedStarDelta(stars: Star[], removing: boolean) {
        this._drawSelectionBounds();

        if (removing) {
            this._undrawSelectedStarMarkers(stars);
        } else {
            this._drawSelectedStarMarkers(stars);
        }
    }

    updateSelectedStarId(oldId: string, newId: string) {
        const graphics = this.selectedStarsMap.get(oldId);

        if (graphics) {
            this.selectedStarsMap.set(newId, graphics);
            this.selectedStarsMap.delete(oldId);
        }
    }

    _undrawSelectedStarMarkers(stars: Star[]) {
        if (this.container_selected_stars == null) return;

        const removeArray: ContainerChild[] = [];

        for (const star of stars) {
            const graphics = this.selectedStarsMap.get(star.id);
            if (!graphics) continue;

            removeArray.push(graphics);
            this.selectedStarsMap.delete(star.id);
        }

        this.container_selected_stars.removeChild(...removeArray);
    }

    _drawSelectionBounds() {
        if (this.graphics_selection_bounds != null) {
            this.container.removeChild(this.graphics_selection_bounds);
            this.graphics_selection_bounds = null;
        }

        if (this.selection.length <= 1 || this.userSettings!.visual.displaySelectionBounds === 'disabled') return;

        this.graphics_selection_bounds = new Graphics();

        const { minX, minY, maxX, maxY } = this._getSelectionBounds();

        this.graphics_selection_bounds.rect(0, 0, maxX - minX, maxY - minY);
        this.graphics_selection_bounds.position = { x: minX, y: minY };
        this.graphics_selection_bounds.stroke({ width: this.userSettings!.visual.selectionBoundWidth, color: 0x8088FF, alpha: this.userSettings!.visual.selectionBoundOpacity });

        this.container.addChild(this.graphics_selection_bounds);
    }

    _drawSelectedStarMarkers(stars: Star[]) {
        if (this.container_selected_stars == null) {
            this.container_selected_stars = new Container({ isRenderGroup: true });
        }

        if (!stars.length) return;

        for (const star of stars) {
            this._drawSelectedStarMarker(star);
        }

        this.container.addChild(this.container_selected_stars);
    }

    _drawSelectedStarMarker(star: Star) {
        if (this.container_selected_stars == null) return;

        const oldGraphics = this.selectedStarsMap.get(star.id);
        if (oldGraphics) {
            this.container_selected_stars.removeChild(oldGraphics);
        }

        const graphics = new Graphics();
        graphics.circle(star.location.x, star.location.y, 25);
        graphics.stroke({ width: this.userSettings!.visual.selectionMarkerBoundWidth, color: 0x8088FF, alpha: this.userSettings!.visual.selectionMarkerBoundOpacity });
        this.selectedStarsMap.set(star.id, graphics);

        this.container_selected_stars.addChild(graphics);
    }

    _beginSelectionBox(pos: { x: number, y: number }, isRemoving: boolean) {
        this.selectionBoxOrigin = pos;
        this.selectionBoxIsRemoving = isRemoving;
    }

    _drawSelectionBox(newPos: { x: number, y: number }) {
        if (this.graphics_selection_box != null) {
            this.container.removeChild(this.graphics_selection_box);
            this.graphics_selection_box = null;
        }

        if (this.selectionBoxOrigin == null) return;

        let x1, x2, y1, y2;
        if (newPos.x > this.selectionBoxOrigin.x) {
            x1 = this.selectionBoxOrigin.x;
            x2 = newPos.x;
        } else {
            x1 = newPos.x;
            x2 = this.selectionBoxOrigin.x;
        }

        if (newPos.y > this.selectionBoxOrigin.y) {
            y1 = this.selectionBoxOrigin.y;
            y2 = newPos.y;
        } else {
            y1 = newPos.y;
            y2 = this.selectionBoxOrigin.y;
        }

        this.graphics_selection_box = new Graphics();

        const color = this.selectionBoxIsRemoving ? 0xFF4040 : 0x8088FF;

        this.graphics_selection_box.rect(x1, y1, x2 - x1, y2 - y1);
        this.graphics_selection_box.stroke({ width: 0.5, color: color, alpha: 1 });
        this.graphics_selection_box.fill({ color: color, alpha: 0.3 });

        this.container.addChild(this.graphics_selection_box);
    }

    _endSelectionBox(endPos: { x: number, y: number }) {
        if (this.graphics_selection_box != null) {
            this.container.removeChild(this.graphics_selection_box);
            this.graphics_selection_box = null;
        }

        if (this.selectionBoxOrigin == null) return;

        let x1, x2, y1, y2;
        if (endPos.x > this.selectionBoxOrigin.x) {
            x1 = this.selectionBoxOrigin.x;
            x2 = endPos.x;
        } else {
            x1 = endPos.x;
            x2 = this.selectionBoxOrigin.x;
        }

        if (endPos.y > this.selectionBoxOrigin.y) {
            y1 = this.selectionBoxOrigin.y;
            y2 = endPos.y;
        } else {
            y1 = endPos.y;
            y2 = this.selectionBoxOrigin.y;
        }

        let selectedStars = useGalaxyStore().$state.galaxy.stars.filter(s =>
            s.location.x >= x1 && s.location.x <= x2 &&
            s.location.y >= y1 && s.location.y <= y2
        );

        if (this.selectionBoxIsRemoving) {
            useMenuStateStore().removeStarsFromSelection(selectedStars.map(s => s.id));
        } else {
            // Ignore stars already in selection
            selectedStars = selectedStars.filter(s => !this.selection.includes(s));
            useMenuStateStore().addStarsToSelection(selectedStars);
        }

        this.selectionBoxOrigin = null;

        this.drawSelectedStarDelta(selectedStars, this.selectionBoxIsRemoving);
    }

    _clearSelectionBox() {
        if (this.graphics_selection_box != null) {
            this.container.removeChild(this.graphics_selection_box);
            this.graphics_selection_box = null;
        }

        this.selectionBoxOrigin = null;
    }

    _drawMoveBounds() {
        if (this.graphics_move_bounds != null) {
            this.container_move_selection?.removeChild(this.graphics_move_bounds);
            this.graphics_move_bounds = null;
        }

        if (this.selection.length <= 1 || this.graphics_selection_bounds == null || this.container_move_selection == null) return;

        this.graphics_move_bounds = new Graphics();

        // width, height - strokeWidth
        this.graphics_move_bounds.rect(0, 0, this.graphics_selection_bounds.width - 1, this.graphics_selection_bounds.height - 1);
        this.graphics_move_bounds.stroke({ width: this.userSettings!.visual.selectionMoveBoundWidth, color: this.isCopy ? 0x44CC44 : 0xFF88FF, alpha: this.userSettings!.visual.selectionMoveBoundOpacity });
        this.graphics_move_bounds.fill({ color: this.isCopy ? 0x44CC44 : 0xFF88FF, alpha: this.userSettings!.visual.selectionMoveFillOpacity });

        this.container_move_selection.addChild(this.graphics_move_bounds);
    }

    _drawMovePoints() {
        if (!this.selection.length || this.container_move_selection == null) return;

        if (this.container_move_selection.children.length > 1) {
            console.warn('Warning: _drawMovePoints() called before removing previous points.');
        }

        for (const loc of this.selection.map(s => s.location)) {
            const { minX, minY } = this._getSelectionBounds();

            const local = helper.getLocalLocation(loc, { x: minX, y: minY });

            const graphics_point_container = new Container();
            graphics_point_container.position = local;

            const graphics_point = new Sprite(TextureService.STAR_SYMBOLS['scannable']);
            graphics_point.alpha = this.userSettings!.visual.selectionMovePointOpacity;
            graphics_point.anchor.set(0.5);
            graphics_point.width = 24.0 / 2.0;
            graphics_point.height = 24.0 / 2.0;
            graphics_point.tint = this.isCopy ? 0x44CC44 : 0xFF88FF;

            graphics_point_container.addChild(graphics_point);
            this.container_move_selection.addChild(graphics_point_container);
        }

        if (this.selection.length === 1) {
            const graphics_ring = new Graphics();
            graphics_ring.circle(0, 0, 25);
            graphics_ring.stroke({ width: this.userSettings!.visual.selectionMoveBoundWidth, color: this.isCopy ? 0x44CC44 : 0xFF88FF, alpha: this.userSettings!.visual.selectionMoveBoundOpacity });
            graphics_ring.fill({ color: this.isCopy ? 0x44CC44 : 0xFF88FF, alpha: this.userSettings!.visual.selectionMoveFillOpacity });

            this.container_move_selection.addChild(graphics_ring);
        }
    }

    _drawMoveRotationGraphics() {
        if (this.container_move_rotate != null) {
            this.topContainer.removeChild(this.container_move_rotate);
            this.container_move_rotate = null;
        }

        if (!this.selection.length || this.container_move_selection == null) return;

        this.container_move_rotate = new Container({
            eventMode: 'static'
        });

        this.container_move_rotate.position = {
            x: this.container_move_selection.position.x,
            y: this.container_move_selection.position.y
        };

        this.container_move_rotate.pivot = {
            x: 0,
            y: 15 + this.container_move_selection.height / 2
        };

        const graphics_move_rotate = new Sprite(TextureService.SELECTION_ROTATE_TEXTURE);
        graphics_move_rotate.alpha = 1;
        graphics_move_rotate.anchor.set(0.5);
        graphics_move_rotate.width = 60.0 / 2.0;
        graphics_move_rotate.height = 60.0 / 2.0;
        graphics_move_rotate.zIndex = 1;

        const graphics_move_rotate_bg = new Graphics();
        graphics_move_rotate_bg.circle(0, 0, 12);
        graphics_move_rotate_bg.stroke({ width: 2, color: 0xFFFFFF })
        graphics_move_rotate_bg.fill({ color: 0x000000 });
        graphics_move_rotate_bg.zIndex = 0;

        this.container_move_rotate.addChild(graphics_move_rotate);
        this.container_move_rotate.addChild(graphics_move_rotate_bg);

        this.topContainer.addChild(this.container_move_rotate);
    }

    _setupMoveSelectionContainer() {
        if (this.container_move_selection != null) {
            this.container.removeChild(this.container_move_selection);
            this.container_move_selection = null;
        }

        if (!this.selection.length) return;

        if (this.selection.length === 1) {
            this.container_move_selection = new Container({
                position: { x: this.selection[0].location.x, y: this.selection[0].location.y },
                eventMode: 'static',
                cursor: 'move'
            });
        } else {
            if (this.graphics_selection_bounds == null) return;

            const { minX, minY, maxX, maxY } = this._getSelectionBounds();

            this.container_move_selection = new Container({
                position: { x: (minX + maxX) / 2, y: (minY + maxY) / 2 },
                pivot: { x: (maxX - minX) / 2, y: (maxY - minY) / 2 },
                eventMode: 'static',
                cursor: 'move'

            });

            const extraHitArea = 10;
            this.container_move_selection.hitArea = new Rectangle(0 - extraHitArea, 0 - extraHitArea, maxX - minX + 2 * extraHitArea, maxY - minY + 2 * extraHitArea);
        }

        this.container.addChild(this.container_move_selection);
    }

    _setupMoveListeners() {
        this.clearMoveListeners();

        if (this.container_move_selection != null) {
            this.container_move_selection.on('pointerdown', this.onMoveSelectionPointerDown.bind(this));
            this.container_move_selection.on('pointerup', this.onMoveSelectionPointerUp.bind(this));
            this.container_move_selection.on('pointerupoutside', this.onMoveSelectionPointerUp.bind(this));
        }

        if (this.container_move_rotate != null) {
            this.container_move_rotate.on('pointerdown', this.onMoveRotatePointerDown.bind(this));
            this.container_move_rotate.on('pointerup', this.onMoveRotatePointerUp.bind(this));
            this.container_move_rotate.on('pointerupoutside', this.onMoveRotatePointerUp.bind(this));
        }
    }

    onMoveSelectionPointerDown(e: any) {
        if (!editor.viewport!.pause) return;
        const loc = editor.map!.starContainer!.toLocal(e.global);
        this.lastPointerPositionGlobal = loc;
        this.cursorMoveFor = 'moveSelection';
    }

    onMoveRotatePointerDown(e: any) {
        if (!editor.viewport!.pause) return;
        const loc = editor.map!.starContainer!.toLocal(e.global);
        this.lastPointerPositionGlobal = loc;
        this.cursorMoveFor = 'rotateSelection';
    }

    onMoveSelectionCursorMove(newPos: { x: number, y: number }) {
        if (this.lastPointerPositionGlobal == null) return;

        const offset = helper.getLocalLocation(newPos, this.lastPointerPositionGlobal);

        this.container_move_selection!.position.x += offset.x;
        this.container_move_selection!.position.y += offset.y;

        if (this.container_move_rotate != null) {
            this.container_move_rotate.position.x += offset.x;
            this.container_move_rotate.position.y += offset.y;
        }

        this.lastPointerPositionGlobal = { x: newPos.x, y: newPos.y };
    }

    onRotateSelectionCursorMove(newPos: { x: number, y: number }) {
        if (this.lastPointerPositionGlobal == null) return;

        const anglePrevious = helper.getAngleTowardsLocation(this.container_move_selection!.position, this.lastPointerPositionGlobal);
        const angleNew = helper.getAngleTowardsLocation(this.container_move_selection!.position, newPos);

        this.container_move_selection!.rotation += (angleNew - anglePrevious);

        if (this.container_move_rotate != null) {
            this.container_move_rotate.rotation += (angleNew - anglePrevious);
        }

        this.lastPointerPositionGlobal = { x: newPos.x, y: newPos.y };
    }

    onMoveSelectionPointerUp() {
        this.cursorMoveFor = 'none';
        this.lastPointerPositionGlobal = null;
    }

    onMoveRotatePointerUp() {
        this.cursorMoveFor = 'none';
        this.lastPointerPositionGlobal = null;
    }

    clearMoveListeners() {
        if (this.container_move_selection) {
            this.container_move_selection.removeAllListeners();
        }

        if (this.container_move_rotate) {
            this.container_move_rotate.removeAllListeners();
        }
    }

    setRotateGraphicsScale(zoomPercent: number) {
        if (this.container_move_rotate == null || this.container_move_selection == null) return;

        const currentScale = zoomPercent / 100;
        if (currentScale < 1) {
            this.container_move_rotate.scale = { x: (1 / currentScale), y: (1 / currentScale) };
            this.container_move_rotate.pivot.y = 15 + (this.container_move_selection.height / 2) * currentScale;
        } else {
            this.container_move_rotate.scale = { x: 1, y: 1 };
            this.container_move_rotate.pivot.y = 15 + (this.container_move_selection.height / 2);
        }
    }

    setupMoveGraphics() {
        this._setupMoveSelectionContainer();
        this._drawMoveBounds();
        this._drawMovePoints();
        this._drawMoveRotationGraphics();
        this._setupMoveListeners();
        this.setRotateGraphicsScale(editor.map!.zoomPercent);
    }

    _clearMoveGraphics() {
        this.clearMoveListeners();

        if (this.container_move_selection != null) {
            this.container.removeChild(this.container_move_selection);
            this.container_move_selection = null;
        }

        if (this.container_move_rotate != null) {
            this.topContainer.removeChild(this.container_move_rotate);
            this.container_move_rotate = null;
        }

        this.lastPointerPositionGlobal = null;
        this.cursorMoveFor = 'none';
        this.isCopy = false;
    }

    endSelectionMove() {
        if (this.container_move_selection == null) return;

        const { minX, minY, maxX, maxY } = this._getSelectionBounds();
        const initialPosition = { x: (minX + maxX) / 2, y: (minY + maxY) / 2 };
        const endPosition = this.container_move_selection.position;
        const offset = helper.getLocalLocation(endPosition, initialPosition);
        const rotation = this.container_move_selection.rotation;
        const isCopy = this.isCopy;

        this._clearMoveGraphics();

        this.emit('onSelectionMoveEnded', {
            endPosition: endPosition,
            offset: offset,
            rotation: rotation,
            isCopy: isCopy
        });
    }

    onStarClicked(e: any) {
        useMenuStateStore().addStarToSelection(e);
        this.drawSelectedStarDelta([e], false);
    }

    onStarRightClicked(e: any) {
        useMenuStateStore().removeStarFromSelection(e.id);
        this.drawSelectedStarDelta([e], true);
    }

    onViewportPointerDown(pos: { x: number, y: number }, mode: string, isRemoving: boolean = false) {
        if (!editor.viewport!.pause) return;
        switch (mode) {
            case 'selecting':
                this._beginSelectionBox(pos, isRemoving);
                break;
        }
    }

    onCursorMove(newPos: { x: number, y: number }, mode: string) {
        if (!editor.viewport!.pause) return;
        switch (mode) {
            case 'selecting':
                this._drawSelectionBox(newPos);
                break;
            case 'moving':
                if (this.cursorMoveFor === 'moveSelection') {
                    this.onMoveSelectionCursorMove(newPos);
                } else if (this.cursorMoveFor === 'rotateSelection') {
                    this.onRotateSelectionCursorMove(newPos);
                }
                break;

        }
    }

    onViewportPointerUp(pos: { x: number, y: number }, mode: string) {
        if (!editor.viewport!.pause) return;
        switch (mode) {
            case 'selecting':
                this._endSelectionBox(pos);
                break;
        }
    }

    cancelCurrentAction(mode: string) {
        switch (mode) {
            case 'selecting':
                this._clearSelectionBox();
                break;
            case 'moving':
                if (this.cursorMoveFor === 'moveSelection') {
                    this.onMoveSelectionPointerUp();
                } else if (this.cursorMoveFor === 'rotateSelection') {
                    this.onMoveRotatePointerUp();
                }
                break;
        }
    }

    setIsCopy(isCopy: boolean) {
        this.isCopy = isCopy;

        if (this.container_move_selection != null) this.container_move_selection.removeChildren();
        this._drawMoveBounds();
        this._drawMovePoints();
    }

    setContainerInteractivity(interactive: boolean) {
        if (interactive) {
            if (this.container_move_selection != null) {
                this.container_move_selection.eventMode = 'static';
                this.container_move_selection.cursor = 'move';
            }

            if (this.container_move_rotate != null) {
                this.container_move_rotate.eventMode = 'static';
            }
        } else {
            if (this.container_move_selection != null) {
                this.container_move_selection.eventMode = 'none';
                this.container_move_selection.cursor = undefined;
            }

            if (this.container_move_rotate != null) {
                this.container_move_rotate.eventMode = 'none';
            }
        }
    }

    _getSelectionBounds() {
        return this.selection.reduce((accumulator, current) => {
            accumulator.minX = Math.min(current.location.x, accumulator.minX);
            accumulator.minY = Math.min(current.location.y, accumulator.minY);
            accumulator.maxX = Math.max(current.location.x, accumulator.maxX);
            accumulator.maxY = Math.max(current.location.y, accumulator.maxY);
            return accumulator;
        }, { minX: Number.MAX_SAFE_INTEGER, minY: Number.MAX_SAFE_INTEGER, maxX: Number.MIN_SAFE_INTEGER, maxY: Number.MIN_SAFE_INTEGER });
    }
}

export default StarSelection;