<template>
    <div class="menu-page">
        <div class="fade-in" v-show="!editingId">
            <menu-title :title="title">
                <button type="button" class="btn btn-sm btn-outline-success me-1" @click="editingId = true">
                    <i class="fas fa-pencil-alt"></i>
                </button>
                <button class="btn btn-sm btn-outline-primary me-1" @click="toggleHidden()">
                    <i class="fas fa-eye" v-if="!hidden"></i>
                    <i class="fas fa-eye-slash" v-if="hidden"></i>
                </button>
            </menu-title>
            <div class="text-warning" v-if="hidden">
                Click the <i class="fas fa-eye-slash"></i> button to view this menu.
            </div>
            <div v-show="!hidden">
                <form id="carrierDetailForm" @submit.prevent="updateCarrier()">
                    <div class="bg-dark-custom pb-2 mb-1">
                        <div class="row pt-1">
                            <div class="col text-center" id="locationText">
                                <p>Location: ({{ carrierData?.location?.x.toFixed(3) }}, {{
                                    carrierData?.location?.y.toFixed(3) }})</p>
                            </div>
                        </div>
                        <div class="row pt-1">
                            <div class="col col-auto col-carrier carrier-text-col">
                                <p>This carrier is controlled by</p>
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
                    </div>
                    <div class="row pb-1" v-if="carrierData.orbiting != null">
                        <div class="col text-center">
                            <span title="This carrier is in orbit">
                                <i class="fas fa-star"></i>
                                {{ carrierData.orbiting }}
                            </span>
                        </div>
                    </div>
                    <div class="row" v-if="carrierData.orbiting == null" id="inTransitRow">
                        <div class="col text-center" id="etaCol">
                            <span title="This carrier is in transit">
                                <i class="fas fa-star"></i>
                                {{ carrierData.waypoints[0]?.source }}
                                <i class="fas fa-arrow-right"></i>
                                {{ carrierData.waypoints[0]?.destination }}
                            </span>
                        </div>
                        <div class="col text-center">
                            <span>
                                ETA: {{ ticksToArrival }} ticks ({{
                                    ticksToArrivalWarp }} warp)
                            </span>
                        </div>
                    </div>
                    <div class="row" v-if="carrierData.waypoints.length !== 0">
                        <div class="col col-auto pe-2">
                            <span title="Progress along 1st waypoint">Progress</span>
                        </div>
                        <div class="col pe-2">
                            <input class="form-range slider" type="range" min="0.0" max="1.0" step="0.01"
                                v-model.number="carrierData.progress">
                        </div>
                        <div class="col col-2">
                            <input class="form-control semi-small-input hidden-number" type="number" min="0.0" max="1.0"
                                step="any" v-model="carrierData.progress">
                        </div>
                    </div>
                    <div class="row icon-row mb-2">
                        <div class="col col-flex col-4" id="shipsInput">
                            <span title="True ships" class="pre-textbox-icon-span">
                                <i class="fas fa-rocket fa-lg"></i>
                            </span>
                            <input id="ships" class="form-control semi-small-input hidden-number" type="number" min="1"
                                required="true" v-model="carrierData.ships">
                        </div>
                        <div class="col col-flex" id="specialistSelection">
                            <span title="Specialist" class="pre-textbox-icon-span">
                                <i class="fas fa-user-astronaut fa-lg"></i>
                            </span>
                            <select class="form-control small-select" id="specialist" v-model="selectedSpecialist"
                                :class="{ 'selected-null': !selectedSpecialist }" @change="onSpecialistChanged">
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
                                type="number" min="0" v-model="carrierData.specialistExpireTick"
                                :disabled="!selectedSpecialist">
                        </div>
                    </div>
                    <div class="row pb-1" v-if="effectiveTechs != null">
                        <div class="col text-center">
                            <span title="Weapons when attacking a star"><i class="fas fa-gun"></i><i
                                    class="fas fa-star"></i>
                                {{ attackStarWeapons }}</span>
                        </div>
                        <div class="col text-center">
                            <span title="Weapons when defending a star"><i class="fas fa-shield"></i><i
                                    class="fas fa-star"></i>
                                {{ defendStarWeapons }}</span>
                        </div>
                        <div class="col text-center">
                            <span title="Weapons in carrier-to-carrier combat"><i class="fas fa-gun"></i><i
                                    class="fas fa-rocket"></i>
                                {{ fightCarrierWeapons }}</span>
                        </div>
                        <div class="col text-center">
                            <span title="Weapons deducted from enemy in combat"><i class="fas fa-down-long"></i><i
                                    class="fas fa-gun" id="deductedWeaponsIcon"></i>
                                {{ weaponsDebuffToEnemy }}</span>
                        </div>
                        <div class="col text-center">
                            <span title="Hyperspace range"><i class="fas fa-gas-pump"></i>
                                {{ effectiveTechs.hyperspace }}</span>
                        </div>
                    </div>

                    <div class="bg-dark-custom row pt-2 pb-2" id="bottomRow">
                        <div class="col col-flex col-auto">
                            <button type="button" class="btn btn-sm btn-danger" @click="deleteCarrier()"><i
                                    class="fas fa-trash"></i>
                                Delete Carrier</button>
                        </div>
                        <div class="col col-flex"></div>
                        <div class="col col-flex ms-1 text-end col-auto">
                            <button type="button" class="btn btn-sm btn-outline-warning" @click="toggleGift()"
                                :class="{ active: carrierData.isGift }"><i class="fas fa-gift"></i>
                                {{ carrierData.isGift ? 'Unset Gift' : 'Set Gift' }}</button>
                        </div>
                        <div class="col col-flex ms-1 text-end col-auto">
                            <button type="submit" class="btn btn-sm btn-success"
                                :class="{ disabled: editingWaypoints }"><i class="fas fa-check"></i>
                                Update Carrier</button>
                        </div>
                    </div>

                    <div class="text-danger error-text pt-1" v-if="errors != null && errors.length !== 0">
                        <p>Please correct the following error(s):</p>
                        <ul>
                            <li v-for="error in errors" :key="error">{{ error }}</li>
                        </ul>
                    </div>
                </form>
                <form id="carrierWaypointForm" @submit.prevent="saveWaypoints()">
                    <div class="row pt-2 pb-2">

                        <div class="col col-flex">
                            <h4>Waypoints</h4>
                        </div>
                        <div class="col"></div>
                        <div class="col col-flex col-auto" v-if="canLoop">
                            <button type="button" class="btn btn-sm btn-outline-primary" @click="toggleLoop()"
                                :class="{ active: carrierData.waypointsLooped }"><i class="fas fa-sync"></i>
                                {{ carrierData.waypointsLooped ? 'Unloop' : 'Loop' }}</button>
                        </div>
                        <div class="col col-flex ms-1 col-auto" v-if="!editingWaypoints">
                            <button type="button" class="btn btn-sm btn-success" @click="editWaypoints()"><i
                                    class="fas fa-map-marker-alt"></i>
                                Edit Waypoints</button>
                        </div>
                        <div class="col col-flex ms-1 col-auto" v-if="editingWaypoints">
                            <button type="button" class="btn btn-sm btn-outline-warning" @click="popWaypoints(1)"
                                :disabled="carrierData.waypoints.length === 0 || (carrierData.waypoints.length < 2 && carrierData.orbiting == null)"><i
                                    class="fas fa-caret-left"></i>
                                Last</button>
                        </div>
                        <div class="col col-flex ms-1 col-auto" v-if="editingWaypoints">
                            <button type="button" class="btn btn-sm btn-outline-danger"
                                @click="popWaypoints(carrierData.waypoints.length)"><i class="fas fa-undo"></i>
                                Clear</button>
                        </div>
                        <div class="col col-flex ms-1 col-auto" v-if="editingWaypoints">
                            <button type="submit" class="btn btn-sm btn-success"><i class="fas fa-check"></i>
                                Save</button>
                        </div>
                    </div>

                    <div class="row table-responsive">
                        <table class="table table-sm table-striped mb-2 mt-2" v-if="carrierData.waypoints.length != 0"
                            id="waypointTable">
                            <thead>
                                <tr>
                                    <th>Destination</th>
                                    <th style="width: 18%;">Distance</th>
                                    <th>Action</th>
                                    <th style="width: 15%;">Value</th>
                                    <th style="width: 12%;">Delay</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="waypoint in carrierData.waypoints" :key="waypoint.destination">
                                    <template v-if="waypoint">
                                        <td>
                                            <span>
                                                <i class="fas fa-star"></i>
                                                {{ waypoint.destination }}
                                            </span>
                                        </td>
                                        <td class="waypointDistance">
                                            <span :class="{ 'text-danger': !isWaypointDistanceValid(waypoint) }">{{
                                                getWaypointDistance(waypoint) }}</span>
                                        </td>
                                        <td>
                                            <select class="form-control small-select" id="actionSelection"
                                                v-if="editingWaypoints" v-model="waypoint.action">
                                                <option value="nothing">Do Nothing</option>
                                                <option value="collectAll">Collect All</option>
                                                <option value="dropAll">Drop All</option>
                                                <option value="collect">Collect N</option>
                                                <option value="drop">Drop N</option>
                                                <option value="collectAllBut">Collect All But N</option>
                                                <option value="dropAllBut">Drop All But N</option>
                                                <option value="garrison">Garrison N</option>
                                                <option value="collectPercentage">Collect %</option>
                                                <option value="dropPercentage">Drop %</option>
                                            </select>
                                            <span v-if="!editingWaypoints && waypoint.action === 'nothing'">Do
                                                Nothing</span>
                                            <span v-if="!editingWaypoints && waypoint.action === 'collectAll'">Collect
                                                All</span>
                                            <span v-if="!editingWaypoints && waypoint.action === 'dropAll'">Drop
                                                All</span>
                                            <span v-if="!editingWaypoints && waypoint.action === 'collect'">Collect
                                                N</span>
                                            <span v-if="!editingWaypoints && waypoint.action === 'drop'">Drop N</span>
                                            <span
                                                v-if="!editingWaypoints && waypoint.action === 'collectAllBut'">Collect
                                                All
                                                But N</span>
                                            <span v-if="!editingWaypoints && waypoint.action === 'dropAllBut'">Drop All
                                                But
                                                N</span>
                                            <span v-if="!editingWaypoints && waypoint.action === 'garrison'">Garrison
                                                N</span>
                                            <span
                                                v-if="!editingWaypoints && waypoint.action === 'collectPercentage'">Collect
                                                %</span>
                                            <span v-if="!editingWaypoints && waypoint.action === 'dropPercentage'">Drop
                                                %</span>
                                        </td>
                                        <td>
                                            <input class="form-control semi-small-input hidden-number" type="number"
                                                min="0" required="true" step="1" id="actionShipsInput"
                                                v-model="waypoint.actionShips"
                                                v-if="waypoint.action !== 'nothing' && waypoint.action !== 'collectAll' && waypoint.action !== 'dropAll' && editingWaypoints"></input>
                                            <span
                                                v-if="!editingWaypoints && !(waypoint.action === 'nothing' || waypoint.action === 'collectAll' || waypoint.action === 'dropAll')">
                                                {{ waypoint.actionShips }}</span>
                                        </td>
                                        <td>
                                            <input class="form-control semi-small-input hidden-number" type="number"
                                                min="0" v-if="editingWaypoints"
                                                :disabled="carrierData.waypoints.indexOf(waypoint) === 0 && isInFlight"
                                                id="delayInput" step="1" v-model="waypoint.delayTicks"></input>
                                            <span v-if="!editingWaypoints">{{ waypoint.delayTicks || 0 }}</span>
                                        </td>
                                    </template>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </form>
            </div>
        </div>
        <change-field-menu :object-type="'Carrier'" :object-property-name="'ID'" :return-to-previous-on-update="true"
            :starting-value="carrierData.id" :errors="changeIdErrors" v-if="editingId"
            v-on:returnToMenu="onReturnToMenu"
            v-on:updateField="(field: string | undefined, value: string) => onUpdateId(value)" />
        <confirmation-modal modalName="deleteCarrierModal" titleText="Delete Carrier" cancelText="No" confirmText="Yes"
            @onConfirm="confirmDeletion">
            <p>{{ modalText }}</p>
        </confirmation-modal>
    </div>
