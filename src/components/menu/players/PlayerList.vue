<template>
    <div class="menu-page">
        <div class="fade-in" v-show="!editingId && !editingName">
            <menu-title :title="'Players'" />

            <div class="bg-dark-custom pt-2 pb-2">
                <div class="row">
                    <div class="col col-auto me-1">
                        <p>Sort by:</p>
                    </div>
                    <div class="col">
                        <select class="form-control small-select" v-model="sortMode">
                            <option value="id">ID</option>
                            <option value="conquest">Stars</option>
                            <option value="capitalConquest">Capitals</option>
                            <option value="kingOfTheHill">King Of The Hill</option>
                        </select>
                    </div>
                    <div class="col col-1"></div>
                    <div class="col col-auto text-end ms-1 me-1">
                        <p>Show:</p>
                    </div>
                    <div class="col">
                        <select class="form-control small-select" v-model="displayData">
                            <option value="stars">Stars</option>
                            <option value="capitals">Capitals</option>
                            <option value="ships">Ships</option>
                            <option value="carriers">Carriers</option>
                        </select>
                    </div>
                </div>
            </div>
            <div class="row pt-1 pb-1" v-if="!isTeamGame">
                <div class="col pe-1">
                    <button type="button" class="btn btn-outline-success btn-wide" @click="createPlayer()"><i
                            class="fas fa-plus"></i>
                        Add Player</button>
                </div>
                <div class="col col-auto">
                    <button type="button" class="btn btn-outline-primary btn-wide" @click="createTeam()"><i
                            class="fas fa-plus"></i>
                        Add Team</button>
                </div>
            </div>
            <div class="row pt-1 pb-1" v-if="isTeamGame">
                <div class="col pe-1">
                    <button type="button" class="btn btn-outline-success btn-wide" @click="createTeam()"><i
                            class="fas fa-plus"></i>
                        Add Team</button>
                </div>
                <div class="col col-auto">
                    <button type="button" class="btn btn-outline-primary btn-wide" @click="toggleTransferring()"
                        :class="{ active: transferringPlayers }"><i class="fas fa-arrow-right-arrow-left"></i>
                        Transfer Players</button>
                </div>
            </div>

            <div v-if="!isTeamGame" class="row">
                <div class="table-responsive">
                    <table class="table table-striped">
                        <tbody>
                            <tr v-for="player in sortedPlayers" :key="player.id">
                                <td width="10%" @click="openPlayerDetail(player.id)">
                                    <player-shape-icon :colour="player.colour.value" :shape="player.shape" />
                                </td>
                                <td width="50%">
                                    <span>
                                        <a href="javascript:;" @click.prevent="openPlayerDetail(player.id)">{{
                                            player.alias ? player.alias : player.id
                                            }}</a>
                                    </span>
                                </td>
                                <td width="30%" class="text-end">
                                    <span v-if="displayData === 'stars'">
                                        {{ getPlayerStarCount(player) }} Stars
                                    </span>
                                    <span v-if="displayData === 'capitals'">
                                        {{ getPlayerCapitalCount(player) }} Capitals
                                    </span>
                                    <span v-if="displayData === 'ships'">
                                        {{ getPlayerShipCount(player) }} Ships
                                    </span>
                                    <span v-if="displayData === 'carriers'">
                                        {{ getPlayerCarrierCount(player) }} Carriers
                                    </span>
                                </td>
                                <td width="10%">
                                    <button type="button" class="btn btn-danger btn-sm btn-wide"
                                        @click="deletePlayer(player)">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div v-if="isTeamGame" class="row pb-3" v-for="team in sortedTeams" :key="team.team.id">
                <div class="team-header-row wide-bg pt-1 pb-1">
                    <div class="col col-flex" id="teamNameCol">
                        <h4 class="h-main me-2" :class="{ 'text-warning': colourCustomNames && team.team.name }">
                            {{ team.team.name ? team.team.name : `Team ${team.team.id}` }}
                        </h4>
                        <button type="button" class="btn btn-sm btn-outline-success" @click="editTeamName(team.team)">
                            <i class="fas fa-pencil-alt"></i>
                        </button>
                        <button type="button" class="btn btn-sm btn-outline-warning ms-1"
                            @click="editTeamId(team.team)" v-if="allowEditingId">
                            <i class="fas fa-hashtag"></i>
                        </button>
                    </div>
                    <div class="col col-auto auto-margin text-end">
                        <h4 v-if="displayData === 'stars'">{{ team.totalStars }} Stars</h4>
                        <h4 v-if="displayData === 'capitals'">{{ team.totalHomeStars }} Capitals</h4>
                        <h4 v-if="displayData === 'ships'">{{ team.totalShips }} Ships</h4>
                        <h4 v-if="displayData === 'carriers'">{{ team.totalCarriers }} Carriers</h4>
                    </div>
                    <div class="col col-auto col-flex">
                        <button type="button" class="btn btn-sm btn-danger ms-2" @click="deleteTeam(team.team)"
                            v-if="!transferringPlayers">
                            <i class="fas fa-trash"></i>
                        </button>
                        <button type="button" title="Transfer to this team" class="btn btn-sm btn-outline-success ms-2"
                            @click="transferPlayers(team.team)" v-if="transferringPlayers"
                            :class="{ disabled: transferSelection.size === 0 }">
                            <i class="fas fa-crosshairs"></i>
                        </button>
                    </div>
                </div>
                <button type="button" class="btn btn-outline-primary" @click="createPlayer(team.team.id)"
                    v-if="!transferringPlayers"><i class="fas fa-plus"></i>
                    Add Player</button>
                <div class="table-responsive pt-1">
                    <table class="table table-striped">
                        <tbody>
                            <tr v-for="player in team.players" :key="player.id">
                                <td width="10%" @click="openPlayerDetail(player.id)">
                                    <player-shape-icon :colour="player.colour.value" :shape="player.shape" />
                                </td>
                                <td width="50%">
                                    <span>
                                        <a href="javascript:;" @click.prevent="openPlayerDetail(player.id)">{{
                                            player.alias ? player.alias : player.id
                                            }}</a>
                                    </span>
                                </td>
                                <td width="30%" class="text-end">
                                    <span v-if="displayData === 'stars'">
                                        {{ getPlayerStarCount(player) }} Stars
                                    </span>
                                    <span v-if="displayData === 'capitals'">
                                        {{ getPlayerCapitalCount(player) }} Capitals
                                    </span>
                                    <span v-if="displayData === 'ships'">
                                        {{ getPlayerShipCount(player) }} Ships
                                    </span>
                                    <span v-if="displayData === 'carriers'">
                                        {{ getPlayerCarrierCount(player) }} Carriers
                                    </span>
                                </td>
                                <td width="10%">
                                    <button type="button" class="btn btn-danger btn-sm btn-wide"
                                        @click="deletePlayer(player)" v-if="!transferringPlayers">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                    <button type="button" class="btn btn-outline-primary btn-sm"
                                        :class="{ active: transferSelection.has(player.id) }"
                                        id="selectForTransferButton" @click="toggleSelected(player.id, team.team.id)"
                                        v-if="transferringPlayers">
                                        <i class="fa-regular fa-circle" v-if="!transferSelection.has(player.id)"></i>
                                        <i class="fa-regular fa-circle-dot" v-if="transferSelection.has(player.id)"></i>
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        <change-field-menu :object-type="'Team'" :object-property-name="'ID'" :return-to-previous-on-update="true"
            :starting-value="selectedTeam!.id" :errors="changeIdErrors" v-if="editingId"
            v-on:returnToMenu="onReturnToMenu"
            v-on:updateField="(field: string | undefined, value: string) => onUpdateTeamId(value)" />
        <change-field-menu :object-type="'Team'" :object-property-name="'Name'" :return-to-previous-on-update="true"
            :starting-value="selectedTeam!.name" :errors="changeNameErrors" v-if="editingName"
            v-on:returnToMenu="onReturnToMenu"
            v-on:updateField="(field: string | undefined, value: string | null) => onUpdateTeamName(value)" />
        <confirmation-modal modalName="deletePlayerModal" titleText="Delete Player" cancelText="No" confirmText="Yes"
            @onConfirm="confirmPlayerDeletion" @onCancel="selectedPlayer = null" @onDismiss="selectedPlayer = null">
            <p>{{ modalText }}</p>
        </confirmation-modal>
        <confirmation-modal modalName="deleteTeamModal" titleText="Delete Team" cancelText="No" confirmText="Yes"
            @onConfirm="confirmTeamDeletion" @onCancel="selectedTeam = null" @onDismiss="selectedTeam = null">
            <p>{{ modalText }}</p>
        </confirmation-modal>
        <confirmation-modal modalName="transferPlayersModal" titleText="Transfer Players" cancelText="No"
            confirmText="Yes" @onConfirm="confirmTransferPlayers" @onCancel="selectedTeam = null"
            @onDismiss="selectedTeam = null">
            <p>{{ modalText }}</p>
        </confirmation-modal>
    </div>
