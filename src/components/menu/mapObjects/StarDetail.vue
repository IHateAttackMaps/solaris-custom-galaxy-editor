<template>
    <div class="menu-page" v-if="starData != null">
        <div class="fade-in" v-show="!editingId && !editingName">
            <menu-title :title="title" :coloured-text="star?.name">
                <button class="btn btn-sm btn-outline-success me-1" @click="editingName = true">
                    <i class="fas fa-pencil-alt"></i>
                </button>
                <button class="btn btn-sm btn-outline-warning me-1" @click="editingId = true" v-if="allowEditingId">
                    <i class="fas fa-hashtag"></i>
                </button>
            </menu-title>
            <form id="starDetailForm" @submit.prevent="updateStar()">
                <div class="bg-dark-custom pb-2">
                    <div class="row pt-1">
                        <div class="col text-center" id="locationText">
                            <p>Location: ({{ starData?.location?.x.toFixed(3) }}, {{ starData?.location?.y.toFixed(3)
                                }})</p>
                        </div>
                    </div>
                    <div class="row pt-1">
                        <div class="col col-auto col-star star-text-col">
                            <p>This star is controlled by</p>
                        </div>
                        <div class="col">
                            <select class="form-control small-select" id="owner" v-model="selectedPlayer"
                                @change="onOwnerChanged" :class="{ 'selected-null': !selectedPlayer }">
                                <option v-for="player in selectionPlayers" :value="player.id">
                                    {{ player.alias }}
                                </option>
                            </select>
                        </div>
                    </div>
                    <div class="row pt-1">
                        <div class="col col-auto">
                            <button type="button" class="btn btn-outline-success" id="homeStarButton"
                                @click="toggleHomeStar()" :class="{ active: starData.homeStar }"><i
                                    class="fa fa-house"></i></button>
                        </div>
                        <div class="col col-auto col-star star-text-col text-after-button"
                            :class="{ 'does-not-have-property': !starData.homeStar }">
                            <p>This star is the capital of</p>
                        </div>
                        <div class="col col-star">
                            <select class="form-control small-select" id="owner" v-model="selectedCapitalOwner"
                                :disabled="!starData.homeStar" :class="{ 'selected-null': !selectedCapitalOwner }">
                                <option v-for="player in selectionPlayers" :value="player.id">
                                    {{ player.alias }}
                                </option>
                            </select>
                        </div>
                    </div>
                    <div class="row pt-2" v-if="isDeadStar">
                        <div class="col text-center">
                            <p class="text-danger">This is a dead star.</p>
                        </div>
                    </div>
                    <div class="row pt-2" v-if="starData.isKingOfTheHillStar">
                        <div class="col text-center">
                            <p>This is the King Of The Hill star.</p>
                        </div>
                    </div>
                </div>
                <div class="row row-center mt-2" v-if="!isSplitResources">
                    <div class="col-flex col-2 col-20p text-center">
                        <span title="Natural Resources / Terraformed Resources" class="pre-textbox-icon-span">
                            <i class="fas fa-globe"></i>
                        </span>
                        <input id="naturalResources" class="form-control hidden-number small-input" type="number"
                            min="0" required="true" step="1" v-model="starData.naturalResources.economy"
                            @input="event => updateResources(event)">
                    </div>
                    <div class="col-flex col-auto text-center">
                        <span class="textbox-text-slash">/</span>
                        <span class="terraformed-number">{{ terraformedResources.economy }}</span>
                    </div>
                </div>
                <div class="row row-center mt-2" v-if="isSplitResources">
                    <div class="col-flex col-8 text-center">
                        <span
                            title="Natural Resources (Economy, Industry, Science) / Terraformed Resources (Economy, Industry, Science)"
                            class="pre-textbox-icon-span">
                            <i class="fas fa-globe"></i>
                        </span>
                        <input id="naturalEconomy" class="form-control hidden-number small-input" type="number" min="0"
                            step="1" required="true" v-model="starData.naturalResources.economy">
                        <input id="naturalIndustry" class="form-control hidden-number small-input" type="number" min="0"
                            step="1" required="true" v-model="starData.naturalResources.industry">
                        <input id="naturalScience" class="form-control hidden-number small-input" type="number" min="0"
                            step="1" required="true" v-model="starData.naturalResources.science">
                    </div>
                    <div class="col-flex col-auto text-center">
                        <span class="textbox-text-slash">/</span>
                        <span id="terraformedEconomy" class="terraformed-number">{{ terraformedResources.economy
                        }}</span>
                        <span id="terraformedIndustry" class="terraformed-number">{{ terraformedResources.industry
                        }}</span>
                        <span id="terraformedScience">{{ terraformedResources.science }}</span>
                    </div>
                </div>
                <div class="row icon-row mt-2 mb-1">
                    <div class="col col-ico">
                        <span title="Nebula - All ship counts are hidden from other players" class="property-button"
                            :class="{ 'does-not-have-property': !starData.isNebula }"
                            @click="togglePropertyValue('isNebula')">
                            <i class="fas fa-eye-slash fa-lg"></i>
                        </span>
                    </div>
                    <div class="col col-ico">
                        <span title="Asteroid Field - +1 defender bonus (net +2 weapons) in combat"
                            class="property-button" :class="{ 'does-not-have-property': !starData.isAsteroidField }"
                            @click="togglePropertyValue('isAsteroidField')">
                            <i class="fas fa-meteor fa-lg"></i>
                        </span>
                    </div>
                    <div class="col col-ico">
                        <span title="Binary Star - The system has additional natural resources" class="property-button"
                            :class="{ 'does-not-have-property': !starData.isBinaryStar }"
                            @click="togglePropertyValue('isBinaryStar')">

                            <svg class="star-svg binaryStarIcon" id="binary" version="1.1"
                                viewBox="7.755126953125 7.2888641357421875 18.847461700439453 20.039825439453125"
                                height="18" width="18" xmlns="http://www.w3.org/2000/svg">
                                <defs id="defs3876"></defs>
                                <g transform="translate(0,-263.13332)" id="layer1">
                                    <g id="layer1-3" transform="matrix(0.72927803,0,0,0.72927803,4.5842259,75.820177)">
                                        <path class="star" id="path2870"
                                            d="M 18.218 290.344 L 13.285 289.811 L 11.283 294.321 L 9.281 289.811 L 4.348 290.344 L 7.279 286.366 L 4.348 282.389 L 9.281 282.922 L 11.283 278.412 L 13.285 282.922 L 18.218 282.389 L 15.287 286.366 Z">
                                        </path>
                                        <path class="star" id="path-1"
                                            d="M 30.192 279.567 L 24.902 278.999 L 22.756 283.808 L 20.609 278.999 L 15.32 279.567 L 18.463 275.325 L 15.32 271.084 L 20.609 271.652 L 22.756 266.842 L 24.902 271.652 L 30.192 271.084 L 27.049 275.325 Z">
                                        </path>
                                    </g>
                                </g>
                            </svg>
                        </span>
                    </div>
                    <div class="col col-ico">
                        <span title="Black Hole - The star has +3 scanning range but reduced natural resources"
                            class="property-button" :class="{ 'does-not-have-property': !starData.isBlackHole }"
                            @click="togglePropertyValue('isBlackHole')">
                            <i class="far fa-circle fa-lg"></i>
                        </span>
                    </div>
                    <div class="col col-ico">
                        <span title="Pulsar - The star is always visible to all players in the game"
                            class="property-button" :class="{ 'does-not-have-property': !starData.isPulsar }"
                            @click="togglePropertyValue('isPulsar')">
                            <img src="../../../assets/stars/128x128_star_pulsar.svg" id="pulsar">
                        </span>
                    </div>
                    <div class="col col-ico">
                        <span title="Warp Gate - Carriers travel faster between active warp gates"
                            class="property-button" :class="{ 'does-not-have-property': !starData.warpGate }"
                            @click="togglePropertyValue('warpGate')">
                            <i class="fas fa-dungeon fa-lg"></i>
                        </span>
                    </div>
                </div>
                <div class="row icon-row mt-1 mb-1">
                    <div class="col col-2 col-ico">
                        <span title="Wormhole - The star is connected to another wormhole somewhere in the galaxy"
                            class="property-button"
                            :class="{ 'does-not-have-property': !creatingWormhole && starData.wormHoleToStarId == null }"
                            @click="toggleCreatingWormhole">
                            <img src="../../../assets/stars/vortex.png" id="wormhole">
                        </span>
                    </div>
                    <div class="col col-flex" id="wormholeToStarIdInput">
                        <input id="wormholeToStarId" class="form-control semi-small-input" type="text"
                            v-model="starData.wormHoleToStarId" :placeholder="'Enter wormhole target star ID here'"
                            :disabled="!creatingWormhole && starData.wormHoleToStarId == null"
                            ref="wormholeToStarIdInputElement">
                    </div>
                    <div class="col col-flex col-auto">
                        <button type="button" class="btn btn-outline-primary btn-ssm" @click="toggleWormholeSelectMode"
                            :disabled="!creatingWormhole && starData.wormHoleToStarId == null"
                            :class="{ active: inWormholeSelectMode }"><i class="fas fa-hand-pointer"></i></button>
                    </div>
                </div>
                <div class="row row-infra mt-3 mb-2">
                    <div class="col-flex col-4 text-center" id="colEconomy">
                        <span title="Economic infrastructure" class="pre-textbox-icon-span">
                            <i class="fas fa-money-bill-wave" id="economyIcon"></i>
                        </span>
                        <input id="economy" class="form-control hidden-number small-input" type="number" min="0"
                            required="true" v-model="starData.infrastructure.economy" :disabled="isDeadStar">
                    </div>
                    <div class="col-flex col-4 text-center" id="colIndustry">
                        <span title="Industrial infrastructure" class="pre-textbox-icon-span">
                            <i class="fas fa-tools" id="industryIcon"></i>
                        </span>
                        <input id="industry" class="form-control hidden-number small-input" type="number" min="0"
                            required="true" v-model="starData.infrastructure.industry" :disabled="isDeadStar">
                    </div>
                    <div class="col-flex col-4 text-center" id="colScience">
                        <span title="Scientific infrastructure" class="pre-textbox-icon-span">
                            <i class="fas fa-flask" id="scienceIcon"></i>
                        </span>
                        <input id="science" class="form-control hidden-number small-input" type="number" min="0"
                            required="true" v-model="starData.infrastructure.science" :disabled="isDeadStar">
                    </div>
                </div>
                <div class="row icon-row mt-2 mb-2">
                    <div class="col col-flex col-4" id="shipsInput">
                        <span title="True ships" class="pre-textbox-icon-span">
                            <i class="fas fa-rocket fa-lg"></i>
                        </span>
                        <input id="shipsActual" class="form-control semi-small-input hidden-number" type="number"
                            min="0" step="any" v-model="starData.shipsActual" @input="event => updateShips(event)">
                    </div>
                    <div class="col col-flex" id="specialistSelection">
                        <span title="Specialist" class="pre-textbox-icon-span"
                            :class="{ 'does-not-have-property': isDeadStar }">
                            <i class="fas fa-user-astronaut fa-lg"></i>
                        </span>
                        <select class="form-control small-select" id="specialist" v-model="selectedSpecialist"
                            :class="{ 'selected-null': !selectedSpecialist }" :disabled="isDeadStar"
                            @change="onSpecialistChanged">
                            <option v-for="specialist in selectionSpecialists" :value="specialist.id">
                                {{ specialist.name }}
                            </option>
                        </select>
                    </div>
                    <div class="col col-flex col-2">
                        <span title="Specialist expiry tick" class="pre-textbox-icon-span"
                            :class="{ 'selected-null': !selectedSpecialist }">
                            <i class="fas fa-stopwatch fa-lg"></i>
                        </span>
                        <input id="specialistExpireTick" class="form-control semi-small-input hidden-number"
                            type="number" min="0" v-model="starData.specialistExpireTick"
                            :disabled="!selectedSpecialist">
                    </div>
                </div>
                <div class="row pb-1" v-if="effectiveTechs != null">
                    <div class="col text-center">
                        <span title="Scanning"><i class="fas fa-binoculars"></i>
                            {{ effectiveTechs.scanning }} ({{ scanningDistance }} ly)</span>
                    </div>
                    <div class="col text-center">
                        <span title="Terraforming"><i class="fas fa-globe-europe"></i>
                            {{ effectiveTechs.terraforming }}</span>
                    </div>
                    <div class="col text-center">
                        <span title="Weapons (+x from defender bonus)"><i class="fas fa-gun"></i>
                            {{ weapons }}</span>
                    </div>
                    <div class="col text-center">
                        <span title="Manufacturing"><i class="fas fa-industry"></i>
                            {{ effectiveTechs.manufacturing }}</span>
                    </div>
                </div>
                <div class="bg-dark-custom row pt-2 pb-2" id="bottomRow">
                    <div class="col col-flex col-auto">
                        <button type="button" class="btn btn-sm btn-danger" @click="deleteStar()"><i
                                class="fas fa-trash"></i>
                            Delete Star</button>
                    </div>
                    <div class="col col-flex"></div>
                    <div class="col col-flex text-end col-auto" v-if="starData.playerId">
                        <button type="button" class="btn btn-sm btn-outline-primary" @click="addCarrier"><i
                                class="fas fa-rocket"></i>
                            Add Carrier</button>
                    </div>
                    <div class="col col-flex ms-1 text-end col-auto">
                        <button type="submit" class="btn btn-sm btn-success"><i class="fas fa-check"></i>
                            Update Star</button>
                    </div>
                </div>

                <div class="text-danger error-text pt-1 pb-2" v-if="errors != null && errors.length !== 0">
                    <p>Please correct the following error(s):</p>
                    <ul>
                        <li v-for="error in errors" :key="error">{{ error }}</li>
                    </ul>
                </div>
            </form>
        </div>
        <change-field-menu :object-type="'Star'" :object-property-name="'ID'" :return-to-previous-on-update="true"
            :starting-value="starData.id" :errors="changeIdErrors" v-if="editingId" v-on:returnToMenu="onReturnToMenu"
            v-on:updateField="(field: string | undefined, value: string) => onUpdateId(value)" />
        <change-field-menu :object-type="'Star'" :object-property-name="'Name'" :return-to-previous-on-update="true"
            :starting-value="starData.name" :errors="changeNameErrors" v-if="editingName"
            v-on:returnToMenu="onReturnToMenu"
            v-on:updateField="(field: string | undefined, value: string | null) => onUpdateName(value)" />

        <confirmation-modal modalName="deleteStarModal" titleText="Delete Star" cancelText="No" confirmText="Yes"
            @onConfirm="confirmDeletion">
            <p>{{ modalText }}</p>
        </confirmation-modal>
    </div>
