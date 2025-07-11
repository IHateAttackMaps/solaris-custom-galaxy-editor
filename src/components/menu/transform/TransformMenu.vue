<template>
    <div class="menu-page">
        <menu-title :title="titleText">
            <button class="btn btn-sm btn-outline-primary me-1 title-btn" @click="toggleHidden()">
                <i class="fas fa-eye" v-if="!hidden"></i>
                <i class="fas fa-eye-slash" v-if="hidden"></i>
            </button>
        </menu-title>
        <div class="text-warning" v-if="!functional">
            This menu was opened before the galaxy editor could load and is non-functional.
        </div>
        <div class="text-warning" v-if="hidden">
            Click the <i class="fas fa-eye-slash"></i> button to view this menu.
        </div>

        <div v-show="!hidden">
            <div class="pt-2 pb-2 bg-dark-custom">
                <div class="row mb-2">
                    <div class="col full-width-col text-center">
                        <h5>Translate</h5>
                    </div>
                    <div class="col text-end me-1">
                        <button class="btn btn-ssm btn-outline-primary" v-if="copy.translate.enabled"
                            @click="copy.translate.carriers = !copy.translate.carriers"
                            :class="{ active: copy.translate.carriers }" title="Toggle copy carriers">
                            <i class="fas fa-rocket me-small"></i>
                        </button>
                    </div>
                    <div class="col col-auto text-end me-1">
                        <button type="button" class="btn btn-ssm btn-outline-primary"
                            @click="copy.translate.enabled = !copy.translate.enabled"
                            :class="{ active: copy.translate.enabled }" title="Toggle copy">
                            <i class="fas fa-copy me-small"></i>
                        </button>
                    </div>
                    <div class="col col-auto text-end">
                        <button type="button" class="btn btn-ssm btn-success"
                            @click="applyTranslate()">
                            <i class="fas fa-check"></i>
                            Apply
                        </button>
                    </div>
                </div>
                <div class="row align-center mb-1">
                    <div class="col col-2 me-1">
                        <select class="form-control" v-model="moveMode">
                            <option value="moveTo">Move</option>
                            <option value="offsetBy">Offset</option>
                        </select>
                    </div>
                    <div class="col col-auto">
                        <select class="form-control" v-model="moveTargetType" @change="onMoveTargetTypeChanged()">
                            <option value="centroid">Centroid</option>
                            <option value="midpoint">Midpoint</option>
                            <option value="star">Star</option>
                        </select>
                    </div>
                    <div class="col ms-1 me-1" v-if="moveTargetType === 'star'">
                        <input id="moveStarId" class="form-control semi-small-input" type="text" v-model="moveStarId"
                            :placeholder="'Enter target star ID here'" ref="moveStarIdInputElement" required="true">
                    </div>
                    <div class="col col-auto h23px col-flex" v-if="moveTargetType === 'star'">
                        <button type="button" class="btn btn-outline-primary btn-ssm"
                            @click="toggleTranslateStarSelectMode" :class="{ active: inTranslateStarSelectMode }"><i
                                class="fas fa-hand-pointer"></i></button>
                    </div>
                </div>
                <div class="row align-center">
                    <div class="col col-auto me-2">
                        <p v-if="moveMode === 'moveTo'">to</p>
                        <p v-if="moveMode === 'offsetBy'">by</p>
                    </div>
                    <div class="col col-auto me-1"
                        v-if="moveMode === 'moveTo' && moveTo !== 'location' && selection != null && selection.length > 0">
                        <select class="form-control" v-model="moveToCenterOf">
                            <option value="galaxy">Galaxy</option>
                            <option value="selection">Selection</option>
                        </select>
                    </div>
                    <div class="col col-auto me-2" v-if="moveMode === 'moveTo'">
                        <select class="form-control" v-model="moveTo">
                            <option value="location">Location</option>
                            <option value="centroid">Centroid</option>
                            <option value="midpoint">Midpoint</option>
                        </select>
                    </div>
                    <div class="col col-flex"
                        v-if="(moveMode === 'moveTo' && moveTo === 'location') || moveMode === 'offsetBy'">
                        <p class="text-16px me-1">(X:</p>
                        <input id="moveXInput" class="form-control semi-small-input hidden-number short-input"
                            type="number" step="any" v-model="move.x" ref="moveXInputElement" required="true">
                        <p class="text-16px ms-2px me-1">, Y:</p>
                        <input id="moveYInput" class="form-control semi-small-input hidden-number short-input"
                            type="number" step="any" v-model="move.y" ref="moveYInputElement" required="true">
                        <p class="text-16px ms-2px me-1">)</p>
                    </div>
                </div>
            </div>
            <div class="pt-2 pb-2 mt-1 bg-dark-custom">
                <div class="row mb-2">
                    <div class="col full-width-col text-center">
                        <h5>Rotate</h5>
                    </div>
                    <div class="col text-end me-1">
                        <button class="btn btn-ssm btn-outline-primary" v-if="copy.rotate.enabled"
                            @click="copy.rotate.carriers = !copy.rotate.carriers"
                            :class="{ active: copy.rotate.carriers }" title="Toggle copy carriers">
                            <i class="fas fa-rocket me-small"></i>
                        </button>
                    </div>
                    <div class="col col-auto text-end me-1">
                        <button type="button" class="btn btn-ssm btn-outline-primary"
                            @click="copy.rotate.enabled = !copy.rotate.enabled" :class="{ active: copy.rotate.enabled }"
                            title="Toggle copy">
                            <i class="fas fa-copy me-small"></i>
                        </button>
                    </div>
                    <div class="col text-end col-auto">
                        <button type="button" class="btn btn-ssm btn-success"
                            @click="applyRotate()">
                            <i class="fas fa-check"></i>
                            Apply
                        </button>
                    </div>
                </div>
                <div class="row align-center mb-1">
                    <div class="col col-auto text-center me-2">
                        Pivot:
                    </div>
                    <div class="col col-auto me-1"
                        v-if="pivotType !== 'location' && pivotType !== 'star' && selection != null && selection.length > 0">
                        <select class="form-control" v-model="pivotCenterOf">
                            <option value="galaxy">Galaxy</option>
                            <option value="selection">Selection</option>
                        </select>
                    </div>
                    <div class="col col-auto">
                        <select class="form-control" v-model="pivotType" @change="onPivotTypeChanged()">
                            <option value="star">Star</option>
                            <option value="location">Location</option>
                            <option value="centroid">Centroid</option>
                            <option value="midpoint">Midpoint</option>
                        </select>
                    </div>
                    <div class="col col-flex ms-2" v-if="pivotType === 'location'">
                        <p class="text-16px me-1">(X:</p>
                        <input id="pivotXInput" class="form-control semi-small-input hidden-number short-input"
                            type="number" step="any" v-model="pivot.x" ref="pivotXInputElement" required="true">
                        <p class="text-16px ms-2px me-1">, Y:</p>
                        <input id="pivotYInput" class="form-control semi-small-input hidden-number short-input"
                            type="number" step="any" v-model="pivot.y" ref="pivotYInputElement" required="true">
                        <p class="text-16px ms-2px me-1">)</p>
                    </div>
                    <div class="col ms-1 me-1" v-if="pivotType === 'star'">
                        <input id="pivotStarId" class="form-control semi-small-input" type="text" v-model="pivotStarId"
                            :placeholder="'Enter target star ID here'" ref="pivotStarIdInputElement" required="true">
                    </div>
                    <div class="col col-auto h23px col-flex" v-if="pivotType === 'star'">
                        <button type="button" class="btn btn-outline-primary btn-ssm"
                            @click="toggleRotateStarSelectMode" :class="{ active: inRotateStarSelectMode }"><i
                                class="fas fa-hand-pointer"></i></button>
                    </div>
                </div>
                <div class="row">
                    <div class="col col-2 text-center me-2">
                        Angle:
                    </div>
                    <div class="col me-1">
                        <input id="rotationAngleInput" class="form-control semi-small-input hidden-number" type="number"
                            :step="angleType === 'deg' ? 'any' : '1'" :min="angleType === 'deg' ? undefined : '1'"
                            v-model="angle" ref="rotationAngleInputElement" required="true">
                    </div>
                    <div class="col col-auto">
                        <select class="form-control" v-model="angleType" @change="onAngleTypeChanged()">
                            <option value="deg">deg</option>
                            <option value="divN">360°/N</option>
                        </select>
                    </div>
                    <div class="col col-auto text-end ms-1">
                        <button type="button" class="btn btn-ssm btn-outline-warning" title="Repeat"
                            @click="repeat = !repeat" :class="{ active: repeat }" :disabled="angleType !== 'divN'">
                            <i class="fas fa-rotate-right"></i>
                        </button>
                    </div>
                </div>
            </div>
            <div class="pt-2 pb-2 mt-1 bg-dark-custom">
                <div class="row mb-2">
                    <div class="col full-width-col text-center">
                        <h5>Scale</h5>
                    </div>
                    <div class="col text-end me-1">
                        <button class="btn btn-ssm btn-outline-primary" v-if="copy.scale.enabled"
                            @click="copy.scale.carriers = !copy.scale.carriers" :class="{ active: copy.scale.carriers }"
                            title="Toggle copy carriers">
                            <i class="fas fa-rocket me-small"></i>
                        </button>
                    </div>
                    <div class="col col-auto text-end me-1">
                        <button type="button" class="btn btn-ssm btn-outline-primary"
                            @click="copy.scale.enabled = !copy.scale.enabled" :class="{ active: copy.scale.enabled }"
                            title="Toggle copy">
                            <i class="fas fa-copy me-small"></i>
                        </button>
                    </div>
                    <div class="col col-auto text-end">
                        <button type="button" class="btn btn-ssm btn-success"
                            @click="applyScale()">
                            <i class="fas fa-check"></i>
                            Apply
                        </button>
                    </div>
                </div>
                <div class="row">
                    <div class="col col-2 text-center me-2">
                        Scale X:
                    </div>
                    <div class="col me-2">
                        <input id="scaleXInput" class="form-control semi-small-input hidden-number" type="number"
                            step="any" v-model="scale.x" ref="scaleXInputElement" required="true">
                    </div>
                    <div class="col col-2 text-center me-2">
                        Scale Y:
                    </div>
                    <div class="col me-1">
                        <input id="scaleYInput" class="form-control semi-small-input hidden-number" type="number"
                            step="any" v-model="scale.y" ref="scaleYInputElement" required="true">
                    </div>
                </div>
            </div>
            <div class="text-danger error-text pt-1 pb-2" v-if="errors != null && errors.length !== 0">
                <p>Please correct the following error(s):</p>
                <ul>
                    <li v-for="error in errors" :key="error">{{ error }}</li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { storeToRefs } from 'pinia';
