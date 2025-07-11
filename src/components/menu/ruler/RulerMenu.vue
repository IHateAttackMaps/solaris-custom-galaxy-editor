<template>
    <div class="menu-page">
        <menu-title :title="'Ruler'">
            <button class="btn btn-sm btn-outline-warning title-btn" @click="popRulerPoint"
                :disabled="points.length === 0 || !functional">
                <i class="fas fa-caret-left"></i>
                Last
            </button>
            <button class="btn btn-sm btn-outline-danger me-1 title-btn" @click="resetRulerPoints"
                :disabled="!functional">
                <i class="fas fa-undo"></i>
                Reset
            </button>
            <button class="btn btn-sm btn-outline-primary me-1 title-btn"
                @click="toggleHidden()">
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
                <div class="col-3 text-left">
                    <span title="Total number of waypoints plotted">
                        <i class="fas fa-map-marker-alt"></i> {{ points.length }}
                    </span>
                </div>
                <div class="col-3 text-center">
                    <span title="Total distance (ly)">
                        <i class="fas fa-ruler"></i> {{ distanceLightYears }}
                    </span>
                </div>
                <div class="col-3 text-center">
                    <span title="Required scanning level">
                        <i class="fas fa-binoculars"></i> {{ scanningLevel }}
                    </span>
                </div>
                <div class="col-3 text-end">
                    <span title="Required hyperspace level">
                        <i class="fas fa-gas-pump"></i> {{ hyperspaceLevel }}
                    </span>
                </div>
            </div>

            <div class="row bg-dark-custom pt-2 pb-2 mt-1">
                <div class="col-2">
                    ETA
                </div>
                <div class="col-5 text-end">
                    <span title="ETA base speed">
                        Base {{ totalEta || '0' }} Ticks
                    </span>
                </div>
                <div class="col-5 text-end">
                    <span title="ETA warp speed">
                        Warp {{ totalEtaWarp || '0' }} Ticks
                    </span>
                </div>
            </div>
            <div class="row pt-2 pb-2 bg-dark-custom mt-1">
                <div class="col-6">
                    Base Speed
                </div>
                <div class="col-6 text-end">
                    <select class="form-control form-control-sm" v-model="baseSpeed" @change="onBaseSpeedChanged"
                        :disabled="!functional">
                        <option value="1">Crazy Slow (0.02 ly/tick)</option>
                        <option value="2.5">Very Slow (0.05 ly/tick)</option>
                        <option value="5">Slow (0.1 ly/tick)</option>
                        <option value="10">Standard (0.2 ly/tick)</option>
                        <option value="15">Fast (0.3 ly/tick)</option>
                        <option value="20">Very Fast (0.4 ly/tick)</option>
                        <option value="25">Crazy Fast (0.5 ly/tick)</option>
                    </select>
                </div>
            </div>
            <div class="row pt-2 pb-2 bg-dark-custom mt-1">
                <div class="col-6">
                    Speed Modifier
                </div>
                <div class="col-6 text-end">
                    <select class="form-control form-control-sm" v-model="speedModifier"
                        @change="onSpeedModifierChanged" :disabled="!functional">
                        <option value="0.5">0.5x</option>
                        <option value="0.75">0.75x</option>
                        <option value="1">1.0x (Normal)</option>
                        <option value="1.5">1.5x</option>
                        <option value="2">2.0x</option>
                    </select>
                </div>
            </div>

            <table class="table table-sm table-striped mb-2 mt-2" v-if="points.length > 1">
                <thead>
                    <tr>
                        <th>Start</th>
                        <th style="width: 5%;"></th>
                        <th>End</th>
                        <th class="nextPoint">Distance (ly)</th>
                        <th style="width: 17%;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="point in points" :key="point.object.id">
                        <template v-if="getNextPoint(point)">
                            <td>
                                <span>
                                    <i class="fas"
                                        :class="{ 'fa-star': point.type == 'star', 'fa-rocket': point.type == 'carrier' }"></i>
                                    {{ point.object.id }}
                                </span>
                            </td>
                            <td>
                                <i v-if="getNextPoint(point)" class="fas fa-arrow-right ms-2 me-2"></i>
                            </td>
                            <td>
                                <span v-if="getNextPoint(point)">
                                    <i class="fas"
                                        :class="{ 'fa-star': getNextPoint(point).type == 'star', 'fa-rocket': getNextPoint(point).type == 'carrier' }"></i>
                                    {{ getNextPoint(point).object.id }}
                                </span>
                            </td>
                            <td class="nextPoint">
                                <span v-if="getNextPoint(point)">{{ getNextPointDistance(point) }}</span>
                            </td>
                            <td>
                                <span>{{ getDistanceRunningTotal(point) }}</span>
                            </td>
                        </template>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script lang="ts">
