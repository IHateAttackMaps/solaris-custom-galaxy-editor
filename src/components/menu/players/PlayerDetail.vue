<template>
    <div class="menu-page" v-if="playerData != null">
        <div class="fade-in" v-show="!editingId && !editingAlias">
            <menu-title :title="title" :coloured-text="player?.alias">
                <button class="btn btn-sm btn-outline-success me-1" @click="editingAlias = true">
                    <i class="fas fa-pencil-alt"></i>
                </button>
                <button class="btn btn-sm btn-outline-warning me-1" @click="editingId = true" v-if="allowEditingId">
                    <i class="fas fa-hashtag"></i>
                </button>
            </menu-title>
            <form id="playerDetailForm" @submit.prevent="updatePlayer()">
                <div class="bg-dark-custom pb-2">
                    <div class="row pt-1">
                        <div class="col col-3 text-center pad-right-3">
                            <div class="row pt-1">
                                <div class="col player-shape-col text-start">
                                    <button type="button" class="btn btn-primary btn-sm" id="playerShapeLeftButton"
                                        @click="changePlayerShape(false)"><i class="fas fa-chevron-left"></i></button>
                                </div>
                                <div class="col player-shape-col text-center">
                                    <player-shape-icon :colour="playerData.colour.value" :shape="playerData.shape"
                                        :key="playerData.colour.value" />
                                </div>
                                <div class="col player-shape-col text-end">
                                    <button type="button" class="btn btn-primary btn-sm" id="playerShapeRightButton"
                                        @click="changePlayerShape(true)"><i class="fas fa-chevron-right"></i></button>
                                </div>
                            </div>
                            <div class="row pt-1">
                                <p>Colour:</p>
                            </div>
                            <div class="row">
                                <input id="colour" class="form-control semi-small-input" required="true"
                                    v-model="playerData.colour.value" />
                            </div>
                        </div>
                        <div class="col table-responsive">
                            <table class="table table-sm table-left-border">
                                <tbody>
                                    <tr>
                                        <td>Stars</td>
                                        <td class="text-end">{{ playerStarCount }}</td>
                                    </tr>
                                    <tr>
                                        <td>Carriers</td>
                                        <td class="text-end">{{ playerCarrierCount }}</td>
                                    </tr>
                                    <tr>
                                        <td>Specialists</td>
                                        <td class="text-end">{{ playerSpecialistCount }}</td>
                                    </tr>
                                    <tr>
                                        <td>Ships</td>
                                        <td class="text-end">{{ playerShipCount }}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div class="row large-text top-border pt-2">
                        <div class="col hidden-scroll text-center me-1">
                            <h5 title="Economic infrastructure">
                                <i class="fas fa-money-bill-wave pe-2" id="economyIcon"></i>{{
                                    playerInfrastructureCounts?.economy }}
                            </h5>
                        </div>
                        <div class="col hidden-scroll text-center me-1">
                            <h5 title="Industrial infrastructure">
                                <i class="fas fa-tools pe-2" id="industryIcon"></i>{{
                                    playerInfrastructureCounts?.industry }}

                            </h5>
                        </div>
                        <div class="col hidden-scroll text-center">
                            <h5 title="Scientific infrastructure">
                                <i class="fas fa-flask pe-2" id="scienceIcon"></i>{{
                                    playerInfrastructureCounts?.science }}
                            </h5>
                        </div>
                    </div>
                </div>
                <div class="row pt-2">
                    <div class="col col-flex align-center">
                        <i class="fas fa-dollar-sign me-1" id="creditsIcon"></i>
                        <p>Credits:</p>
                        <input id="credits" class="form-control hidden-number small-input ms-1 me-3" type="number"
                            min="0" step="1" required="true" v-model="playerData.credits" />
                    </div>
                    <div class="col col-flex align-center">
                        <i class="fas fa-coins me-1" id="specTokensIcon"></i>
                        <p>Tokens:</p>
                        <input id="specialistTokens" class="form-control hidden-number small-input ms-1" type="number"
                            min="0" step="1" required="true" v-model="playerData.creditsSpecialists" />
                    </div>
                </div>
                <div class="row pt-2">
                    <div class="col col-flex align-center">
                        <i class="fas fa-house me-1"></i>
                        <p>Capital Star:</p>
                        <input id="homeStarId" class="form-control semi-small-input ms-1 me-1" type="text"
                            v-model="playerData.homeStarId" :placeholder="'Enter capital star ID here'"
                            ref="homeStarIdInputElement" />
                        <button type="button" class="btn btn-outline-primary btn-ssm" @click="toggleHomeStarSelectMode"
                            :class="{ active: inHomeStarSelectMode }"><i class="fas fa-hand-pointer"></i></button>
                    </div>
                </div>
                <div class="row pt-2 pb-2">
                    <div class="col col-flex">
                        <h4>Technology</h4>
                    </div>
                </div>
                <div class="row table-responsive">
                    <table class="table table-sm table-top-border lh-30">
                        <tbody>
                            <tr>
                                <td>
                                    <i class="fas fa-binoculars"></i>
                                </td>
                                <td>
                                    Scanning
                                </td>
                                <td class="text-end">
                                    <span class="pre-textbox-span">Level</span>
                                    <input id="scanning" class="form-control hidden-number small-input table-input"
                                        type="number" min="1" step="1" required="true"
                                        v-model="playerData.technologies.scanning" />
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <i class="fas fa-gas-pump"></i>
                                </td>
                                <td>Hyperspace Range</td>
                                <td class="text-end">
                                    <span class="pre-textbox-span">Level</span>
                                    <input id="hyperspace" class="form-control hidden-number small-input table-input"
                                        type="number" min="1" step="1" required="true"
                                        v-model="playerData.technologies.hyperspace" />
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <i class="fas fa-globe-europe"></i>
                                </td>
                                <td>Terraforming</td>
                                <td class="text-end">
                                    <span class="pre-textbox-span">Level</span>
                                    <input id="terraforming" class="form-control hidden-number small-input table-input"
                                        type="number" min="1" step="1" required="true"
                                        v-model="playerData.technologies.terraforming" />
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <i class="fas fa-microscope"></i>
                                </td>
                                <td>Experimentation</td>
                                <td class="text-end">
                                    <span class="pre-textbox-span">Level</span>
                                    <input id="experimentation"
                                        class="form-control hidden-number small-input table-input" type="number" min="0"
                                        step="1" required="true" v-model="playerData.technologies.experimentation" />
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <i class="fas fa-gun"></i>
                                </td>
                                <td>Weapons</td>
                                <td class="text-end">
                                    <span class="pre-textbox-span">Level</span>
                                    <input id="weapons" class="form-control hidden-number small-input table-input"
                                        type="number" min="1" step="1" required="true"
                                        v-model="playerData.technologies.weapons" />
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <i class="fas fa-money-bill-alt"></i>
                                </td>
                                <td>Banking</td>
                                <td class="text-end">
                                    <span class="pre-textbox-span">Level</span>
                                    <input id="banking" class="form-control hidden-number small-input table-input"
                                        type="number" min="0" step="1" required="true"
                                        v-model="playerData.technologies.banking" />
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <i class="fas fa-industry"></i>
                                </td>
                                <td>Manufacturing</td>
                                <td class="text-end">
                                    <span class="pre-textbox-span">Level</span>
                                    <input id="manufacturing" class="form-control hidden-number small-input table-input"
                                        type="number" min="1" step="1" required="true"
                                        v-model="playerData.technologies.manufacturing" />
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <i class="fas fa-user-astronaut"></i>
                                </td>
                                <td>Specialists</td>
                                <td class="text-end">
                                    <span class="pre-textbox-span">Level</span>
                                    <input id="specialists" class="form-control hidden-number small-input table-input"
                                        type="number" min="0" step="1" required="true"
                                        v-model="playerData.technologies.specialists" />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="bg-dark-custom row pt-2 pb-2" id="bottomRow">
                    <div class="col col-flex col-auto">
                        <button type="button" class="btn btn-sm btn-danger" @click="deletePlayer()"><i
                                class="fas fa-trash"></i>
                            Delete Player</button>
                    </div>
                    <div class="col col-flex"></div>
                    <div class="col col-flex ms-1 text-end col-auto">
                        <button type="submit" class="btn btn-sm btn-success"><i class="fas fa-check"></i>
                            Update Player</button>
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
        <change-field-menu :object-type="'Player'" :object-property-name="'ID'" :return-to-previous-on-update="true"
            :starting-value="playerData.id" :errors="changeIdErrors" v-if="editingId" v-on:returnToMenu="onReturnToMenu"
            v-on:updateField="(field: string | undefined, value: string) => onUpdateId(value)" />
        <change-field-menu :object-type="'Player'" :object-property-name="'Alias'" :return-to-previous-on-update="true"
            :starting-value="playerData.alias" :errors="changeAliasErrors" v-if="editingAlias"
            v-on:returnToMenu="onReturnToMenu"
            v-on:updateField="(field: string | undefined, value: string | null) => onUpdateAlias(value)" />
        <confirmation-modal modalName="deletePlayerModal" titleText="Delete Player" cancelText="No" confirmText="Yes"
            @onConfirm="confirmDeletion">
            <p>{{ modalText }}</p>
        </confirmation-modal>
    </div>
