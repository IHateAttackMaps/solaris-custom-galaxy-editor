<template>
    <div class="menu-page">
        <menu-title :title="'Brush'">
            <button class="btn btn-sm me-1 btn-outline-warning title-btn" :class="{ active: snapMode !== 'off' }"
                @click="switchSnapMode">
                <i class="fas fa-arrows-to-circle"></i>
                {{ snapMode === 'off' ? 'Off' : (snapMode === 'radius_only' ? 'Radius' : 'Radius & Angle') }}
            </button>
            <button class="btn btn-sm me-1 btn-outline-success title-btn" v-if="!inverted" @click="inverted = true">
                <i class="fas fa-paintbrush"></i>
                Creating
            </button>
            <button class="btn btn-sm me-1 btn-outline-danger title-btn" v-if="inverted" @click="inverted = false">
                <i class="fas fa-trash"></i>
                Deleting
            </button>
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
            <div class="row pt-2 pb-2 bg-dark-custom">
                <div class="col col-flex align-center">
                    Brush Shape
                </div>
                <div class="col">
                    <select class="form-control form-control-sm" v-model="brushShape" @change="onBrushChanged"
                        :disabled="!functional">
                        <option value="circle">Circle</option>
                        <option value="square">Square</option>
                    </select>
                </div>
            </div>
            <div class="row pt-2 pb-2 mt-1 bg-dark-custom">
                <div class="col col-flex align-center">
                    Brush Radius (ly)
                </div>
                <div class="col">
                    <input id="brushRadius" class="form-control hidden-number large-input" type="number" min="0"
                        step="any" required="true" v-model="brushRadius" @input="onBrushChanged">
                </div>
            </div>
            <div class="row pt-2 pb-2 mt-1 bg-dark-custom">
                <div class="col col-flex align-center">
                    Star Amount
                </div>
                <div class="col">
                    <input id="starAmount" class="form-control hidden-number large-input" type="number" min="0" step="1"
                        required="true" v-model="starAmount">
                </div>
            </div>
            <div class="row pt-2 pb-2">
                <div class="col col-flex">
                    <h4>Snap</h4>
                </div>
                <div class="col col-auto">
                    <button class="btn btn-sm me-1 btn-outline-primary title-btn" @click="switchSnapTargetMode">
                        <i class="fas fa-crosshairs"></i>
                        {{ snapTargetMode.charAt(0).toUpperCase().concat(snapTargetMode.slice(1)) }}
                    </button>
                </div>
            </div>
            <div class="row pt-2 pb-2 bg-dark-custom" v-if="snapTargetMode !== 'none'">
                <div class="col col-1 me-1" v-if="snapTargetMode === 'manual'"></div>
                <div class="col col-flex align-center">
                    Snap Target
                </div>
                <div class="col col-1 me-1" v-if="snapTargetMode === 'manual'">
                    <button class="btn btn-sm btn-outline-primary" :class="{ active: inSnapSelectMode }"
                        @click="toggleSnapSelectMode">
                        <i class="fas fa-hand-pointer"></i>
                    </button>
                </div>
                <div class="col col-6">
                    <input id="snapTarget" class="form-control large-input" :disabled="snapTargetMode === 'auto'"
                        type="string" v-model="snapTarget" ref="snapTargetInputElement" @input="onSnapChanged">
                </div>
            </div>
            <div class="row pt-2 pb-2 mt-1 bg-dark-custom" v-if="snapTargetMode !== 'none'">
                <div class="col col-flex align-center">
                    Snap Radius (ly)
                </div>
                <div class="col">
                    <input id="snapRadius" class="form-control hidden-number large-input" type="number" min="0"
                        step="any" required="true" v-model="snapRadius" @input="onSnapChanged">
                </div>
            </div>
            <div class="row pt-2 pb-2 mt-1 bg-dark-custom" v-if="snapTargetMode !== 'none'">
                <div class="col col-flex align-center">
                    Snap Steps
                </div>
                <div class="col">
                    <input id="snapSteps" class="form-control hidden-number large-input" type="number" min="1" step="1"
                        required="true" v-model="snapSteps" @input="onSnapChanged">
                </div>
            </div>
            <div class="row pt-2 pb-2 mt-1 bg-dark-custom" v-if="snapTargetMode !== 'none'">
                <div class="col col-flex align-center">
                    Snap Step Offset (deg)
                </div>
                <div class="col">
                    <input id="stepOffset" class="form-control hidden-number large-input" type="number" min="0"
                        step="any" required="true" v-model="stepOffset" @input="onSnapChanged">
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import editor from '@/scripts/editor';
import MenuTitle from '../MenuTitle.vue';
import { storeToRefs } from 'pinia';
import { useGalaxyStore } from '@/stores/galaxy';
import GalaxyMap from '@/scripts/map';
import type { Point } from 'pixi.js';
import helper from '@/scripts/helper';
import type { Star } from '@/scripts/types/Star';
import storage from '@/scripts/storage';
import { useMenuStateStore } from '@/stores/menuState';

