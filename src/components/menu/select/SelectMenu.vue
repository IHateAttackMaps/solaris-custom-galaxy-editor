<template>
    <div class="menu-page">
        <menu-title :title="titleText">
            <button class="btn btn-sm me-1 btn-outline-warning title-btn"
                v-if="selectState === 'paused' && action === 'selecting'" @click="switchSelectState()">
                <i class="fas fa-pause me-small"></i>
                Paused
            </button>
            <button class="btn btn-sm me-1 btn-outline-success title-btn"
                v-if="selectState === 'adding' && action === 'selecting'" @click="switchSelectState()">
                <i class="fas fa-plus"></i>
                Adding
            </button>
            <button class="btn btn-sm me-1 btn-outline-danger title-btn"
                v-if="selectState === 'removing' && action === 'selecting'" @click="switchSelectState()">
                <i class="fas fa-xmark"></i>
                Removing
            </button>
            <button class="btn btn-sm btn-outline-primary me-1 title-btn" @click="clearSelection()"
                v-if="action === 'selecting'">
                <i class="fas fa-undo"></i>
                Clear
            </button>
        </menu-title>
        <div class="text-warning" v-if="!functional">
            This menu was opened before the galaxy editor could load and is non-functional.
        </div>

        <div class="pt-2 pb-2 bg-dark-custom">
            <div class="row tall-row">
                <div class="col col-flex align-center">
                    {{ selection.length }} Stars Selected
                </div>
                <div class="col col-auto me-2" v-if="action === 'selecting' && selection.length > 0 && canMoveStars">
                    <button class="btn btn-sm btn-primary" title="Move selected" @click="beginSelectionMove()">
                        <i class="fas fa-up-down-left-right"></i>
                    </button>
                </div>
                <div class="col col-auto me-2" v-if="action === 'selecting' && selection.length > 0">
                    <button class="btn btn-sm btn-primary" title="Transform selected" @click="openTransformMenu()">
                        <i class="fas fa-arrows-spin"></i>
                    </button>
                </div>
                <div class="col col-auto me-2" v-if="action === 'selecting' && selection.length > 0">
                    <button class="btn btn-sm btn-primary" title="Randomise selected" @click="openRandomiseMenu()">
                        <i class="fas fa-dice"></i>
                    </button>
                </div>
                <div class="col col-auto" v-if="action === 'selecting' && selection.length > 0">
                    <button class="btn btn-sm btn-danger" title="Delete selected" @click="deleteSelected()">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="col col-auto me-2" v-if="action === 'moving'">
                    <button class="btn btn-sm btn-success" title="Confirm" @click="endSelectionMove()">
                        <i class="fas fa-check"></i>
                    </button>
                </div>
                <div class="col col-auto me-2" v-if="action === 'moving' && isCopy">
                    <button class="btn btn-sm btn-outline-primary" :class="{ active: copyCarriers }"
                        title="Toggle copy carriers" @click="copyCarriers = !copyCarriers">
                        <i class="fas fa-rocket"></i>
                    </button>
                </div>
                <div class="col col-auto me-2" v-if="action === 'moving'">
                    <button class="btn btn-sm btn-outline-primary" :class="{ active: isCopy }" title="Toggle copy"
                        @click="toggleCopy()">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
                <div class="col col-auto me-2" v-if="action === 'moving'">
                    <button class="btn btn-sm btn-outline-warning set-width-btn"
                        :class="{ active: selectState === 'paused' }" title="Toggle pause" @click="togglePaused()">
                        <i class="fas fa-pause"></i>
                    </button>
                </div>
                <div class="col col-auto" v-if="action === 'moving'">
                    <button class="btn btn-sm btn-danger" title="Cancel" @click="cancelSelectionMove()">
                        <i class="fas fa-xmark"></i>
                    </button>
                </div>
            </div>
        </div>
        <confirmation-modal modalName="deleteSelectedModal" titleText="Delete Selected" cancelText="No"
            confirmText="Yes" @onConfirm="confirmDeletion">
            <p>{{ modalText }}</p>
        </confirmation-modal>
    </div>
</template>

<script lang="ts">
import MenuTitle from '../MenuTitle.vue';
import { storeToRefs } from 'pinia';
import { useMenuStateStore } from '@/stores/menuState';
import { useGalaxyStore } from '@/stores/galaxy';
import editor from '@/scripts/editor';
import helper from '@/scripts/helper';
import storage from '@/scripts/storage';
import ConfirmationModal from '@/components/modal/ConfirmationModal.vue';
import { Modal } from 'bootstrap';
import type { Location } from '@/scripts/types/Location';
import type { Star } from '@/scripts/types/Star';