</template>

<script lang="ts">
import helper from '@/scripts/helper';
import MenuTitle from '../MenuTitle.vue';
import ChangeFieldMenu from '../ChangeFieldMenu.vue';
import ConfirmationModal from '@/components/modal/ConfirmationModal.vue';
import type { Player } from '@/scripts/types/Player';
import { useGalaxyStore } from '@/stores/galaxy';
import storage from '@/scripts/storage';
import { Modal } from 'bootstrap';
import editor from '@/scripts/editor';
import PlayerShapeIcon from '../icons/PlayerShapeIcon.vue';
import type { PlayerShape } from '@/scripts/types/Player';
import { useMenuStateStore } from '@/stores/menuState';
import type { Star } from '@/scripts/types/Star';

export default {
    components: {
        'menu-title': MenuTitle,
        'change-field-menu': ChangeFieldMenu,
        'confirmation-modal': ConfirmationModal,
        'player-shape-icon': PlayerShapeIcon
    },
    props: {
        playerId: String
    },
    data() {
        return {
            playerData: {
                id: this.playerId,
                homeStarId: null,
                colour: { value: 'null' },
                shape: 'circle',
                credits: NaN,
                creditsSpecialists: NaN,
                technologies: {
                    scanning: NaN,
                    hyperspace: NaN,
                    terraforming: NaN,
                    experimentation: NaN,
                    weapons: NaN,
                    banking: NaN,
                    manufacturing: NaN,
                    specialists: NaN
                }
            } as Player,
            editingId: false,
            editingAlias: false,
            deletePlayerModal: null as any,
            modalText: undefined as string | undefined,
            changeIdErrors: [] as string[],
            changeAliasErrors: [] as string[],
            errors: [] as string[],
            inHomeStarSelectMode: false,
            allowEditingId: storage.getSettings().technical.allowChangeId === 'enabled'
        }
    },
    methods: {
        onReturnToMenu() {
            this.editingId = false;
            this.editingAlias = false;
            for (const e in this.changeIdErrors) { // Actually updates prop of ChangeFieldMenu
                this.changeIdErrors.pop();
            }
            for (const e in this.changeAliasErrors) {
                this.changeAliasErrors.pop();
            }
        },
        onUpdateId(value: string) {
            for (const e in this.changeIdErrors) { // Actually updates prop of ChangeFieldMenu
                this.changeIdErrors.pop();
            }
            if (useGalaxyStore().checkIfIdIsDuplicate('player', value) && value !== this.playerData.id) {
                this.changeIdErrors.push(`A player with the ID '${value}' already exists.`);
                return;
            }
            if (value == null || value === '') {
                this.changeIdErrors.push(`A player cannot have an empty ID.`);
                return;
            }
            useGalaxyStore().changeId('player', this.playerData.id, value);
            this.playerData.id = value;

            this.$toast.default(`Changed player ID to ${this.playerData.id}.`);
        },
        onUpdateAlias(value: string | null | undefined) {
            for (const e in this.changeAliasErrors) {
                this.changeAliasErrors.pop();
            }
            if (value == null) value = undefined;

            useGalaxyStore().updatePlayerProperty(this.playerData, 'alias', value);
            this.playerData.alias = value;

            if (value) {
                this.$toast.default(`Changed player alias to ${this.playerData.alias}.`);
            } else {
                this.$toast.default(`Cleared player alias.`);
            }
        },
        toggleHomeStarSelectMode() {
            if (this.inHomeStarSelectMode) {
                this.inHomeStarSelectMode = false;
                useGalaxyStore().clearClickCallbacks();
                return;
            }
            this.inHomeStarSelectMode = true;
            const ref = this.$refs.homeStarIdInputElement;
            useGalaxyStore().setClickCallback({
                ref,
                callbacks: {
                    star: (star: Star) => {
                        this.playerData.homeStarId = star.id;
                        useGalaxyStore().clearClickCallbacks();
                        this.inHomeStarSelectMode = false;
                    }
                }
            });
        },
        updatePlayer() {
            if (!this.validatePlayer()) return;

            const playerCarriers = helper.getPlayerCarriers(this.playerData.id);
            const playerStars = helper.getPlayerStars(this.playerData.id);

            if (this.player == null) throw new Error(`Updating non-existent player (id: ${this.playerId})!`);
            const oldCapitalStar = this.galaxy.stars.find(s => s.id === this.player!.homeStarId);
            const newCapitalStar = this.galaxy.stars.find(s => s.id === this.playerData.homeStarId);

            if (oldCapitalStar != null) {
                if (newCapitalStar == null || oldCapitalStar.id !== newCapitalStar.id) {
                    oldCapitalStar.homeStar = false;
                    editor.reloadStar(oldCapitalStar);
                }
            }
            if (newCapitalStar != null) {
                const previousPlayer = this.galaxy.players.find(p => p.homeStarId === newCapitalStar.id);
                if (previousPlayer != null) previousPlayer.homeStarId = null;

                newCapitalStar.homeStar = true;
                editor.reloadStar(newCapitalStar);
            }

            useGalaxyStore().updatePlayer(this.playerData);

            for (const carrier of playerCarriers) {
                editor.reloadCarrier(carrier);
            }

            for (const star of playerStars) {
                editor.reloadStar(star);
            }

            useMenuStateStore().setMenuState('none');

            this.$toast.default(`Player ${this.playerData.id} updated.`);
        },
        deletePlayer(force: boolean = false) {
            const playerCarriers = helper.getPlayerCarriers(this.playerData.id);
            const playerStars = helper.getPlayerStars(this.playerData.id);

            if (!force && storage.getSettings().confirmations.confirmDeletePlayer !== 'disabled') {
                if (this.deletePlayerModal == null) {
                    this.deletePlayerModal = new Modal(document.getElementById('deletePlayerModal')!);
                }

                if (playerCarriers.length !== 0) {
                    if (playerStars.length !== 0) {
                        this.modalText = `Are you sure you want to delete player ${this.playerData.id}? ${playerCarriers.length} ${playerCarriers.length > 1 ? 'carriers' : 'carrier'} will be deleted and ${playerStars.length} ${playerStars.length > 1 ? 'stars' : 'star'} will be affected.`;
                    } else this.modalText = `Are you sure you want to delete player ${this.playerData.id}? ${playerCarriers.length} ${playerCarriers.length > 1 ? 'carriers' : 'carrier'} will be deleted as well.`;
                    this.deletePlayerModal.show();
                    return;
                } else if (storage.getSettings().confirmations.confirmDeleteStar === 'always') {
                    if (playerStars.length !== 0) {
                        this.modalText = `Are you sure you want to delete player ${this.playerData.id}? ${playerStars.length} ${playerStars.length > 1 ? 'stars' : 'star'} will be affected.`;
                    } else this.modalText = `Are you sure you want to delete player ${this.playerData.id}?`;
                    this.deletePlayerModal.show();
                    return;
                }
            }

            const capitalStar = this.galaxy.stars.find(s => s.id === this.playerData.homeStarId);
            if (capitalStar != null) {
                capitalStar.homeStar = false;
                editor.reloadStar(capitalStar);
            }

            if (this.galaxy.teams != null && this.galaxy.teams.length !== 0) {
                useGalaxyStore().removePlayerFromTeams(this.playerData.id);
            }

            for (const carrier of playerCarriers) {
                useGalaxyStore().removeCarrier(carrier.id);
                editor.deleteCarrier(carrier);
            }

            for (const star of playerStars) {
                star.playerId = null;
                star.shipsActual = 0;
                star.ships = 0;
                editor.reloadStar(star);
            }

            useGalaxyStore().removePlayer(this.playerData.id);

            useMenuStateStore().setMenuState('none');

            this.$toast.default(`Player ${this.playerData.id} deleted.`);
        },
        confirmDeletion() {
            this.deletePlayer(true);
        },
        changePlayerShape(forward: boolean) {
            const shapes: PlayerShape[] = ['circle', 'square', 'diamond', 'hexagon'];
            const currentIndex = shapes.indexOf(this.playerData.shape);
            const newIndex = forward ? (currentIndex + 1 + shapes.length) % shapes.length : (currentIndex - 1 + shapes.length) % shapes.length;
            this.playerData.shape = shapes[newIndex];
        },
        validatePlayer() {
            if (this.errors.length !== 0) this.errors.length = 0;

            if ((this.playerData.homeStarId as any) === '') this.playerData.homeStarId = null;
            if (this.playerData.homeStarId != null) {
                if (this.galaxy.stars.find(s => s.id === this.playerData.homeStarId) == null) {
                    this.errors.push(`Invalid capital star ID.`);
                }
            }

            if (!(/^#([0-9A-F]{3}){1,2}$/i.test(this.playerData.colour.value))) {
                this.errors.push(`Player colour must be a valid HEX code in RGB format.`);
            }

            if (this.errors.length !== 0) return false;
            return true;
        }
    },
    mounted() {
        this.playerData = JSON.parse(JSON.stringify(this.player));
    },
    beforeUnmount() {
        useGalaxyStore().clearClickCallbacks();
    },
    computed: {
        galaxy: function () {
            return useGalaxyStore().$state.galaxy;
        },
        player: function () {
            if (this.playerId == null) return;
            return helper.getPlayerById(this.playerId);
        },
        title: function () {
            if (this.player == null) return;
            if (this.player.alias) return;
            return `Player ${this.player.id}`;
        },
        playerStarCount: function () {
            if (this.playerId == null) return;
            return helper.getPlayerStarCount(this.playerId);
        },
        playerCarrierCount: function () {
            if (this.playerId == null) return;
            return helper.getPlayerCarrierCount(this.playerId);
        },
        playerSpecialistCount: function () {
            if (this.playerId == null) return;
            return helper.getPlayerSpecialistCount(this.playerId);
        },
        playerShipCount: function () {
            if (this.playerId == null) return;
            return helper.getPlayerShipCount(this.playerId);
        },
        playerInfrastructureCounts: function () {
            if (this.playerId == null) return;
            return helper.getPlayerInfrastructureCounts(this.playerId);
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
    margin-top: 0 !important;
    margin-bottom: 0 !important;
}

.table-left-border {
    border-left-width: 2px;
    border-left-style: solid;
    border-left-color: currentColor;
}

.table-top-border {
    border-top-width: 2px;
    border-top-style: solid;
    border-top-color: currentColor;
}

th,
td {
    color: rgba(255, 255, 255, .75) !important;
    text-overflow: ellipsis !important;
    white-space: nowrap;
    overflow-x: hidden;
    font-weight: 300;
    padding-right: 0px !important;
    padding-top: 0px !important;
    padding-bottom: 0px !important;
}

tr {
    border-color: inherit;
    border-style: solid;
    border-width: 0;
}

tr+td {
    width: auto;
}

.table:not(caption) {
    background-color: var(--bs-table-bg);
    border-bottom-width: 1px;
    box-shadow: inset 0 0 0 9999px var(--bs-table-accent-bg);
}

.table>*>:last-child>td {
    border-bottom-width: 0 !important;
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

.text-right {
    text-align: right;
}

span {
    padding: 0px;
}

#creditsIcon,
#specTokensIcon,
#economyIcon {
    color: rgba(60, 210, 165) !important;
}

#industryIcon {
    color: rgba(255, 159, 12) !important;
}

#scienceIcon {
    color: rgba(48, 190, 255) !important;
}

.large-text {
    font-size: 20px;
}

h5 {
    margin: 0 !important;
    padding: 0 !important;
    white-space: nowrap;
}

.hidden-scroll {
    overflow-x: scroll;
    overflow-y: hidden;
    scrollbar-width: none;
    -ms-overflow-style: none;
}

.top-border {
    border-top: 1px solid currentColor;
}

.height-auto {
    height: calc(100%/3);
    align-content: center;
}

.player-shape-col {
    align-content: center;
}

.pad-right-3 {
    margin-right: 4px;
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

.table-input {
    display: inline-block !important;
    width: 25% !important;
}

.table.lh-30 {
    line-height: 29px;
}

.error-text {
    font-size: 14px;
    font-weight: 400;
}

ul {
    margin: 0;
}

#credits,
#specialistTokens,
#homeStarId {
    width: 50% !important;
}

.align-center {
    align-content: center;
    justify-content: center;
}
</style>