</template>

<script lang="ts">
import MenuTitle from '../MenuTitle.vue';
import helper from '@/scripts/helper';
import type { Star } from '@/scripts/types/Star';
import { useSpecialistsStore } from '@/stores/specialists';
import ChangeFieldMenu from '../ChangeFieldMenu.vue';
import editor from '@/scripts/editor';
import { useGalaxyStore } from '@/stores/galaxy';
import { useMenuStateStore } from '@/stores/menuState';
import ConfirmationModal from '@/components/modal/ConfirmationModal.vue';
import { Modal } from 'bootstrap';
import storage from '@/scripts/storage';
import { storeToRefs } from 'pinia';


export default {
    components: {
        'menu-title': MenuTitle,
        'change-field-menu': ChangeFieldMenu,
        'confirmation-modal': ConfirmationModal
    },
    props: {
        starId: String
    },
    data() {
        return {
            isSplitResources: storeToRefs(useGalaxyStore()).isSplitNaturalResources,
            starData: {
                id: this.starId,
                location: { x: NaN, y: NaN },
                naturalResources: { economy: NaN, industry: NaN, science: NaN },
                playerId: null,
                ships: null,
                shipsActual: NaN,
                specialistId: null,
                specialistExpireTick: null,
                homeStar: false,
                warpGate: false,
                isNebula: false,
                isAsteroidField: false,
                isBinaryStar: false,
                isBlackHole: false,
                isPulsar: false,
                wormHoleToStarId: null,
                infrastructure: { economy: NaN, industry: NaN, science: NaN },
                isKingOfTheHillStar: false,
                specialist: undefined,
                manufacturing: NaN
            } as Star,
            creatingWormhole: false,
            inWormholeSelectMode: false,
            selectedPlayer: null as string | null,
            selectedCapitalOwner: null as string | null,
            selectedSpecialist: null as number | null,
            selectionPlayers: helper.selectionPlayers(),
            selectionSpecialists: helper.selectionSpecialists(useSpecialistsStore().getValidStarSpecialists()),
            editingId: false,
            editingName: false,
            deleteStarModal: null as Modal | null,
            modalText: undefined as string | undefined,
            changeIdErrors: [] as string[],
            changeNameErrors: [] as string[],
            errors: [] as string[],
            allowEditingId: storage.getSettings().technical.allowChangeId === 'enabled'
        }
    },
    methods: {
        togglePropertyValue(property: keyof Star) {
            if (this.starData[property] == null) {
                return;
            } else if (this.starData[property] === true) {
                if (typeof this.starData[property] !== 'boolean') return;
                (this.starData as any)[property] = false;
            } else {
                if (typeof this.starData[property] !== 'boolean') return;
                (this.starData as any)[property] = true;
            }
        },
        toggleCreatingWormhole() {
            if (this.creatingWormhole) {
                this.creatingWormhole = false;
                this.starData.wormHoleToStarId = null;
                useGalaxyStore().clearClickCallbacks();
            } else this.creatingWormhole = true;
        },
        toggleHomeStar() {
            if (this.starData.homeStar) {
                this.starData.homeStar = false;
                this.selectedCapitalOwner = null;
            } else this.starData.homeStar = true;
        },
        toggleWormholeSelectMode() {
            if (this.inWormholeSelectMode) {
                this.inWormholeSelectMode = false;
                useGalaxyStore().clearClickCallbacks();
                return;
            }
            this.inWormholeSelectMode = true;
            const ref = this.$refs.wormholeToStarIdInputElement;
            useGalaxyStore().setClickCallback({
                ref,
                callbacks: {
                    star: (star: Star) => {
                        this.starData.wormHoleToStarId = star.id;
                        useGalaxyStore().clearClickCallbacks();
                        this.inWormholeSelectMode = false;
                    }
                }
            });
        },
        updateResources(event: Event) {
            const resources = (event.target as HTMLInputElement).value;
            this.starData.naturalResources.economy = Number.parseInt(resources);
            this.starData.naturalResources.industry = Number.parseInt(resources);
            this.starData.naturalResources.science = Number.parseInt(resources);
        },
        updateShips(event: Event) {
            const shipsActual = (event.target as HTMLInputElement).value;
            this.starData.ships = Math.floor(Number(shipsActual));
        },
        onOwnerChanged() {
            this.starData.playerId = this.selectedPlayer;
        },
        onSpecialistChanged() {
            if (this.selectedSpecialist == null) {
                this.starData.specialist = undefined;
                this.starData.specialistId = null;
                this.starData.specialistExpireTick = null;
                return;
            }
            this.starData.specialist = useSpecialistsStore().getStarSpecialistById(this.selectedSpecialist);
            this.starData.specialistId = this.starData.specialist?.id ? this.starData.specialist.id : null;
        },
        onReturnToMenu() {
            this.editingId = false;
            this.editingName = false;
            for (const e in this.changeIdErrors) { // Actually updates prop of ChangeFieldMenu
                this.changeIdErrors.pop();
            }
            for (const e in this.changeNameErrors) {
                this.changeNameErrors.pop();
            }
        },
        onUpdateId(value: string) {
            for (const e in this.changeIdErrors) { // Actually updates prop of ChangeFieldMenu
                this.changeIdErrors.pop();
            }
            if (useGalaxyStore().checkIfIdIsDuplicate('star', value) && value !== this.starData.id) {
                this.changeIdErrors.push(`A star with the ID '${value}' already exists.`);
                return;
            }
            if (value == null || value === '') {
                this.changeIdErrors.push(`A star cannot have an empty ID.`);
                return;
            }
            useGalaxyStore().changeId('star', this.starData.id, value);
            this.starData.id = value;
            editor.updateStarId(this.starData);

            this.$toast.default(`Changed star ID to ${this.starData.id}.`);
        },
        onUpdateName(value: string | null | undefined) {
            for (const e in this.changeNameErrors) {
                this.changeNameErrors.pop();
            }
            if (value == null) value = undefined;

            useGalaxyStore().updateStarProperty(this.starData, 'name', value);
            this.starData.name = value;
            editor.updateStarName(this.starData);

            if (value) {
                this.$toast.default(`Changed star name to ${this.starData.name}.`);
            } else {
                this.$toast.default(`Cleared star name.`);
            }
        },
        addCarrier() {
            const newCarrier = editor.createCarrierAtStar(this.starData);

            this.$toast.default(`Created carrier ${newCarrier.id}.`);
        },
        updateStar() {
            if (!this.validateStar()) return;

            useGalaxyStore().updateStar(this.starData);
            editor.reloadStar(this.starData);
            this.updateWormholes();

            // If this star is a capital star, set the homeStarId of the player that used to own it to null.
            // If this player is the same, we will later set this again, and if the star is no longer a capital, we won't.
            const oldCapitalOwner = this.galaxy.players.find(p => p.homeStarId === this.starData.id);
            if (oldCapitalOwner != null) {
                oldCapitalOwner.homeStarId = null;
            }

            if (this.selectedCapitalOwner != null) {
                const newCapitalOwner = helper.getPlayerById(this.selectedCapitalOwner);
                if (newCapitalOwner == null) throw new Error(`Attempted to update homeStarId (to star ${this.starData.id}) of null player!`);

                if (newCapitalOwner.homeStarId !== null) {
                    const previousCapital = helper.getStarById(newCapitalOwner.homeStarId);
                    if (previousCapital == null) throw new Error(`Attempted to update a null previous capital star (of player ${newCapitalOwner.id})!`);
                    previousCapital.homeStar = false;
                    useGalaxyStore().updateStar(previousCapital);
                    editor.reloadStar(previousCapital);
                }

                newCapitalOwner.homeStarId = this.starData.id;
                useGalaxyStore().updatePlayer(newCapitalOwner);
            }

            useMenuStateStore().updateSelectionStar(this.starData);
            useMenuStateStore().setMenuState('none');

            this.$toast.default(`Star ${this.starData.id} updated.`);
        },
        deleteStar(force: boolean = false) {
            const starCarriers = helper.getStarCarriers(this.starData.id);

            if (!force && storage.getSettings().confirmations.confirmDeleteStar !== 'disabled') {
                if (this.deleteStarModal == null) {
                    this.deleteStarModal = new Modal(document.getElementById('deleteStarModal')!);
                }

                if (starCarriers.length !== 0) {
                    this.modalText = `Are you sure you want to delete star ${this.starData.id}? ${starCarriers.length} ${starCarriers.length > 1 ? 'carriers' : 'carrier'} will be deleted as well.`;
                    this.deleteStarModal.show();
                    return;
                } else if (storage.getSettings().confirmations.confirmDeleteStar === 'always') {
                    this.modalText = `Are you sure you want to delete star ${this.starData.id}?`;
                    this.deleteStarModal.show();
                    return;
                }
            }

            // If this star is a capital star, set the homeStarId of the player that used to own it to null.
            const capitalOwner = this.galaxy.players.find(p => p.homeStarId === this.starData.id);
            if (capitalOwner != null) {
                capitalOwner.homeStarId = null;
            }

            for (const carrier of starCarriers) {
                useGalaxyStore().removeCarrier(carrier.id);
                editor.deleteCarrier(carrier);
            }

            useGalaxyStore().removeStar(this.starData.id);
            editor.deleteStar(this.starData);
            useMenuStateStore().removeStarFromSelection(this.starData.id);
            editor.map!.drawStarSelection();

            editor.updateWaypointsOnStarDeletion(this.starData);
            this.updateWormholes(true);

            useMenuStateStore().setMenuState('none');

            this.$toast.default(`Star ${this.starData.id} deleted.`);
        },
        confirmDeletion() {
            this.deleteStar(true);
        },
        updateWormholes(deleteOnly: boolean = false) {
            const destinationStar = this.galaxy.stars.find(s => s.wormHoleToStarId === this.starData.id);
            if (destinationStar != null) { // WH existed and was removed
                destinationStar.wormHoleToStarId = null;
                useGalaxyStore().updateStar(destinationStar);
                editor.reloadStar(destinationStar);
                editor.updateWormholes();
            }

            if (this.starData.wormHoleToStarId != null && !deleteOnly) {
                const destinationStar = this.galaxy.stars.find(s => s.id === this.starData.wormHoleToStarId);
                if (destinationStar != null) {
                    if (destinationStar.wormHoleToStarId != null) { // Because we can add a WH to a star that is already a WH
                        const destinationStarWormholeDestination = this.galaxy.stars.find(s => s.id === destinationStar.wormHoleToStarId);
                        if (destinationStarWormholeDestination != null) {
                            destinationStarWormholeDestination.wormHoleToStarId = null;
                            useGalaxyStore().updateStar(destinationStarWormholeDestination);
                            editor.reloadStar(destinationStarWormholeDestination);
                        }
                    }
                    destinationStar.wormHoleToStarId = this.starData.id;
                    useGalaxyStore().updateStar(destinationStar);
                    editor.reloadStar(destinationStar);
                }
                editor.updateWormholes();
            }
        },
        validateStar() {
            if (this.errors.length !== 0) this.errors.length = 0;

            if (this.starData.homeStar && this.selectedCapitalOwner == null) {
                this.errors.push(`A capital star must belong to a player.`);
            }

            if (this.starData.wormHoleToStarId != null) {
                if (this.starData.wormHoleToStarId !== '') {
                    const targetStar = helper.getStarById(this.starData.wormHoleToStarId);
                    if (targetStar == null) this.errors.push(`Invalid wormhole star ID.`);
                } else this.starData.wormHoleToStarId = null;
            }

            if (this.starData.playerId == null && this.starData.shipsActual > 0) {
                this.errors.push(`Unowned stars must not have any ships.`);
            }

            if (this.errors.length !== 0) return false;
            return true;
        }
    },
    mounted() {
        this.starData = JSON.parse(JSON.stringify(this.star));

        if (this.starData.playerId != null) {
            const owner = helper.getPlayerById(this.starData.playerId);
            if (owner != null) {
                this.selectedPlayer = owner.id;
            } else throw new Error(`A star has a playerId (${this.starData.playerId}) that does not belong to any player!`);
        }

        const capitalOwner = this.galaxy.players.find(p => p.homeStarId === this.starData.id);
        if (capitalOwner != null) this.selectedCapitalOwner = capitalOwner.id;

        this.selectedSpecialist = this.starData.specialistId;

        this.creatingWormhole = this.starData.wormHoleToStarId != null;

        if (!this.starData.shipsActual) {
            if (!this.starData.ships) {
                this.starData.shipsActual = 0;
                this.starData.ships = 0;
            } else this.starData.shipsActual = this.starData.ships;
        }
    },
    beforeUnmount() {
        useGalaxyStore().clearClickCallbacks();
    },
    computed: {
        star: function () {
            if (this.starId == null) return;
            return helper.getStarById(this.starId);
        },
        title: function () {
            if (this.star == null) return;
            if (this.star.name) return;
            return `Star ${this.star.id}`;
        },
        isNamed: function () {
            if (this.star?.name) return true;
            return false;
        },
        isDeadStar: function () {
            const isDead = helper.isDeadStar(this.starData);
            if (isDead) {
                this.starData.specialist = undefined;
                this.selectedSpecialist = null;
                this.starData.specialistExpireTick = null;
                this.starData.infrastructure.economy = 0;
                this.starData.infrastructure.industry = 0;
                this.starData.infrastructure.science = 0;
            }
            return helper.isDeadStar(this.starData);
        },
        effectiveTechs: function () {
            return helper.getEffectiveTechs(this.starData);
        },
        scanningDistance: function () {
            if (this.effectiveTechs == null) return NaN;
            if (this.effectiveTechs.scanning === 0) return 0;
            return this.effectiveTechs.scanning + 1;
        },
        hyperspaceDistance: function () {
            if (this.effectiveTechs == null) return NaN;
            return this.effectiveTechs.scanning + 1.5;
        },
        weapons: function () {
            if (this.effectiveTechs == null) return NaN;
            const baseWeapons = this.effectiveTechs.trueWeapons;
            let defenderBonus = 0;
            if (this.starData.specialist?.modifiers.special?.defenderBonus) {
                defenderBonus += this.starData.specialist.modifiers.special.defenderBonus;
            }
            if (this.starData.isAsteroidField) {
                defenderBonus++;
            }
            if (defenderBonus !== 0) {
                return `${Math.max(baseWeapons + defenderBonus, 1)} (+${defenderBonus})`;
            } else return `${Math.max(baseWeapons, 1)}`
        },
        terraformedResources: function () {
            if (this.effectiveTechs == null) {
                return this.starData.naturalResources;
            }
            return helper.calculateTerraformedResources(this.starData, this.effectiveTechs.terraforming);
        },
        galaxy: function () {
            return useGalaxyStore().$state.galaxy;
        }
    }
}
</script>