import MenuTitle from '../MenuTitle.vue';
import { useGalaxyStore } from '@/stores/galaxy';
import { useMenuStateStore } from '@/stores/menuState';
import type { Star } from '@/scripts/types/Star';
import storage from '@/scripts/storage';
import helper from '@/scripts/helper';
import editor from '@/scripts/editor';
import type { Carrier } from '@/scripts/types/Carrier';

export default {
    components: {
        'menu-title': MenuTitle
    },
    data() {
        return {
            functional: true,
            galaxyIsReady: storeToRefs(useGalaxyStore()).galaxyIsReady,
            selection: storeToRefs(useMenuStateStore()).selection,
            stars: [] as Star[],
            moveMode: 'moveTo' as 'moveTo' | 'offsetBy',
            moveTargetType: 'star' as 'star' | 'centroid' | 'midpoint',
            moveStarId: null as string | null,
            inTranslateStarSelectMode: false,
            moveTo: 'location' as 'location' | 'centroid' | 'midpoint',
            moveToCenterOf: 'galaxy' as 'galaxy' | 'selection',
            move: { x: 0, y: 0 },
            pivotType: 'location' as 'star' | 'location' | 'centroid' | 'midpoint',
            pivotCenterOf: 'galaxy' as 'galaxy' | 'selection',
            pivotStarId: null as string | null,
            inRotateStarSelectMode: false,
            pivot: { x: 0, y: 0 },
            angle: 0,
            angleType: 'deg' as 'deg' | 'divN',
            scale: { x: 1, y: 1 },
            copy: {
                translate: { enabled: false, carriers: storage.getSettings().transform.copyCarriers },
                rotate: { enabled: false, carriers: storage.getSettings().transform.copyCarriers },
                scale: { enabled: false, carriers: storage.getSettings().transform.copyCarriers }
            },
            errors: [] as string[],
            repeat: false,
            hidden: false,
            starIds: new Set<string>
        }
    },
    methods: {
        toggleHidden() {
            this.hidden = !this.hidden;
            editor.onMenuToggled(true, this.hidden);
        },
        toggleTranslateStarSelectMode() {
            if (this.inTranslateStarSelectMode) {
                this.inTranslateStarSelectMode = false;
                useGalaxyStore().clearClickCallbacks();
                return;
            }
            this.inTranslateStarSelectMode = true;
            if (this.inRotateStarSelectMode) this.inRotateStarSelectMode = false;
            const ref = this.$refs.moveStarIdInputElement;
            useGalaxyStore().setClickCallback({
                ref,
                callbacks: {
                    star: (star: Star) => {
                        this.moveStarId = star.id;
                        useGalaxyStore().clearClickCallbacks();
                        this.inTranslateStarSelectMode = false;
                    }
                }
            });
        },
        toggleRotateStarSelectMode() {
            if (this.inRotateStarSelectMode) {
                this.inRotateStarSelectMode = false;
                useGalaxyStore().clearClickCallbacks();
                return;
            }
            this.inRotateStarSelectMode = true;
            if (this.inTranslateStarSelectMode) this.inTranslateStarSelectMode = false;
            const ref = this.$refs.pivotStarIdInputElement;
            useGalaxyStore().setClickCallback({
                ref,
                callbacks: {
                    star: (star: Star) => {
                        this.pivotStarId = star.id;
                        useGalaxyStore().clearClickCallbacks();
                        this.inRotateStarSelectMode = false;
                    }
                }
            });
        },
        onMoveTargetTypeChanged() {
            if (this.moveTargetType !== 'star') useGalaxyStore().clearClickCallbacks();
        },
        onPivotTypeChanged() {
            if (this.pivotType !== 'star') useGalaxyStore().clearClickCallbacks();
        },
        onAngleTypeChanged() {
            if (this.angleType !== 'divN') this.repeat = false;
        },
        applyTranslate() {
            this.errors.length = 0;
            if (!this.validateInputs('moveStarIdInputElement', 'moveXInputElement', 'moveYInputElement')) return;

            if (this.hasInFlightCarriers && !this.copy.translate.enabled) {
                this.errors.push(`Cannot move stars that have a carrier in flight to/from them.`);
                return;
            }

            let offset: { x: number, y: number };
            if (this.moveMode === 'moveTo') {
                let initialLoc = { x: 0, y: 0 };
                let targetLoc = { x: 0, y: 0 };

                if (this.moveTargetType === 'star') {
                    if (this.moveStarId == null) throw new Error(`moveStarId is null despite moveStarIdInputElement validation!`);
                    const star = helper.getStarById(this.moveStarId);
                    if (star == null) {
                        this.errors.push(`Invalid translation star ID.`);
                        return;
                    }
                    initialLoc = star.location;
                } else if (this.moveTargetType === 'centroid') {
                    initialLoc = helper.calculateSelectionCentroid(this.stars.map(s => s.location));
                } else if (this.moveTargetType === 'midpoint') {
                    initialLoc = helper.calculateSelectionMidpoint(this.stars.map(s => s.location));
                }

                if (this.moveTo === 'location') {
                    targetLoc = this.move;
                } else if (this.moveTo === 'centroid') {
                    targetLoc = this.moveToCenterOf === 'galaxy' ? helper.calculateGalaxyCentroid() : helper.calculateSelectionCentroid(this.stars.map(s => s.location));
                } else if (this.moveTo === 'midpoint') {
                    targetLoc = this.moveToCenterOf === 'galaxy' ? helper.calculateGalaxyMidpoint() : helper.calculateSelectionMidpoint(this.stars.map(s => s.location));
                }

                offset = { x: targetLoc.x - initialLoc.x, y: targetLoc.y - initialLoc.y };
            } else {
                offset = this.move;
            }

            let transformStars: Star[] = [];
            const newStarIds = new Set<string>;
            if (this.copy.translate.enabled) {
                transformStars = this.copyStars(this.stars, this.starIds, this.affectedCarriers, this.copy.translate.carriers);
                transformStars.forEach(s => newStarIds.add(s.id));
            } else {
                transformStars = this.stars;
            }

            for (const star of transformStars) {
                let pos = { x: star.location.x + offset.x, y: star.location.y + offset.y };

                star.location = pos;
                editor.transformStar(star);
            }

            if (this.copy.translate.enabled) {
                this.updateAfterTransform(newStarIds);
            } else this.updateAfterTransform(this.starIds);
        },
        applyRotate() {
            this.errors.length = 0;
            if (!this.validateInputs('pivotStarIdInputElement', 'pivotXInputElement', 'pivotYInputElement', 'rotationAngleInputElement')) return;

            if (this.hasInFlightCarriers && !this.copy.rotate.enabled) {
                this.errors.push(`Cannot move stars that have a carrier in flight to/from them.`);
                return;
            }

            let pivotPoint: { x: number, y: number };
            if (this.pivotType === 'star') {
                if (this.pivotStarId == null) throw new Error(`pivotStarId is null despite pivotStarIdInputElement validation!`);
                const star = helper.getStarById(this.pivotStarId);
                if (star == null) {
                    this.errors.push(`Invalid pivot star ID.`);
                    return;
                }
                pivotPoint = star.location;
            } else if (this.pivotType === 'centroid') {
                pivotPoint = this.pivotCenterOf === 'galaxy' ? helper.calculateGalaxyCentroid() : helper.calculateSelectionCentroid(this.stars.map(s => s.location));
            } else if (this.pivotType === 'midpoint') {
                pivotPoint = this.pivotCenterOf === 'galaxy' ? helper.calculateGalaxyMidpoint() : helper.calculateSelectionMidpoint(this.stars.map(s => s.location));
            } else {
                pivotPoint = this.pivot;
            }

            let rotation: number;
            if (this.angleType === 'divN') {
                rotation = (2.0 * Math.PI) / this.angle;
            } else {
                rotation = this.angle * (Math.PI / 180.0);
            }

            let rotations = 1;
            if (this.angleType === 'divN' && this.repeat) {
                if (this.copy.rotate.enabled) {
                    rotations = this.angle - 1;
                } else rotations = 0;
            }

            let originalStars: Star[] = [];
            const originalStarIds = new Set<string>(this.starIds);
            const newStarIds = new Set<string>;
            if (this.copy.rotate.enabled) {
                originalStars = [...this.stars];
                if (this.pivotType === 'star') {
                    originalStarIds.delete(this.pivotStarId!);
                    originalStars = originalStars.filter(s => s.id !== this.pivotStarId);
                }
            }

            for (let i = 1; i <= rotations; i++) {
                let rotateStars: Star[] = [];
                if (this.copy.rotate.enabled) {
                    rotateStars = this.copyStars(originalStars, originalStarIds, this.affectedCarriers, this.copy.rotate.carriers);
                    rotateStars.forEach(s => newStarIds.add(s.id));
                } else {
                    rotateStars = this.stars;
                }

                for (const star of rotateStars) {
                    let pos = helper.getLocalLocation(star.location, pivotPoint); // Calculate local position before rotation
                    pos = helper.getRotatedLocation(pos, i * rotation); // Calculate local position after rotation
                    pos = { x: pos.x + pivotPoint.x, y: pos.y + pivotPoint.y }; // Calculate new position

                    star.location = pos;
                    editor.transformStar(star);
                }
            }

            if (this.copy.rotate.enabled) {
                this.updateAfterTransform(newStarIds);
            } else this.updateAfterTransform(this.starIds);
        },
        applyScale() {
            this.errors.length = 0;
            if (!this.validateInputs('scaleXInputElement', 'scaleYInputElement')) return;

            if (this.hasInFlightCarriers && !this.copy.scale.enabled) {
                this.errors.push(`Cannot move stars that have a carrier in flight to/from them.`);
                return;
            }

            const scaleOrigin = helper.calculateSelectionMidpoint(this.stars.map(s => s.location)); // Always use midpoint for scaling

            let scaleStars: Star[] = [];
            const newStarIds = new Set<string>;
            if (this.copy.scale.enabled) {
                scaleStars = this.copyStars(this.stars, this.starIds, this.affectedCarriers, this.copy.scale.carriers);
                scaleStars.forEach(s => newStarIds.add(s.id));
            } else {
                scaleStars = this.stars;
            }

            for (const star of scaleStars) {
                let pos = helper.getLocalLocation(star.location, scaleOrigin);
                pos = { x: pos.x * this.scale.x + scaleOrigin.x, y: pos.y * this.scale.y + scaleOrigin.y };

                star.location = pos;
                editor.transformStar(star);
            }

            if (this.copy.scale.enabled) {
                this.updateAfterTransform(newStarIds);
            } else this.updateAfterTransform(this.starIds);
        },
        updateAfterTransform(starIds: Set<string>) {
            const affectedCarriers = helper.getStarTranslationAffectedCarriers(starIds);

            for (const affectedCarrier of affectedCarriers) {
                for (let i = 0; i < affectedCarrier.carrier.waypoints.length; i++) {
                    if (!helper.isWaypointDistanceValid(affectedCarrier.carrier, affectedCarrier.carrier.waypoints[i])) {
                        affectedCarrier.carrier.waypoints.length = i; // Removes Nth waypoint and all waypoints after.
                        break;
                    }
                }

                if (affectedCarrier.carrier.orbiting && starIds.has(affectedCarrier.carrier.orbiting)) {
                    affectedCarrier.carrier.location = helper.getStarById(affectedCarrier.carrier.orbiting)!.location;
                    editor.reloadCarrier(affectedCarrier.carrier);
                } else {
                    editor.updateCarrierWaypoints(affectedCarrier.carrier);
                }
            }

            editor.updateWormholes();
            if (this.selection != null && this.selection.length > 0) {
                editor.map!.drawStarSelection();
            }
        },
        copyStars(stars: Star[], starIds: Set<string>, affectedCarriers: { carrier: Carrier, affectedPositionInFlight: boolean }[], copyCarriers: boolean) {
            const selectionOrbitingCarriers = affectedCarriers.filter(ac => ac.carrier.orbiting != null && starIds.has(ac.carrier.orbiting)).map(ac => ac.carrier);
            const newWormHoleStars: { newStar: Star, oldId: string }[] = [];

            const originalStars = [...stars]; // Shallow copy is fine, since we just need to avoid adding elements to this array while looping
            const newStars: Star[] = [];

            for (const star of originalStars) {
                const newStar = Object.assign({}, star);
                newStar.id = useGalaxyStore().getLowestValidStarId().toString();
                newStar.location = star.location;
                newStar.homeStar = false;
                if (star.wormHoleToStarId != null) {
                    const targetIndex = originalStars.findIndex(s => s.id === star.wormHoleToStarId);
                    if (targetIndex === -1) {
                        newStar.wormHoleToStarId = null;
                    } else {
                        newWormHoleStars.push({ newStar: newStar, oldId: star.id });
                    }
                }

                useGalaxyStore().addStar(newStar);
                editor.createStar(newStar);

                if (copyCarriers) {
                    const starOrbitingCarriers = selectionOrbitingCarriers.filter(c => c.orbiting === star.id);
                    for (const carrier of starOrbitingCarriers) {
                        const newCarrier = Object.assign({}, carrier);
                        newCarrier.id = useGalaxyStore().getLowestValidCarrierId().toString();
                        newCarrier.orbiting = newStar.id;
                        newCarrier.location = newStar.location;
                        newCarrier.waypoints = [];

                        editor.createCarrierAtStar(newStar, newCarrier);
                    }
                }

                newStars.push(newStar);
            }

            if (newWormHoleStars.length > 0) {
                for (const obj of newWormHoleStars) {
                    const target = newWormHoleStars.find(o => o.oldId === obj.newStar.wormHoleToStarId);
                    if (target == null) { // Can be null if a pair of wormholes is copied when one of the stars is a pivot in rotate mode
                        obj.newStar.wormHoleToStarId = null;
                        editor.reloadStar(obj.newStar);
                    } else obj.newStar.wormHoleToStarId = target.newStar.id;
                }
            }

            return newStars;
        },
        validateInputs(...inputRefs: string[]): boolean {
            for (const inputRef of inputRefs) {
                if (this.$refs[inputRef] == null) continue;
                const valid = (this.$refs[inputRef] as HTMLInputElement).checkValidity();
                if (!valid) {
                    (this.$refs[inputRef] as HTMLInputElement).reportValidity();
                    return false;
                }
            }
            return true;
        }
    },
    mounted() {
        if (this.selection == null || this.selection.length === 0) {
            this.stars = this.galaxy.stars;
        } else this.stars = this.selection;
        this.stars.forEach(s => this.starIds.add(s.id));

        let defaultGalaxyCenterType: 'centroid' | 'midpoint' = 'midpoint';
        if (storage.getSettings().visual.displayGalaxyCenter === 'centroid') defaultGalaxyCenterType = 'centroid';
        this.moveTargetType = defaultGalaxyCenterType;
        this.pivotType = defaultGalaxyCenterType;
    },
    beforeUnmount() {
        useGalaxyStore().clearClickCallbacks();
    },
    computed: {
        galaxy: function () {
            return useGalaxyStore().$state.galaxy;
        },
        titleText: function () {
            return (this.selection == null || this.selection.length === 0) ? 'Transform' : 'Transform Selected';
        },
        affectedCarriers: function () {
            return helper.getStarTranslationAffectedCarriers(this.starIds);
        },
        hasInFlightCarriers: function () {
            return this.affectedCarriers.map(c => c.affectedPositionInFlight).includes(true);
        }
    }
}
</script>