</template>

<script lang="ts">
import helper from '@/scripts/helper';
import MenuTitle from '../MenuTitle.vue';
import type { Carrier } from '@/scripts/types/Carrier';
import type { CarrierWaypoint } from '@/scripts/types/CarrierWaypoint';
import { useSpecialistsStore } from '@/stores/specialists';
import ChangeFieldMenu from '../ChangeFieldMenu.vue';
import { useGalaxyStore } from '@/stores/galaxy';
import editor from '@/scripts/editor';
import { useMenuStateStore } from '@/stores/menuState';
import ConfirmationModal from '../../modal/ConfirmationModal.vue';
import { Modal } from 'bootstrap';
import storage from '@/scripts/storage';
import Map from '@/scripts/map';
import type { Star } from '@/scripts/types/Star';

export default {
    components: {
        'menu-title': MenuTitle,
        'change-field-menu': ChangeFieldMenu,
        'confirmation-modal': ConfirmationModal
    },
    props: {
        carrierId: String
    },
    data() {
        return {
            carrierData: {
                id: this.carrierId,
                location: { x: NaN, y: NaN },
                orbiting: null,
                waypointsLooped: false,
                ships: NaN,
                specialistId: null,
                specialistExpireTick: null,
                specialist: undefined,
                isGift: false,
                waypoints: [] as CarrierWaypoint[],
                playerId: ''
            } as Carrier,
            selectedPlayer: '',
            selectedSpecialist: null as number | null,
            selectionPlayers: helper.selectionPlayers(false),
            selectionSpecialists: helper.selectionSpecialists(useSpecialistsStore().getValidCarrierSpecialists()),
            editingId: false,
            deleteCarrierModal: null as Modal | null,
            modalText: undefined as string | undefined,
            changeIdErrors: [] as string[],
            errors: [] as string[],
            waypointCreatedHandler: null as any,
            waypointOutOfRangeHandler: null as any,
            editingWaypoints: false,
            hidden: false
        }
    },
    watch: {
        isInFlight() {
            this.updateDelayTicks();
        }
    },
    methods: {
        onOwnerChanged() {
            this.carrierData.playerId = this.selectedPlayer;
        },
        onSpecialistChanged() {
            if (this.selectedSpecialist == null) {
                this.carrierData.specialist = undefined;
                this.carrierData.specialistId = null;
                this.carrierData.specialistExpireTick = null;
                return;
            }
            this.carrierData.specialist = useSpecialistsStore().getCarrierSpecialistById(this.selectedSpecialist);
            this.carrierData.specialistId = this.carrierData.specialist?.id ? this.carrierData.specialist.id : null;

            if (!this.canLoop) this.toggleLoop();
        },
        updateDelayTicks() {
            if (this.isInFlight) {
                if (this.carrierData.waypoints[0] && this.carrierData.waypoints[0].delayTicks !== 0) {
                    this.carrierData.waypoints[0].delayTicks = 0;
                }
            }
        },
        onReturnToMenu() {
            this.editingId = false;
            for (const e in this.changeIdErrors) { // Actually updates prop of ChangeFieldMenu
                this.changeIdErrors.pop();
            }
        },
        onUpdateId(value: string) {
            for (const e in this.changeIdErrors) { // Actually updates prop of ChangeFieldMenu
                this.changeIdErrors.pop();
            }
            if (useGalaxyStore().checkIfIdIsDuplicate('carrier', value) && value !== this.carrierData.id) {
                if (this.changeIdErrors == null || this.changeIdErrors.length === 0) this.changeIdErrors.push(`A carrier with the ID ${value} already exists.`);
                return;
            }
            if (value == null || value === '') {
                this.changeIdErrors.push(`A carrier cannot have an empty ID.`);
                return;
            }
            useGalaxyStore().changeId('carrier', this.carrierData.id, value);
            this.carrierData.id = value;

            this.$toast.default(`Changed carrier ID to ${this.carrierData.id}.`);
        },
        updateCarrier() {
            if (!this.validateCarrier()) return;

            let oldStar: Star | undefined;
            let star: Star | undefined;

            if (this.carrierData.orbiting) { // If this carrier was orbiting a star before being updated, we want to update that star as well
                oldStar = helper.getStarById(this.carrierData.orbiting);
                if (oldStar == null) throw new Error(`Carrier ${this.carrierData.id} is orbiting a non-existent star!`);
            }

            if (this.carrierData.waypoints.length !== 0) {
                if (this.carrierData.progress === 0) {
                    this.carrierData.orbiting = this.carrierData.waypoints[0].source;
                } else if (this.carrierData.progress === 1) {
                    this.carrierData.orbiting = this.carrierData.waypoints[0].destination;
                    this.carrierData.waypoints.shift(); // Remove 1st waypoint since it has been 'completed'.
                    this.carrierData.progress = 0; // Reset progress to 0 for next waypoint
                } else {
                    this.carrierData.orbiting = null; // No longer orbiting anything if 0 < progress < 1.
                }
            }

            if (this.carrierData.orbiting != null) {
                star = helper.getStarById(this.carrierData.orbiting); // This is done because the star the carrier is orbiting may have now changed
                const starLoc = star?.location;
                if (starLoc == null) throw new Error(`Carrier ${this.carrierData.id} is orbiting a non-existent star!`);
                this.carrierData.location = starLoc;
            } else {
                if (this.carrierData.progress == null) throw new Error(`Cannot update location of carrier ${this.carrierData.id}: progress is null!`);
                const sourceLoc = helper.getStarById(this.carrierData.waypoints[0].source)?.location;
                const destinationLoc = helper.getStarById(this.carrierData.waypoints[0].destination)?.location;
                if (sourceLoc == null || destinationLoc == null) {
                    throw new Error(`Cannot get waypoint distance of carrier ${this.carrierData.id}: invalid source and/or destination of waypoint!`);
                }
                this.carrierData.location = helper.progressAlongPathToLocation(this.carrierData.progress, sourceLoc, destinationLoc);
            }

            useGalaxyStore().updateCarrier(this.carrierData);
            editor.reloadCarrier(this.carrierData);
            if (oldStar != null) editor.updateStarShips(oldStar);
            if (star != null) editor.updateStarShips(star);

            useMenuStateStore().setMenuState('none');

            this.$toast.default(`Carrier ${this.carrierData.id} updated.`);
        },
        deleteCarrier(force: boolean = false) {
            if (!force && storage.getSettings().confirmations.confirmDeleteCarrier === 'enabled') {
                if (this.deleteCarrierModal == null) {
                    this.deleteCarrierModal = new Modal(document.getElementById('deleteCarrierModal')!);
                }

                this.modalText = `Are you sure you want to delete carrier ${this.carrierData.id}?`;
                this.deleteCarrierModal.show();
                return;
            }

            useGalaxyStore().removeCarrier(this.carrierData.id);
            editor.deleteCarrier(this.carrierData);

            if (this.carrierData.orbiting) { // If this carrier was orbiting a star before being deleted, we want to update that star as well
                const star = helper.getStarById(this.carrierData.orbiting);
                if (star == null) throw new Error(`Carrier ${this.carrierData.id} is orbiting a non-existent star!`);
                editor.updateStarShips(star);
            }

            useMenuStateStore().setMenuState('none');

            this.$toast.default(`Carrier ${this.carrierData.id} deleted.`);
        },
        confirmDeletion() {
            this.deleteCarrier(true);
        },
        toggleGift() {
            if (!this.carrierData.isGift) {
                this.carrierData.isGift = true;
                if (this.carrierData.waypointsLooped) {
                    this.toggleLoop();
                }
            } else this.carrierData.isGift = false;

            useGalaxyStore().updateCarrierProperty(this.carrierData, 'isGift', this.carrierData.isGift);
            editor.updateCarrierShips(this.carrierData);
        },
        toggleLoop() {
            let wasLooped = this.carrierData.waypointsLooped;
            if (!this.canLoop) {
                this.carrierData.waypointsLooped = false;
            } else this.carrierData.waypointsLooped ? this.carrierData.waypointsLooped = false : this.carrierData.waypointsLooped = true;

            if ((!wasLooped && this.carrierData.waypointsLooped === false) || (wasLooped && this.carrierData.waypointsLooped === true)) return;

            if (!this.editingWaypoints) {
                useGalaxyStore().updateCarrierProperty(this.carrierData, 'waypointsLooped', this.carrierData.waypointsLooped);
                editor.updateCarrierWaypoints(this.carrierData);

                this.$toast.default(`Carrier ${this.carrierData.id} waypoints updated.`);
            }
        },
        editWaypoints() {
            this.editingWaypoints = true;

            this.waypointCreatedHandler = this.onWaypointCreated.bind(this);
            this.waypointOutOfRangeHandler = this.onWaypointOutOfRange.bind(this);
            editor.map!.on('onWaypointCreated', this.waypointCreatedHandler);
            editor.map!.on('onWaypointOutOfRange', this.waypointOutOfRangeHandler);

            editor.setMode('waypoints', [this.carrierData]);
        },
        saveWaypoints() {
            for (const e of this.errors) {
                this.errors.pop();
            }

            if (!this.validateWaypoints()) return;

            useGalaxyStore().updateCarrierProperty(this.carrierData, 'waypointsLooped', this.carrierData.waypointsLooped);
            // Need a deep copy here to preserve the separation of carrierData and carrier
            useGalaxyStore().updateCarrierProperty(this.carrierData, 'waypoints', JSON.parse(JSON.stringify(this.carrierData.waypoints)));
            useGalaxyStore().updateCarrierProperty(this.carrierData, 'orbiting', this.carrierData.orbiting);
            // In case the carrier menu is closed without saving carrier, avoid a progress == null situation
            if (this.carrierData.orbiting) useGalaxyStore().updateCarrierProperty(this.carrierData, 'progress', 0);
            editor.updateCarrierWaypoints(this.carrierData);

            this.editingWaypoints = false;

            if (this.waypointCreatedHandler != null) editor.map!.off('onWaypointCreated', this.waypointCreatedHandler);
            if (this.waypointOutOfRangeHandler != null) editor.map!.off('onWaypointOutOfRange', this.waypointOutOfRangeHandler);

            editor.resetMode();

            this.$toast.default(`Carrier ${this.carrierData.id} waypoints updated.`);
        },
        onWaypointCreated(e: CarrierWaypoint) {
            e.action = storage.getSettings().carriers.defaultAction;

            e.actionShips = storage.getSettings().carriers.defaultActionShips;

            if (this.carrierData.waypoints.length === 1) { // When creating or re-creating 1st waypoint
                this.carrierData.progress = 0;
            }
        },
        onWaypointOutOfRange(e: CarrierWaypoint) {
            this.$toast.error(`This star cannot be reached.`);
        },
        getNextWaypoint(waypoint: CarrierWaypoint) {
            const i = this.carrierData.waypoints.indexOf(waypoint);

            return this.carrierData.waypoints[i + 1] || null;
        },
        getWaypointDistance(waypoint: CarrierWaypoint) {
            const i = this.carrierData.waypoints.indexOf(waypoint);

            const sourceLoc = helper.getStarById(waypoint.source)?.location;
            const destinationLoc = helper.getStarById(waypoint.destination)?.location;
            if (sourceLoc == null || destinationLoc == null) {
                throw new Error(`Cannot get waypoint distance of carrier ${this.carrierData.id}: invalid source and/or destination of waypoint!`);
            }

            let distance = helper.getDistanceBetweenLocations(sourceLoc, destinationLoc);

            distance = Math.round(distance / Map.lightYearDistance * 100.0) / 100.0;

            return distance.toFixed(2);
        },
        popWaypoints(amount: number) {
            if (amount >= this.carrierData.waypoints.length && !this.carrierData.orbiting) amount = this.carrierData.waypoints.length - 1;

            for (let i = 0; i < amount; i++) {
                this.carrierData.waypoints.pop();
            }

            if (!this.canLoop) this.toggleLoop();

            editor.redrawActiveWaypoints();
        },
        validateCarrier() {
            if (this.errors.length !== 0) this.errors.length = 0;

            this.validateWaypoints(false);

            if (this.carrierData.waypoints.length !== 0) {
                if (this.carrierData.progress !== 0 && this.carrierData.progress !== 1) { // Should not ever be null at this point
                    if (this.fullWaypointTicksToArrival === 1) { // 0 < progress < 1 and ETA is 1 tick from source to destination - no such state can logically exist
                        this.errors.push(`The progress value is invalid (the 1st waypoint only takes 1 tick to travel at base speed).`);
                    }
                }
            }

            if (this.carrierData.waypoints[0] && this.carrierData.waypoints[0].delayTicks !== 0 && this.carrierData.progress !== 0 && this.carrierData.progress !== 1) {
                this.carrierData.waypoints[0].delayTicks = 0;
            }

            if (this.errors.length !== 0) return false;
            return true;
        },
        validateWaypoints(resetErrors: boolean = true) {
            if (this.errors.length !== 0 && resetErrors) this.errors.length = 0;

            let hasInvalidWaypointDistance = false;
            for (const waypoint of this.carrierData.waypoints) {
                if (!this.isWaypointDistanceValid(waypoint) && !hasInvalidWaypointDistance) {
                    hasInvalidWaypointDistance = true;
                    this.errors.push(`The hyperspace level required for one or more waypoints exceeds this carrier's effective hyperspace level.`);
                }

                // If the action has no actionShips input, set actionShips to default. 
                if (waypoint.action === 'nothing' || waypoint.action === 'collectAll' || waypoint.action === 'dropAll') {
                    waypoint.actionShips = storage.getSettings().carriers.defaultActionShips;
                }
            }

            if (this.carrierData.waypointsLooped && !this.canLoop) {
                this.carrierData.waypointsLooped = false;
            }

            if (this.isInFlight && this.carrierData.waypoints[0] && this.carrierData.waypoints[0].delayTicks !== 0) {
                this.errors.push(`The first waypoint of an in-flight carrier must have 0 delay.`);
            }

            if (this.errors.length !== 0) return false;
            return true;
        },
        toggleHidden() {
            this.hidden = !this.hidden;
            editor.onMenuToggled(true, this.hidden);
        }
    },
    mounted() {
        this.carrierData = JSON.parse(JSON.stringify(this.carrier));

        if (this.carrierData.playerId != null) {
            const owner = helper.getPlayerById(this.carrierData.playerId);
            if (owner != null) {
                this.selectedPlayer = owner.id;
            } else throw new Error(`A carrier has a playerId (${this.carrierData.playerId}) that does not belong to any player!`);
        } else throw new Error(`A carrier (${this.carrierData.id}) has a null playerId!`);

        this.selectedSpecialist = this.carrierData.specialistId;

        if (this.carrierData.orbiting == null && this.carrierData.progress == null) {
            console.log(`Carrier ${this.carrierData.id} is in transit and has a null progress value.`);
            const sourceLoc = helper.getStarById(this.carrierData.waypoints[0].source)?.location;
            const destinationLoc = helper.getStarById(this.carrierData.waypoints[0].destination)?.location;
            if (sourceLoc == null || destinationLoc == null) throw new Error(`Carrier ${this.carrierData.id} has invalid first and/or last star of first waypoint!`);
            this.carrierData.progress = helper.locationToProgressAlongPath(this.carrierData.location, sourceLoc, destinationLoc);
        }
    },
    beforeUnmount() {
        if (this.waypointCreatedHandler != null) editor.map!.off('onWaypointCreated', this.waypointCreatedHandler);
        if (this.waypointOutOfRangeHandler != null) editor.map!.off('onWaypointOutOfRange', this.waypointOutOfRangeHandler);

        editor.resetMode();
    },
    computed: {
        carrier: function () {
            if (this.carrierId == null) return;
            return helper.getCarrierById(this.carrierId);
        },
        title: function () {
            if (this.carrier == null) return;
            return `Carrier ${this.carrier.id}`;
        },
        effectiveTechs: function () {
            return helper.getEffectiveTechs(this.carrierData);
        },
        baseWeapons: function () {
            if (this.effectiveTechs == null) return NaN;
            const baseWeapons = this.effectiveTechs.weapons;
            return baseWeapons;
        },
        attackStarWeapons: function () {
            if (this.effectiveTechs == null) return NaN;
            const baseWeapons = this.effectiveTechs.weapons;
            let attackBonusC2S = 0;
            let attackBonusC2SPerAlly = 0;
            if (this.carrierData.specialist?.modifiers.local?.carrierToStarCombat?.attacker.weapons) {
                attackBonusC2S = this.carrierData.specialist.modifiers.local.carrierToStarCombat.attacker.weapons;
            }
            if (this.carrierData.specialist?.modifiers.local?.carrierToStarCombat?.attacker.weaponsPerAlly) {
                attackBonusC2SPerAlly = this.carrierData.specialist.modifiers.local.carrierToStarCombat.attacker.weaponsPerAlly;
            }

            if (attackBonusC2SPerAlly !== 0) {
                return `${baseWeapons + attackBonusC2S} (+${attackBonusC2SPerAlly} per ally)`
            } else return baseWeapons + attackBonusC2S;
        },
        defendStarWeapons: function () {
            if (this.effectiveTechs == null) return NaN;
            const baseWeapons = this.effectiveTechs.weapons;
            let defendBonusC2S = 0;
            if (this.carrierData.specialist?.modifiers.local?.carrierToStarCombat?.defender?.weapons) {
                defendBonusC2S = this.carrierData.specialist.modifiers.local.carrierToStarCombat.defender.weapons;
            }

            return baseWeapons + defendBonusC2S;
        },
        fightCarrierWeapons: function () {
            if (this.effectiveTechs == null) return NaN;
            const baseWeapons = this.effectiveTechs.weapons;
            let bonusC2C = 0;
            if (this.carrierData.specialist?.modifiers.local?.carrierToCarrierCombat?.weapons) {
                bonusC2C = this.carrierData.specialist.modifiers.local.carrierToCarrierCombat.weapons;
            }

            return baseWeapons + bonusC2C;
        },
        weaponsDebuffToEnemy: function () {
            let debuff = 0;
            if (this.carrierData.specialist?.modifiers.special?.deductEnemyWeapons) {
                debuff = this.carrierData.specialist.modifiers.special.deductEnemyWeapons;
            }

            return debuff;
        },
        canLoop: function () {
            if (this.carrierData.waypoints.length <= 1) return false;
            const firstStarId = this.carrierData.waypoints[0].destination;
            const lastStarId = this.carrierData.waypoints[this.carrierData.waypoints.length - 1].destination;
            const sourceStar = helper.getStarById(firstStarId);
            const lastStar = helper.getStarById(lastStarId);
            if (sourceStar == null || lastStar == null) {
                throw new Error(`Cannot determine if carrier ${this.carrierData.id} can loop: invalid first and/or last star of waypoints!`);
            }
            return this.carrierData.waypoints.length > 1 &&
                !this.carrierData.isGift &&
                (
                    helper.getHyperspaceDistance(this.carrierData) >= helper.getDistanceBetweenLocations(sourceStar.location, lastStar.location)
                    || helper.isStarPairWormHole(sourceStar, lastStar)
                );
        },
        isWaypointDistanceValid: function () {
            return (waypoint: CarrierWaypoint) => {
                const sourceStar = helper.getStarById(waypoint.source);
                const destinationStar = helper.getStarById(waypoint.destination);
                if (sourceStar == null || destinationStar == null) {
                    throw new Error(`Cannot get waypoint distance of carrier ${this.carrierData.id}: invalid source and/or destination of waypoint!`);
                }
                if (helper.isStarPairWormHole(sourceStar, destinationStar)) return true;
                return helper.getHyperspaceDistance(this.carrierData) >= helper.getDistanceBetweenLocations(sourceStar.location, destinationStar.location);
            }
        },
        ticksToArrival: function () {
            return helper.getTicksToArrival(this.carrierData, false);
        },
        ticksToArrivalWarp: function () {
            return helper.getTicksToArrival(this.carrierData, true);
        },
        fullWaypointTicksToArrival: function () {
            return helper.getTicksToArrival(this.carrierData, false, 0);
        },
        isInFlight: function () {
            return this.carrierData.orbiting == null;
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

.col-carrier {
    align-content: center;
    overflow: hidden;
}

.text-right {
    text-align: right;
}

.text-after-button {
    margin-left: 6px;
}

.carrier-text-col {
    margin-right: 6px;
}

#shipsInput {
    padding-right: 8px !important;
}

#specialistSelection {
    padding-right: 12px !important;
    padding-left: 4px !important;
}

.error-text {
    font-size: 14px;
    font-weight: 400;
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
    width: inherit;
    max-width: 100%;
    table-layout: fixed;
    margin-top: 0 !important;
}

th,
td {
    color: rgba(255, 255, 255, .75) !important;
    text-overflow: ellipsis !important;
    white-space: nowrap;
    overflow-x: hidden;
    font-weight: 300;
}

tr {
    border-color: inherit;
    border-style: solid;
    border-width: 0;
    height: 30px;
}

tr+td {
    width: auto;
}

.table:not(caption) {
    background-color: var(--bs-table-bg);
    border-bottom-width: 1px;
    box-shadow: inset 0 0 0 9999px var(--bs-table-accent-bg);
}

.table-striped>tbody>tr:nth-of-type(odd)>* {
    --bs-table-accent-bg: var(--bs-table-striped-bg);
    color: var(--bs-table-striped-color) !important;
}

thead {
    border-bottom: 2px solid rgba(255, 255, 255, .75);
}

i {
    margin: 0 !important;
}

ul {
    margin: 0;
}

#actionShipsInput,
#delayInput {
    font-size: 14px !important;
    padding-top: 0 !important;
    padding-bottom: 0 !important;
    padding-left: 0.25rem !important;
    padding-right: 0.25rem !important;
    width: fit-content;
}

#actionSelection {
    width: fit-content !important;
}

.flex-span {
    display: inline-flex;
}

#inTransitRow {
    flex-wrap: wrap;
    display: flex;
    overflow-x: scroll;
    scrollbar-width: none;
    -ms-overflow-style: none;
}

#inTransitRow::-webkit-scrollbar {
    display: none;
}

#etaCol {
    text-wrap: nowrap;
}

@media(max-width: 473px) {
    #waypointTable {
        width: 125%;
        max-width: none;
    }
}

.text-warning {
    color: rgba(255, 159, 12, 1) !important;
}

#locationText {
    color: rgb(48, 190, 255) !important;
}
</style>