<style scoped>
.fade-in {
    animation-name: fadeInAnimation;
    animation-duration: .3s;
}

@keyframes fadeInAnimation {
    0% {
        opacity: 0;
    }

    100% {
        opacity: 1;
    }
}

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

.pre-textbox-icon-span {
    margin-right: 6px;
}

.form-control.small-input {
    height: 20px;
}

.form-control.semi-small-input {
    height: 23px;
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

.form-control {
    font-size: 10px;
}

.form-control:disabled {
    opacity: 0.5;
}

.form-control::placeholder {
    color: rgba(255, 255, 255, 0.5);
}

.row.row-center {
    --bs-gutter-x: 0px;
    --bs-gutter-y: 0px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
}

.row.icon-row {
    --bs-gutter-x: 0px;
    --bs-gutter-y: 0px;
    display: flex;
    align-items: center;
    width: 100%;
}

.row.row-infra {
    --bs-gutter-x: 0px;
    --bs-gutter-y: 0px;
    display: flex;
    align-items: center;
    width: 100%;
}

.textbox-text-slash {
    margin-left: 3px;
    margin-right: 3px;
}

.col-2.col-20p {
    width: 20% !important;
}

.col-star {
    align-content: center;
    overflow: hidden;
}

.terraformed-number {
    margin-right: 6px;
}

#naturalEconomy,
#terraformedEconomy,
#economyIcon {
    color: rgba(60, 210, 165) !important;
}