<style scoped>
.bg-dark-custom {
    --bs-bg-opacity: 1;
    background-color: rgb(53, 67, 74) !important;
    --bs-gutter-x: 0px;
    --bs-gutter-y: 0px;
    margin-left: -6px !important;
    padding-left: 6px;
    padding-right: 6px;
    min-width: calc(100% + 12px);
}

.form-control {
    display: block !important;
    width: 100% !important;
    padding: 0px 8px !important;
    font-size: 14px !important;
    font-weight: 300 !important;
    line-height: 1.5 !important;
    color: rgba(255, 255, 255, 0.75) !important;
    background-color: transparent !important;
    background-clip: padding-box !important;
    border: 1px solid rgba(255, 255, 255, .3);
    -webkit-appearance: none !important;
    -moz-appearance: none !important;
    appearance: none !important;
    border-radius: 4px !important;
    margin: 0 !important;
    opacity: 1 !important;
}

.form-control:disabled {
    opacity: 0.5 !important;
}

.form-control.small-input {
    height: 20px;
}

.form-control.semi-small-input {
    height: 23px;
}

.form-control.large-input {
    height: 31px;
}

.small-select {
    font-size: 14px !important;
    padding-top: 0 !important;
    padding-bottom: 0 !important;
    padding-left: 0.25rem !important;
}