export default {
    components: {
        'menu-title': MenuTitle,
        'confirmation-modal': ConfirmationModal
    },
    data() {
        return {
            functional: true,
            galaxyIsReady: storeToRefs(useGalaxyStore()).galaxyIsReady,
            selection: storeToRefs(useMenuStateStore()).selection,
            selectState: 'adding' as 'adding' | 'removing' | 'paused',
            lastSelectState: 'paused' as 'paused' | 'adding' | 'removing',
            deleteSelectedModal: null as Modal | null,
            modalText: undefined as string | undefined,
            action: 'selecting' as 'selecting' | 'moving',
            isCopy: false,
            titleText: 'Select',
            selectionMoveEndedHandler: null as any,
            copyCarriers: storage.getSettings().transform.copyCarriers
        }
    },
    methods: {
        switchSelectState() {
            if (!this.galaxyIsReady || !this.functional) return;
            if (this.selectState === 'adding') {
                this.selectState = 'removing';
                editor.setModeArg(0, true);
            } else if (this.selectState === 'removing') {
                this.togglePaused();
            } else if (this.selectState === 'paused') {
                this.togglePaused();
                this.selectState = 'adding';
                editor.setModeArg(0, false);
            }
        },
        togglePaused() {
            if (!this.galaxyIsReady || !this.functional) return;
            if (this.selectState !== 'paused') {
                this.lastSelectState = this.selectState;
                this.selectState = 'paused';
                editor.unpauseViewport();

                if (this.action === 'selecting') {
                    editor.viewport!.cursor = 'default';
                    editor.map!.disableStarsInteractivity();
                }

                editor.map!.cancelCurrentSelectionAction();
                editor.map!.setSelectionContainerInteractivity(false);
            } else {
                this.selectState = this.lastSelectState;
                this.lastSelectState = 'paused';
                editor.pauseViewport();

                if (this.action === 'selecting') {
                    editor.viewport!.cursor = 'crosshair';
                    editor.map!.enableStarsInteractivity();
                }

                editor.map!.setSelectionContainerInteractivity(true);
            }
        },
        clearSelection() {
            if (!this.galaxyIsReady || !this.functional) return;
            useMenuStateStore().clearSelection();
            editor.map!.clearStarSelection();
        },
        deleteSelected(force: boolean = false) {
            if (!this.galaxyIsReady || !this.functional) return;
            if (this.action !== 'selecting') return;

            const starIds = new Set<string>(this.selection.map(s => s.id));
            const affectedCarriers = helper.getStarTranslationAffectedCarriers(starIds).filter(ac => ac.affectedPositionInFlight).map(ac => ac.carrier);
            affectedCarriers.push(...this.galaxy.carriers.filter(c => c.orbiting != null && starIds.has(c.orbiting)));

            if (!force && storage.getSettings().confirmations.confirmDeleteSelection !== 'disabled') {
                if (this.deleteSelectedModal == null) {
                    this.deleteSelectedModal = new Modal(document.getElementById('deleteSelectedModal')!);
                }

                if (affectedCarriers.length !== 0) {
                    this.modalText = `Are you sure you want to delete ${this.selection.length} ${this.selection.length > 1 ? 'stars' : 'star'}? ${affectedCarriers.length} ${affectedCarriers.length > 1 ? 'carriers' : 'carrier'} will be deleted as well.`;
                    this.deleteSelectedModal.show();
                    return;
                } else if (storage.getSettings().confirmations.confirmDeleteStar === 'always') {
                    this.modalText = `Are you sure you want to delete ${this.selection.length} ${this.selection.length > 1 ? 'stars' : 'star'}?`;
                    this.deleteSelectedModal.show();
                    return;
                }
            }

            const capitalOwners = this.galaxy.players.filter(p => p.homeStarId != null && starIds.has(p.homeStarId));
            capitalOwners.forEach(p => p.homeStarId = null);

            const destinationStars = this.galaxy.stars.filter(s => s.wormHoleToStarId != null && starIds.has(s.wormHoleToStarId));
            destinationStars.forEach(s => {
                s.wormHoleToStarId = null;
                useGalaxyStore().updateStar(s);
                editor.reloadStar(s);
            });
            if (destinationStars.length > 0) editor.updateWormholes();

            for (const carrier of affectedCarriers) {
                useGalaxyStore().removeCarrier(carrier.id);
                editor.deleteCarrier(carrier);
            }

            for (const star of this.selection) {
                useGalaxyStore().removeStar(star.id);
                editor.deleteStar(star);
            }

            editor.updateWaypointsOnMultipleStarDeletion(starIds);

            this.$toast.default(`${this.selection.length} ${this.selection.length > 1 ? 'stars' : 'star'} deleted.`);

            this.clearSelection();
        },
        confirmDeletion() {
            this.deleteSelected(true);
        },
        beginSelectionMove() {
            if (!this.galaxyIsReady || !this.functional) return;
            this.action = 'moving';
            editor.viewport!.cursor = 'default';
            editor.map!.disableStarsInteractivity();
            this.titleText = 'Move Selected';

            editor.map!.setupStarSelectionMoveGraphics();
            editor.setModeArg(1, this.action);
        },
        toggleCopy() {
            if (!this.galaxyIsReady || !this.functional) return;
            if (this.isCopy) {
                editor.map!.setSelectionIsCopy(false);
                this.isCopy = false;
            } else {
                editor.map!.setSelectionIsCopy(true);
                this.isCopy = true;
            }
        },
        cancelSelectionMove() {
            if (!this.galaxyIsReady || !this.functional) return;
            this.action = 'selecting';
            editor.viewport!.cursor = 'crosshair';
            if (this.selectState !== 'paused') editor.map!.enableStarsInteractivity();
            this.titleText = 'Select';
            editor.setModeArg(1, this.action);

            editor.map!.clearSelectionForModeChange();
            if (this.isCopy) this.toggleCopy();
        },
        endSelectionMove() {
            if (!this.galaxyIsReady || !this.functional) return;
            this.action = 'selecting';
            editor.viewport!.cursor = 'crosshair';
            if (this.selectState !== 'paused') editor.map!.enableStarsInteractivity();
            this.titleText = 'Select';
            editor.setModeArg(1, this.action);

            editor.map!.endSelectionMove();
            if (this.isCopy) this.toggleCopy();
        },
        onSelectionMoveEnded(e: { endPosition: Location, offset: Location, rotation: number, isCopy: boolean }) {
            if (!this.canMoveStars) throw new Error('Attempted selection move with carriers in flight to/from stars!');

            const starIds = new Set<string>(this.selection.map(s => s.id));
            const affectedCarriers = helper.getStarTranslationAffectedCarriers(starIds);
            const selectionOrbitingCarriers = affectedCarriers.filter(ac => ac.carrier.orbiting != null && starIds.has(ac.carrier.orbiting)).map(ac => ac.carrier);

            const newWormHoleStars: { newStar: Star, oldId: string }[] = [];
            for (const star of this.selection) {
                let pos = { x: star.location.x + e.offset.x, y: star.location.y + e.offset.y }; // Calculate position after selection offset
                pos = helper.getLocalLocation(pos, e.endPosition); // Calculate local position before rotation
                pos = helper.getRotatedLocation(pos, e.rotation); // Calculate local position after rotation
                pos = { x: pos.x + e.endPosition.x, y: pos.y + e.endPosition.y }; // Calculate new position

                if (e.isCopy) {
                    const newStar = Object.assign({}, star);
                    newStar.id = useGalaxyStore().getLowestValidStarId().toString();
                    newStar.location = pos;
                    newStar.homeStar = false;
                    if (star.wormHoleToStarId != null) {
                        const targetIndex = this.selection.findIndex(s => s.id === star.wormHoleToStarId);
                        if (targetIndex === -1) {
                            newStar.wormHoleToStarId = null;
                        } else {
                            newWormHoleStars.push({ newStar: newStar, oldId: star.id });
                        }
                    }

                    useGalaxyStore().addStar(newStar);
                    editor.createStar(newStar, this.selectState !== 'paused');

                    if (this.copyCarriers) {
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
                } else {
                    star.location = pos;
                    editor.transformStar(star);
                }
            }

            if (newWormHoleStars.length > 0) {
                for (const obj of newWormHoleStars) {
                    const target = newWormHoleStars.find(o => o.oldId === obj.newStar.wormHoleToStarId);
                    if (target == null) throw new Error('Cannot find target of a star in newWormHoleStars!');
                    obj.newStar.wormHoleToStarId = target.newStar.id;
                }
            }

            if (!e.isCopy) {
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
            }

            editor.updateWormholes();
            editor.map!.drawStarSelection();
        },
        openRandomiseMenu() {
            useMenuStateStore().toggleMenuState('randomise');
        },
        openTransformMenu() {
            useMenuStateStore().toggleMenuState('transform');
        }
    },
    mounted() {
        if (!this.galaxyIsReady) {
            this.functional = false;
            return;
        }

        editor.setMode('select', [this.selectState === 'removing', this.action, this.isCopy]);
        editor.pauseViewport();
        editor.viewport!.cursor = 'crosshair';

        this.selectionMoveEndedHandler = this.onSelectionMoveEnded.bind(this);
        editor.map!.on('onSelectionMoveEnded', this.selectionMoveEndedHandler);
    },
    beforeUnmount() {
        if (!this.galaxyIsReady || !this.functional) return;
        editor.resetMode();
        editor.unpauseViewport();
        editor.viewport!.cursor = 'default';

        editor.map!.off('onSelectionMoveEnded', this.selectionMoveEndedHandler);
    },
    computed: {
        galaxy: function () {
            return useGalaxyStore().$state.galaxy;
        },
        canMoveStars: function () {
            const starIds = new Set<string>(this.selection.map(s => s.id));
            if (helper.getStarTranslationAffectedCarriers(starIds).map(c => c.affectedPositionInFlight).includes(true)) return false;
            return true;
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

.align-center {
    align-content: center;
    justify-content: center;
}

.align-end {
    align-content: center;
    justify-content: end;
}

.me-small {
    margin-right: 1px;
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
</style>