#naturalIndustry,
#terraformedIndustry,
#industryIcon {
    color: rgba(255, 159, 12) !important;
}

#naturalScience,
#terraformedScience,
#scienceIcon {
    color: rgba(48, 190, 255) !important;
}

.col.col-ico {
    text-align: center;
}

#colEconomy {
    padding-right: 8px !important;
}

#colIndustry {
    padding-left: 4px !important;
    padding-right: 4px !important;
}

#colScience {
    padding-left: 8px !important;
}

#binary {
    position: relative;
    top: -1px;
    opacity: 0.75;
}

#pulsar {
    height: 18px;
    width: 18.25px;
    position: relative;
    top: -2px;
    opacity: 0.75;
}

#wormhole {
    height: 22px;
    opacity: 0.75;
}

.does-not-have-property {
    opacity: 0.3;
}

.property-button {
    cursor: pointer;
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

#wormholeToStarIdInput {
    padding-right: 6px !important;
}

#specialistSelection {
    padding-right: 12px !important;
    padding-left: 4px !important;
}

#shipsInput {
    padding-right: 8px !important;
}

.text-right {
    text-align: right;
}

#homeStarButton {
    font-size: 11px;
    --bs-btn-padding-x: 8px;
    --bs-btn-padding-y: 2px;
}

.text-after-button {
    margin-left: 6px;
}

.star-text-col {
    margin-right: 6px;
}

.star {
    fill: rgb(255, 255, 255);
    fill-opacity: 0.974619;
    stroke: none;
    stroke-width: 3.425;
    stroke-linecap: square;
    stroke-linejoin: miter;
    stroke-miterlimit: 1.5;
    stroke-dasharray: 82.2, 82.2;
    stroke-dashoffset: 0;
    stroke-opacity: 1;
    paint-order: normal;
}

.error-text {
    font-size: 14px;
    font-weight: 400;
}

ul {
    margin: 0;
}

#locationText {
    color: rgb(48, 190, 255) !important;
}
</style>