import editor from '@/scripts/editor';
import helper from '@/scripts/helper';
import MenuTitle from '../MenuTitle.vue';
import type { RulerPoint } from '@/scripts/types/RulerPoint';
import Map from '@/scripts/map';
import { storeToRefs } from 'pinia';
import storage from '@/scripts/storage';
import { useGalaxyStore } from '@/stores/galaxy';

export default {
    components: {
        'menu-title': MenuTitle,
    },
    data() {
        return {
            points: [] as RulerPoint[],
            etaTicks: 0,
            distanceLightYears: 0,
            hyperspaceLevel: 0,
            scanningLevel: 0,
            totalEta: '',
            totalEtaWarp: '',
            isStandardUIStyle: false,
            isCompactUIStyle: false,
            speedModifier: 1,
            baseSpeed: storage.getSettings().ruler.rulerBaseCarrierSpeed, // default to using separate value
            galaxyIsReady: storeToRefs(useGalaxyStore()).galaxyIsReady,
            functional: true,
            rulerPointCreatedHandler: null as any,
            rulerPointRemovedHandler: null as any,
            rulerPointsClearedHandler: null as any,
            hidden: false
        }
    },
    mounted() {
        if (!this.galaxyIsReady) {
            this.functional = false;
            return;
        }
        editor.setMode('ruler', []);
        this.rulerPointCreatedHandler = this.onRulerPointCreated.bind(this);
        this.rulerPointRemovedHandler = this.onRulerPointRemoved.bind(this);
        this.rulerPointsClearedHandler = this.onRulerPointsCleared.bind(this);
        editor.map!.on('onRulerPointCreated', this.rulerPointCreatedHandler);
        editor.map!.on('onRulerPointRemoved', this.rulerPointRemovedHandler);
        editor.map!.on('onRulerPointsCleared', this.rulerPointsClearedHandler);

        if (storage.getSettings().ruler.separateBaseCarrierSpeed === 'enabled') {
            this.baseSpeed = storage.getSettings().ruler.rulerBaseCarrierSpeed;
        } else this.baseSpeed = storage.getSettings().carriers.baseCarrierSpeed;


    },
    beforeUnmount() {
        if (!this.galaxyIsReady || !this.functional) return;
        editor.map!.off('onRulerPointCreated', this.rulerPointCreatedHandler);
        editor.map!.off('onRulerPointRemoved', this.rulerPointRemovedHandler);
        editor.map!.off('onRulerPointsCleared', this.rulerPointsClearedHandler);
        editor.resetMode();
    },
    methods: {
        popRulerPoint() {
            editor.map!.removeLastRulerPoint();
        },
        resetRulerPoints() {
            editor.resetMode();
            editor.setMode('ruler', []);
        },
        onRulerPointCreated(e: RulerPoint) {
            this.points.push(e);
            if (e.type == 'carrier' && this.points.length == 1) {
                this.speedModifier = 1;
                if (e.object.specialistId && e.object.specialist?.modifiers && e.object.specialist?.modifiers.local && e.object.specialist?.modifiers.local.speed) {
                    this.speedModifier = e.object.specialist?.modifiers.local.speed;
                }
            }
            this.recalculateAll();
        },
        onRulerPointRemoved(e: RulerPoint) {
            this.points.splice(this.points.indexOf(e), 1)

            this.recalculateAll();
        },
        onRulerPointsCleared() {
            this.points = [];

            this.recalculateAll();
        },
        onSpeedModifierChanged() {
            if (this.points.length > 1) {
                this.recalculateETAs();
            }
        },
        onBaseSpeedChanged() {
            if (this.points.length > 1) {
                this.recalculateETAs();
            }
        },
        recalculateAll() {
            this.recalculateETAs();
            this.recalculateHyperspaceScanningLevel();
            this.recalculateDistanceLightYears();
        },
        recalculateETAs() {
            const totalTicks = helper.getTicksBetweenObjects(this.baseSpeed, this.points, this.speedModifier);
            const totalTicksWarp = helper.getTicksBetweenObjects(this.baseSpeed, this.points, Map.warpSpeedMultiplier * this.speedModifier);

            this.totalEta = totalTicks.toString();
            this.totalEtaWarp = totalTicksWarp.toString();
        },
        recalculateHyperspaceScanningLevel() {
            if (this.points.length < 2) {
                this.hyperspaceLevel = 0;
                this.scanningLevel = 0;
                return;
            }

            // Get the waypoint that has the largest distance between the source and destination.
            const distances = [];

            for (let i = 0; i < this.points.length - 1; i++) {
                const point = this.points[i];
                const nextPoint = this.points[i + 1];

                if (!nextPoint) {
                    continue;
                }

                distances.push(helper.getDistanceBetweenLocations(point.location, nextPoint.location));
            }

            const longestWaypoint = Math.max(...distances);

            // Calculate the hyperspace range required for it.
            this.hyperspaceLevel = Math.max(helper.getHyperspaceLevelByDistance(longestWaypoint), 1);
            this.scanningLevel = helper.getScanningLevelByDistance(longestWaypoint);
        },
        recalculateDistanceLightYears() {
            this.distanceLightYears = 0;

            if (this.points.length < 2) {
                return;
            }

            for (let i = 0; i < this.points.length - 1; i++) {
                this.distanceLightYears += helper.getDistanceBetweenLocations(this.points[i].location, this.points[i + 1].location);
            }

            this.distanceLightYears = Number.parseFloat((Math.round(this.distanceLightYears / Map.lightYearDistance * 100.0) / 100.0).toFixed(2));
        },
        getNextPoint(point: RulerPoint) {
            const i = this.points.indexOf(point);

            return this.points[i + 1] || null;
        },
        getNextPointDistance(point: RulerPoint) {
            const i = this.points.indexOf(point);

            let distance = helper.getDistanceBetweenLocations(this.points[i].location, this.points[i + 1].location);

            distance = Math.round(distance / Map.lightYearDistance * 100.0) / 100.0;

            return distance.toFixed(2);
        },
        getDistanceRunningTotal(point: RulerPoint) {
            const index = this.points.indexOf(point);

            let distance = 0;

            for (let i = 0; i < index + 1; i++) {
                if (this.points[i + 1]) {
                    distance += helper.getDistanceBetweenLocations(this.points[i].location, this.points[i + 1].location);
                }
            }

            distance = Math.round(distance / Map.lightYearDistance * 100.0) / 100.0;

            return distance.toFixed(2);
        },
        toggleHidden() {
            this.hidden = !this.hidden;
            editor.onMenuToggled(true, this.hidden);
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
    margin-left: -6px;
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
    border: 1px solid rgba(255, 255, 255, .3) !important;
    -webkit-appearance: none !important;
    -moz-appearance: none !important;
    appearance: none !important;
    border-radius: 4px !important;
    margin: 0 !important;
    opacity: 1 !important;
}

.table {
    --bs-table-bg: transparent;
    --bs-table-accent-bg: transparent;
    --bs-table-striped-color: rgba(255, 255, 255, 0.75);
    --bs-table-striped-bg: rgba(255, 255, 255, 0.1);
    --bs-table-active-color: rgba(255, 255, 255, 0.75);
    --bs-table-active-bg: rgba(255, 255, 255, 0.15);
    --bs-table-hover-color: rgba(255, 255, 255, 0.75);
    --bs-table-hover-bg: rgba(255, 255, 255, 0.075);
    color: rgba(255, 255, 255, .75) !important;
    border-color: rgba(255, 255, 255, .3);
    width: 100%;
    max-width: 100%;
    table-layout: fixed;
}

.table:not(caption) {
    background-color: var(--bs-table-bg);
    border-bottom-width: 1px;
    box-shadow: inset 0 0 0 9999px var(--bs-table-accent-bg);
}

.table-striped>tbody>tr:nth-of-type(odd)>* {
    --bs-table-accent-bg: var(--bs-table-striped-bg);
    color: var(--bs-table-striped-color)
}

th,
td {
    color: rgba(255, 255, 255, .75) !important;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow-x: hidden;
    font-weight: 300;
}

tr {
    border-color: inherit;
    border-style: solid;
    border-width: 0;
}

tr+td {
    width: auto;
}

thead {
    border-bottom: 2px solid rgba(255, 255, 255, .75);
}

i {
    margin: 0 !important;
}

.btn-outline-warning {
    margin-right: 4px;
}

.btn-outline-primary {
    margin-right: 0px;
}

.form-control:disabled {
    opacity: 0.5 !important;
}

.text-warning {
    color: rgba(255, 159, 12, 1) !important;
}
</style>