export default {
    components: {
        'menu-title': MenuTitle,
    },
    data() {
        return {
            functional: true,
            hidden: false,
            galaxyIsReady: storeToRefs(useGalaxyStore()).galaxyIsReady,
            brushShape: 'circle',
            brushRadius: storage.getSettings().brush.defaultBrushRadius,
            starAmount: storage.getSettings().brush.defaultStarAmount,
            brushClickHandler: null as any,
            brushRightClickHandler: null as any,
            inverted: false,
            inSnapSelectMode: false,
            snapTarget: undefined as string | undefined,
            snapTargetMode: storage.getSettings().brush.defaultSnapTargetMode,
            snapMode: 'off' as 'off' | 'radius_only' | 'radius_and_angle',
            snapRadius: storage.getSettings().brush.defaultSnapRadius,
            snapSteps: storage.getSettings().brush.defaultSnapSteps,
            stepOffset: storage.getSettings().brush.defaultStepOffset
        }
    },
    methods: {
        toggleHidden() {
            this.hidden = !this.hidden;
            editor.onMenuToggled(true, this.hidden);
        },
        onBrushChanged() {
            if (Number.isNaN(Number.parseFloat(this.brushRadius.toString())) || this.brushRadius < 0) return;
            editor.map!.updateBrush(this.brushRadius * GalaxyMap.lightYearDistance, this.brushShape);
        },
        onBrushClick(pos: Point, star: Star | null, fromInversion: boolean = false) {
            if (this.inverted && !fromInversion) {
                this.onBrushRightClick(pos, star, true);
                return;
            }

            if (star != null) return;
            if (Number.isNaN(Number.parseInt(this.starAmount.toString())) || !Number.isInteger(this.starAmount)) return;

            const interactive = this.snapTargetMode === 'auto';
            switch (this.brushShape) {
                case 'circle':
                    for (let i = 0; i < this.starAmount; i++) {
                        const r = (this.brushRadius * GalaxyMap.lightYearDistance) * Math.sqrt(Math.random());
                        const theta = Math.random() * 2.0 * Math.PI;
                        const x = pos.x + r * Math.cos(theta);
                        const y = pos.y + r * Math.sin(theta);

                        const newStar = helper.generateNewStar();
                        newStar.id = useGalaxyStore().getLowestValidStarId().toString();
                        newStar.location = {
                            x: x,
                            y: y
                        };

                        useGalaxyStore().addStar(newStar);
                        editor.createStar(newStar, interactive);
                    }
                    break;
                case 'square':
                    const r = (this.brushRadius * GalaxyMap.lightYearDistance);
                    for (let i = 0; i < this.starAmount; i++) {
                        const x = (pos.x - r) + Math.random() * 2.0 * r;
                        const y = (pos.y - r) + Math.random() * 2.0 * r;

                        const newStar = helper.generateNewStar();
                        newStar.id = useGalaxyStore().getLowestValidStarId().toString();
                        newStar.location = {
                            x: x,
                            y: y
                        };

                        useGalaxyStore().addStar(newStar);
                        editor.createStar(newStar, interactive);
                    }
                    break;
            }
        },
        onBrushRightClick(pos: Point, star: Star | null, fromInversion: boolean = false) {
            if (this.inverted && !fromInversion) {
                this.onBrushClick(pos, star, true);
                return;
            }

            let starsForDeletion: Star[] = [];

            if (star != null) {
                starsForDeletion.push(star);
            } else {
                const r = (this.brushRadius * GalaxyMap.lightYearDistance);
                switch (this.brushShape) {
                    case 'circle':
                        starsForDeletion = this.galaxy.stars.filter(s => ((pos.x - s.location.x) ** 2 + (pos.y - s.location.y) ** 2) <= r ** 2);
                        break;
                    case 'square':
                        starsForDeletion = this.galaxy.stars.filter(s =>
                            (s.location.x >= (pos.x - r)) && (s.location.x <= (pos.x + r)) &&
                            (s.location.y >= (pos.y - r)) && (s.location.y <= (pos.y + r))
                        );
                        break;
                }
            }

            for (const star of starsForDeletion) {
                if (star.id === this.snapTarget) {
                    this.snapTarget = undefined;
                    this.onSnapChanged();
                }

                const starCarriers = helper.getStarCarriers(star.id);

                // If this star is a capital star, set the homeStarId of the player that used to own it to null.
                const capitalOwner = this.galaxy.players.find(p => p.homeStarId === star.id);
                if (capitalOwner != null) {
                    capitalOwner.homeStarId = null;
                }

                for (const carrier of starCarriers) {
                    useGalaxyStore().removeCarrier(carrier.id);
                    editor.deleteCarrier(carrier);
                }

                useGalaxyStore().removeStar(star.id);
                editor.deleteStar(star);
                useMenuStateStore().removeStarFromSelection(star.id);
                editor.map!.updateStarSelection([star], true);

                editor.updateWaypointsOnStarDeletion(star);
                if (this.galaxy.stars.find(s => s.wormHoleToStarId === star.id) != null) { // WH existed and was removed
                    const destinationStar = this.galaxy.stars.find(s => s.wormHoleToStarId === star.id);
                    if (destinationStar != null) {
                        destinationStar.wormHoleToStarId = null;
                        useGalaxyStore().updateStar(destinationStar);
                        editor.reloadStar(destinationStar);
                    }
                    editor.updateWormholes();
                }
            }
        },
        toggleSnapSelectMode() {
            if (this.inSnapSelectMode) {
                this.inSnapSelectMode = false;
                useGalaxyStore().clearClickCallbacks();
                editor.map!.disableStarsInteractivity();
                return;
            }
            this.inSnapSelectMode = true;
            const ref = this.$refs.snapTargetInputElement;
            useGalaxyStore().setClickCallback({
                ref,
                callbacks: {
                    star: (star: Star) => {
                        if (this.snapTarget != null) editor.map!.drawStarSelectedCircle(this.snapTarget);
                        this.snapTarget = star.id;
                        editor.map!.drawStarSelectedCircle(star.id, true);
                        useGalaxyStore().clearClickCallbacks();
                        this.inSnapSelectMode = false;
                        editor.map!.disableStarsInteractivity();
                        this.onSnapChanged();
                    }
                }
            });
            editor.map!.enableStarsInteractivity();
        },
        switchSnapTargetMode() {
            const snapTargetModes = ['auto', 'manual', 'none'] as const;
            const currentIndex = snapTargetModes.indexOf(this.snapTargetMode);
            this.snapTargetMode = snapTargetModes[(currentIndex + 1) % snapTargetModes.length];

            useGalaxyStore().clearClickCallbacks();
            editor.map!.unselectAllStars();
            this.inSnapSelectMode = false;

            switch (this.snapTargetMode) {
                case 'none':
                    editor.map!.disableStarsInteractivity();
                    this.snapTarget = undefined;
                    this.onSnapChanged();
                    break;
                case 'manual':
                    editor.map!.disableStarsInteractivity();
                    break;
                case 'auto':
                    editor.map!.enableStarsInteractivity();
                    if (this.snapTargetMode === 'auto') {
                        const ref = this.$refs.snapTargetInputElement;
                        useGalaxyStore().setClickCallback({
                            ref,
                            callbacks: {
                                star: (star: Star) => {
                                    if (this.snapTarget != null) editor.map!.drawStarSelectedCircle(this.snapTarget);
                                    this.snapTarget = star.id;
                                    editor.map!.drawStarSelectedCircle(star.id, true);
                                    this.onSnapChanged();
                                }
                            }
                        });
                    }
                    break;
            }
        },
        switchSnapMode() {
            const snapModes = ['off', 'radius_only', 'radius_and_angle'] as const;
            const currentIndex = snapModes.indexOf(this.snapMode);
            this.snapMode = snapModes[(currentIndex + 1) % snapModes.length];

            this.onSnapChanged();
        },
        onSnapChanged() {
            let targetStarLoc = undefined;
            if (this.snapTarget) targetStarLoc = helper.getStarById(this.snapTarget)?.location;

            editor.setModeArgs([
                this.brushRadius * GalaxyMap.lightYearDistance, this.starAmount, this.snapMode, targetStarLoc,
                this.snapRadius * GalaxyMap.lightYearDistance, this.snapSteps, this.stepOffset * (Math.PI / 180)
            ]);
        }
    },
    mounted() {
        if (!this.galaxyIsReady) {
            this.functional = false;
            return;
        }
        this.brushClickHandler = this.onBrushClick.bind(this);
        this.brushRightClickHandler = this.onBrushRightClick.bind(this);
        editor.map!.on('onBrushClick', this.brushClickHandler);
        editor.map!.on('onBrushRightClick', this.brushRightClickHandler);
        editor.setMode('brush', [
            this.brushRadius * GalaxyMap.lightYearDistance, this.starAmount, this.snapMode, undefined,
            this.snapRadius * GalaxyMap.lightYearDistance, this.snapSteps, this.stepOffset * (Math.PI / 180)
        ]);

        if (this.snapTargetMode === 'auto') {
            const ref = this.$refs.snapTargetInputElement;
            useGalaxyStore().setClickCallback({
                ref,
                callbacks: {
                    star: (star: Star) => {
                        if (this.snapTarget != null) editor.map!.drawStarSelectedCircle(this.snapTarget);
                        this.snapTarget = star.id;
                        editor.map!.drawStarSelectedCircle(star.id, true);
                        this.onSnapChanged();
                    }
                }
            });
        } else {
            editor.map!.disableStarsInteractivity();
        }
    },
    beforeUnmount() {
        if (!this.galaxyIsReady || !this.functional) return;
        editor.map!.off('onBrushClick', this.brushClickHandler);
        editor.map!.off('onBrushRightClick', this.brushRightClickHandler);
        editor.resetMode();

        useGalaxyStore().clearClickCallbacks();
    },
    computed: {
        galaxy: function () {
            return useGalaxyStore().$state.galaxy;
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

p {
    margin: 0;
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

.pre-textbox-span {
    margin-right: 6px;
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

.form-control:disabled {
    opacity: 0.5;
}

.form-control::placeholder {
    color: rgba(255, 255, 255, 0.5);
}

.text-warning {
    color: rgba(255, 159, 12, 1) !important;
}

.align-center {
    align-content: center;
    justify-content: center;
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

.btn-sm {
    --bs-btn-padding-y: 0.25rem;
    --bs-btn-padding-x: 0.5rem;
    --bs-btn-font-size: 0.875rem;
    --bs-btn-border-radius: 2px;
}
</style>