</template>

<script lang="ts">
import helper from '@/scripts/helper';
import MenuTitle from '../MenuTitle.vue';
import { useGalaxyStore } from '@/stores/galaxy';
import PlayerShapeIcon from '../icons/PlayerShapeIcon.vue';
import type { Player } from '@/scripts/types/Player';
import type { Team } from '@/scripts/types/Team';
import ChangeFieldMenu from '../ChangeFieldMenu.vue';
import storage from '@/scripts/storage';
import ConfirmationModal from '@/components/modal/ConfirmationModal.vue';
import { Modal } from 'bootstrap';
import editor from '@/scripts/editor';
import { useMenuStateStore } from '@/stores/menuState';

export default {
    components: {
        'menu-title': MenuTitle,
        'player-shape-icon': PlayerShapeIcon,
        'change-field-menu': ChangeFieldMenu,
        'confirmation-modal': ConfirmationModal
    },
    data() {
        return {
            sortMode: 'conquest',
            displayData: 'stars',
            editingId: false,
            editingName: false,
            selectedTeam: null as Team | null,
            selectedPlayer: null as Player | null,
            changeIdErrors: [] as string[],
            changeNameErrors: [] as string[],
            deletePlayerModal: null as Modal | null,
            deleteTeamModal: null as Modal | null,
            transferPlayersModal: null as Modal | null,
            modalText: undefined as string | undefined, // Can be reused for all modals
            transferringPlayers: false,
            transferSelection: new Map<string, string>(),
            colourCustomNames: storage.getSettings().visual.colourCustomNames === 'enabled',
            allowEditingId: storage.getSettings().technical.allowChangeId === 'enabled'
        }
    },
    methods: {
        getPlayerStarCount(player: Player) {
            return helper.getPlayerStarCount(player.id);
        },
        getPlayerCapitalCount(player: Player) {
            return helper.getPlayerCapitalCount(player.id);
        },
        getPlayerShipCount(player: Player) {
            return helper.getPlayerShipCount(player.id);
        },
        getPlayerCarrierCount(player: Player) {
            return helper.getPlayerCarrierCount(player.id);
        },
        calculateTeamBackgroundColour(teamPlayers: Player[]) {
            let r = 0;
            let g = 0;
            let b = 0;
            for (const player of teamPlayers) {
                const playerColour = player.colour.value.slice(1, 7);
                r += parseInt(playerColour.slice(0, 2), 16);
                g += parseInt(playerColour.slice(2, 4), 16);
                b += parseInt(playerColour.slice(4, 6), 16);
            }
            r = Math.floor(r / teamPlayers.length);
            g = Math.floor(g / teamPlayers.length);
            b = Math.floor(b / teamPlayers.length);

            let sr = r.toString(16);
            let sg = g.toString(16);
            let sb = b.toString(16);

            if (sr.length === 1) sr = "0" + sr;
            if (sg.length === 1) sg = "0" + sg;
            if (sb.length === 1) sb = "0" + sb;

            return `#${sr}${sg}${sb}`;
        },
        createPlayer(teamId?: string) {
            let combo = helper.getRandomUnusedCombos(1)[0];
            if (combo == null) {
                combo = {
                    shape: 'circle',
                    colour: {
                        alias: 'Custom',
                        value: '#ffffff'
                    }
                };
            }

            const newPlayer = helper.generateNewPlayer();
            newPlayer.id = `${useGalaxyStore().getLowestValidPlayerId()}`;
            newPlayer.colour = combo.colour;
            newPlayer.shape = combo.shape;

            useGalaxyStore().addPlayer(newPlayer);

            if (teamId != null) {
                useGalaxyStore().addPlayerToTeam(newPlayer.id, teamId);
            }

            this.$toast.default(`Created player ${newPlayer.id}.`);
        },
        createTeam() {
            const newTeam = {
                id: `${useGalaxyStore().getLowestValidTeamId()}`,
                players: []
            } as Team

            // If this is the first team, move all players to it
            if (this.galaxy.teams == null || this.galaxy.teams?.length === 0) {
                newTeam.players = this.galaxy.players.map(p => p.id);
            }

            useGalaxyStore().addTeam(newTeam);

            this.$toast.default(`Created team ${newTeam.id}.`);
        },
        editTeamId(team: Team) {
            this.selectedTeam = team;
            this.editingId = true;
        },
        editTeamName(team: Team) {
            this.selectedTeam = team;
            this.editingName = true;
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
            this.selectedTeam = null;
        },
        onUpdateTeamId(value: string) {
            for (const e in this.changeIdErrors) { // Actually updates prop of ChangeFieldMenu
                this.changeIdErrors.pop();
            }
            if (useGalaxyStore().checkIfIdIsDuplicate('team', value) && value !== this.selectedTeam!.id) {
                if (this.changeIdErrors == null || this.changeIdErrors.length === 0) this.changeIdErrors.push(`A team with the ID ${value} already exists.`);
                return;
            }
            if (value == null || value === '') {
                this.changeIdErrors.push(`A team cannot have an empty ID.`);
                return;
            }
            useGalaxyStore().changeId('team', this.selectedTeam!.id, value);
            this.selectedTeam!.id = value;

            this.$toast.default(`Changed team ID to ${this.selectedTeam!.id}.`);

            this.selectedTeam = null;
        },
        onUpdateTeamName(value: string | null | undefined) {
            for (const e in this.changeNameErrors) {
                this.changeNameErrors.pop();
            }
            if (value == null) value = undefined;

            this.selectedTeam!.name = value;
            useGalaxyStore().updateTeam(this.selectedTeam!);

            if (value) {
                this.$toast.default(`Changed team name to ${this.selectedTeam!.name}.`);
            } else {
                this.$toast.default(`Cleared team name.`);
            }

            this.selectedTeam = null;
        },
        deletePlayer(player: Player, force: boolean = false) {
            this.selectedPlayer = player;

            const playerCarriers = helper.getPlayerCarriers(player.id);
            const playerStars = helper.getPlayerStars(player.id);

            if (!force && storage.getSettings().confirmations.confirmDeletePlayer !== 'disabled') {
                if (this.deletePlayerModal == null) {
                    this.deletePlayerModal = new Modal(document.getElementById('deletePlayerModal')!);
                };

                if (playerCarriers.length !== 0) {
                    if (playerStars.length !== 0) {
                        this.modalText = `Are you sure you want to delete player ${player.id}? ${playerCarriers.length} ${playerCarriers.length > 1 ? 'carriers' : 'carrier'} will be deleted and ${playerStars.length} ${playerStars.length > 1 ? 'stars' : 'star'} will be affected.`;
                    } else this.modalText = `Are you sure you want to delete player ${player.id}? ${playerCarriers.length} ${playerCarriers.length > 1 ? 'carriers' : 'carrier'} will be deleted as well.`;
                    this.deletePlayerModal.show();
                    return;
                } else if (storage.getSettings().confirmations.confirmDeleteStar === 'always') {
                    if (playerStars.length !== 0) {
                        this.modalText = `Are you sure you want to delete player ${player.id}? ${playerStars.length} ${playerStars.length > 1 ? 'stars' : 'star'} will be affected.`;
                    } else this.modalText = `Are you sure you want to delete player ${player.id}?`;
                    this.deletePlayerModal.show();
                    return;
                }
            }

            const capitalStar = this.galaxy.stars.find(s => s.id === player.homeStarId);
            if (capitalStar != null) {
                capitalStar.homeStar = false;
                editor.reloadStar(capitalStar);
            }

            if (this.galaxy.teams != null && this.galaxy.teams.length !== 0) {
                useGalaxyStore().removePlayerFromTeams(player.id);
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

            useGalaxyStore().removePlayer(player.id);

            this.$toast.default(`Player ${player.id} deleted.`);

            this.selectedPlayer = null;
        },
        confirmPlayerDeletion() {
            this.deletePlayer(this.selectedPlayer!, true);
        },
        deleteTeam(team: Team, force: boolean = false) {
            this.selectedTeam = team;

            if (!force && storage.getSettings().confirmations.confirmDeleteTeam === 'enabled') {
                if (this.deleteTeamModal == null) {
                    this.deleteTeamModal = new Modal(document.getElementById('deleteTeamModal')!);
                }

                this.modalText = `Are you sure you want to delete team ${team.id}?`;
                this.deleteTeamModal.show();
                return;
            }

            if (this.galaxy.teams == null) throw new Error(`Attempted to delete a non-existent team (teams is null)!`);

            useGalaxyStore().removeTeam(team.id);

            if (this.galaxy.teams.length > 0) { // If there are any teams left, transfer all players from this team to the first team
                for (const playerId of team.players) {
                    this.transferPlayer(playerId, team.id, this.galaxy.teams[0].id);
                }
            } else {
                this.galaxy.teams = undefined;
            }

            this.$toast.default(`Team ${team.id} deleted.`);

            this.selectedTeam = null;
        },
        confirmTeamDeletion() {
            this.deleteTeam(this.selectedTeam!, true);
        },
        toggleSelected(playerId: string, currentTeamId: string) {
            if (!this.transferSelection.has(playerId)) {
                this.transferSelection.set(playerId, currentTeamId);
            } else {
                this.transferSelection.delete(playerId);
            }
        },
        transferPlayer(playerId: string, sourceTeamId: string, destinationTeamId: string) {
            useGalaxyStore().removePlayerFromTeam(playerId, sourceTeamId);
            useGalaxyStore().addPlayerToTeam(playerId, destinationTeamId);
        },
        toggleTransferring() {
            if (!this.transferringPlayers) {
                this.transferringPlayers = true;
            } else {
                this.transferringPlayers = false;
                this.transferSelection.clear();
            }
        },
        transferPlayers(newTeam: Team, force: boolean = false) {
            this.selectedTeam = newTeam;

            if (!force && storage.getSettings().confirmations.confirmTransferPlayers === 'enabled') {
                if (this.transferPlayersModal == null) {
                    this.transferPlayersModal = new Modal(document.getElementById('transferPlayersModal')!);
                }

                this.modalText = `Are you sure you want to transfer ${this.transferSelection.size} ${this.transferSelection.size > 1 ? 'players' : 'player'} to team ${newTeam.id}?`;
                this.transferPlayersModal.show();
                return;
            }

            this.transferSelection.forEach((k, v) => {
                this.transferPlayer(v, k, newTeam.id);
            });

            this.transferringPlayers = false;
            this.transferSelection.clear();

            this.$toast.default(`Transfered players to team ${newTeam.id}.`);

            this.selectedTeam = null;
        },
        confirmTransferPlayers() {
            this.transferPlayers(this.selectedTeam!, true);
        },
        openPlayerDetail(playerId: string) {
            const player = helper.getPlayerById(playerId);
            if (player == null) throw new Error(`Attempted to open menu of non-existent player (id ${playerId})!`);
            useMenuStateStore().setMenu('player', [player]);
        }
    },
    computed: {
        galaxy: function () {
            return useGalaxyStore().$state.galaxy;
        },
        isTeamGame: function () {
            return this.galaxy.teams != null && this.galaxy.teams.length !== 0;
        },
        sortedPlayers: function () {
            return helper.getSortedLeaderboardPlayerList(this.galaxy.players, this.sortMode);
        },
        sortedTeams: function () {
            return helper.getSortedLeaderboardTeamList(this.sortMode);
        }
    }
}
</script>

<style scoped>
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
    margin-top: 0 !important;
    margin-bottom: 0 !important;
}