.selected-null {
    color: rgba(255, 255, 255, 0.4) !important;
}

.selected-null:focus {
    color: rgba(255, 255, 255, 0.4) !important;
}

.form-control::placeholder {
    color: rgba(255, 255, 255, 0.5);
}

p {
    margin: 0;
}

ul {
    margin: 0;
}

.error-text {
    font-size: 14px;
    font-weight: 400;
}

.row {
    margin: 0;
    width: 100%;
}

.col {
    padding: 0;
}

.col-flex {
    display: flex;
    align-items: center;
    padding: 0 !important;
}

.align-center {
    align-content: center;
    justify-content: center;
    align-items: center;
    justify-items: center;
}

.align-end {
    align-content: center;
    justify-content: end;
}

.text-warning {
    color: rgba(255, 159, 12, 1) !important;
}

.tall-row {
    height: 31px;
}

.set-width-btn {
    width: 30.25px;
}

h5 {
    font-weight: 400;
    font-size: 18px;
    margin: 0;
}

p {
    margin: 0;
    white-space: nowrap;
}

.btn {
    display: inline-block;
    font-weight: 400;
    line-height: 1.5;
    user-select: none;
    text-align: center;
    vertical-align: middle;
    right: 0;
}

.btn-sm {
    --bs-btn-padding-y: 0.25rem;
    --bs-btn-padding-x: 0.5rem;
    --bs-btn-font-size: 0.875rem;
}

.btn-ssm {
    --bs-btn-padding-y: 0px;
    --bs-btn-padding-x: 7.1px;
    --bs-btn-font-size: 14px;
}

.align-center {
    align-content: center;
    justify-content: center;
}

.align-end {
    align-content: center;
    justify-content: end;
}

.text-16px {
    font-size: 16px;
    height: 23px;
}

.h23px {
    height: 23px !important;
}

.short-input {
    width: inherit !important;
}

.ms-2px {
    margin-left: 2px;
}

.full-width {
    width: 100%;
}

.full-width-col {
    position: absolute;
    left: 50%;
    translate: -50% 0;
    width: fit-content;
}

h4 {
    color: white;
    font-family: Chakra Petch, sans-serif;
    font-weight: 600;
    font-size: 22px;
    margin: 0;
    width: 100%;
    text-wrap: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>