.table-responsive {
    min-width: calc(100% + 12px);
    margin-left: -6px !important;
    padding: 0;
}

th,
td {
    color: rgba(255, 255, 255, .75) !important;
    text-overflow: ellipsis !important;
    white-space: nowrap;
    overflow-x: hidden;
    font-weight: 300;
    padding-left: 6px;
    padding-right: 6px;
}

tr {
    border-color: inherit;
    border-style: solid;
    border-width: 0;
    height: 30px;
    line-height: 30px;
}

tr+td {
    width: auto;
}

p {
    margin: 0;
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

.wide-bg {
    --bs-gutter-x: 0px;
    --bs-gutter-y: 0px;
    margin-left: -6px !important;
    padding-left: 6px !important;
    padding-right: 6px !important;
    min-width: calc(100% + 12px);
}

.small-select {
    font-size: 14px !important;
    padding-top: 0 !important;
    padding-bottom: 0 !important;
    padding-left: 0.25rem !important;
}

h4 {
    font-family: Chakra Petch, sans-serif;
    font-size: 16px;
    font-weight: 300;
    margin: 0;
    width: 100%;
    text-wrap: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 30px;
}

.h-main {
    font-size: 20px;
    font-weight: 600;
    width: auto;
}

.row {
    margin: 0;
}

.col {
    padding: 0;
    text-wrap: nowrap;
}

.col-flex {
    display: flex;
}

.auto-margin {
    margin: auto;
}

.team-header-row {
    flex-wrap: wrap;
    display: flex;
    overflow-x: scroll;
    scrollbar-width: none;
    -ms-overflow-style: none;
    padding: 0;
}

.table-striped>tbody>tr:nth-of-type(odd)>* {
    --bs-table-accent-bg: var(--bs-table-striped-bg);
    color: var(--bs-table-striped-color) !important;
}

.btn-outline-success {
    display: inline-block;
    font-weight: 400;
    line-height: 1;
    text-align: center;
    text-decoration: none;
    vertical-align: middle;
    cursor: pointer;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    font-size: 14px;
    border-radius: 4px;
}

.btn-outline-primary {
    display: inline-block;
    font-weight: 400;
    line-height: 1;
    text-align: center;
    text-decoration: none;
    vertical-align: middle;
    cursor: pointer;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    font-size: 14px;
    border-radius: 4px;
}

.btn-sm {
    --bs-btn-padding-y: 0.25rem;
    --bs-btn-padding-x: 0.5rem;
    --bs-btn-font-size: 0.875rem;
}

.btn-wide {
    width: 100%;
}

#selectForTransferButton {
    line-height: 1.5;
    width: 100%;
}

#teamNameCol {
    max-width: 100%;
}
</style>