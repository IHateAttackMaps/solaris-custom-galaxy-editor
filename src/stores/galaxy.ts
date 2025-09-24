import { defineStore } from "pinia";
import type { Galaxy } from "@/scripts/types/Galaxy";
import type { Player } from "@/scripts/types/Player";
import type { Star } from "@/scripts/types/Star";
import type { Carrier } from "@/scripts/types/Carrier";
import type { Team } from "@/scripts/types/Team";

export const useGalaxyStore = defineStore({
    id: 'galaxy',
    state: () => ({
        galaxy: {
            players: [],
            stars: [],
            carriers: [],
            teams: []
        } as Galaxy,
        isSplitNaturalResources: false,
        galaxyIsReady: false,
        clickCallbacks: null as any,
        clickReceivingElement: null as any,
        lowestValidNewStarId: 1,
        lowestValidNewCarrierId: 1,
        lowestValidNewPlayerId: 1,
        lowestValidNewTeamId: 1
    }),
    getters: {
        getGalaxy: (state) => state.galaxy
    },
    actions: {
        setGalaxy(galaxy: Galaxy) {
            this.$state.galaxy = galaxy;
        },
        setPlayers(players: Array<Player>) {
            this.$state.galaxy.players = players;
        },
        setStars(stars: Array<Star>) {
            this.$state.galaxy.stars = stars;
        },
        setCarriers(carriers: Array<Carrier>) {
            this.$state.galaxy.carriers = carriers;
        },
        setTeams(teams: Array<Team>) {
            this.$state.galaxy.teams = teams;
        },
        addPlayer(player: Player) {
            this.$state.galaxy.players.push(player);
        },
        addStar(star: Star) {
            this.$state.galaxy.stars.push(star);
        },
        addCarrier(carrier: Carrier) {
            this.$state.galaxy.carriers.push(carrier);
        },
        addTeam(team: Team) {
            if (!this.$state.galaxy.teams) this.$state.galaxy.teams = [];
            this.$state.galaxy.teams.push(team);
        },
        removePlayer(playerId: string) {
            const index = this.$state.galaxy.players.findIndex(p => p.id === playerId);
            if (index > -1) {
                this.$state.galaxy.players.splice(index, 1);
            }
        },
        removeStar(starId: string) {
            const index = this.$state.galaxy.stars.findIndex(s => s.id === starId);
            if (index > -1) {
                this.$state.galaxy.stars.splice(index, 1);
            }
        },
        removeCarrier(carrierId: string) {
            const index = this.$state.galaxy.carriers.findIndex(c => c.id === carrierId);
            if (index > -1) {
                this.$state.galaxy.carriers.splice(index, 1);
            }
        },
        removeTeam(teamId: string) {
            const index = this.$state.galaxy.teams?.findIndex(t => t.id === teamId);
            if (index == null) return;
            if (index > -1) {
                this.$state.galaxy.teams?.splice(index, 1);
            }
        },
        updatePlayer(player: Player) {
            const index = this.$state.galaxy.players.findIndex(p => p.id === player.id);
            if (index > -1) {
                this.$state.galaxy.players[index] = player;
            }
        },
        updateStar(star: Star) {
            const index = this.$state.galaxy.stars.findIndex(s => s.id === star.id);
            if (index > -1) {
                this.$state.galaxy.stars[index] = star;
            }
        },
        updateCarrier(carrier: Carrier) {
            const index = this.$state.galaxy.carriers.findIndex(c => c.id === carrier.id);
            if (index > -1) {
                this.$state.galaxy.carriers[index] = carrier;
            }
        },
        updateTeam(team: Team) {
            if (!this.$state.galaxy.teams) {
                console.log('Attempted to update a Team while galaxy.teams is undefined');
                return;
            };
            const index = this.$state.galaxy.teams.findIndex(t => t.id === team.id);
            if (index > -1) {
                this.$state.galaxy.teams[index] = team;
            }
        },
        changeId(type: 'player' | 'star' | 'carrier' | 'team', oldId: string, newId: string) {
            switch (type) {
                case 'player':
                    const player = this.$state.galaxy.players.find(p => p.id === oldId);
                    if (!player) return false;
                    if (!this.$state.galaxy.players.find(p => p.id === newId)) {
                        player.id = newId;

                        // Update mapObjects & teams
                        this.$state.galaxy.stars.filter(s => s.playerId === oldId).forEach(s => s.playerId = newId);
                        this.$state.galaxy.carriers.filter(c => c.playerId === oldId).forEach(c => c.playerId = newId);
                        this.$state.galaxy.teams?.forEach(t => t.players.filter(p => p === oldId).forEach(p => p = newId));

                        return true;
                    }
                    return false;
                case 'star':
                    const star = this.$state.galaxy.stars.find(s => s.id === oldId);
                    if (!star) return false;
                    if (!this.$state.galaxy.stars.find(s => s.id === newId)) {
                        star.id = newId;

                        // Update mapObjects & players
                        this.$state.galaxy.stars.filter(s => s.wormHoleToStarId === oldId).forEach(s => s.wormHoleToStarId = newId);
                        for (const carrier of this.$state.galaxy.carriers) {
                            if (carrier.orbiting === oldId) carrier.orbiting = newId;
                            for (const waypoint of carrier.waypoints) {
                                if (waypoint.source === oldId) waypoint.source = newId;
                                if (waypoint.destination === oldId) waypoint.destination = newId;
                            }
                        }
                        this.$state.galaxy.players.filter(p => p.homeStarId === oldId).forEach(p => p.homeStarId = newId);

                        return true;
                    }
                    return false;
                case 'carrier':
                    const carrier = this.$state.galaxy.carriers.find(c => c.id === oldId);
                    if (!carrier) return false;
                    if (!this.$state.galaxy.carriers.find(c => c.id === newId)) {
                        carrier.id = newId;
                        return true;
                    }
                    return false;
                case 'team':
                    const team = this.$state.galaxy.teams?.find(t => t.id === oldId);
                    if (!team) return false;
                    if (!this.$state.galaxy.teams?.find(t => t.id === newId)) {
                        team.id = newId;
                        return true;
                    }
            }
        },
        checkIfIdIsDuplicate(type: 'player' | 'star' | 'carrier' | 'team', id: string) {
            switch (type) {
                case 'player':
                    if (this.$state.galaxy.players.find(p => p.id === id)) return true;
                    return false;
                case 'star':
                    if (this.$state.galaxy.stars.find(s => s.id === id)) return true;
                    return false;
                case 'carrier':
                    if (this.$state.galaxy.carriers.find(c => c.id === id)) return true;
                    return false;
                case 'team':
                    if (this.$state.galaxy.teams?.find(t => t.id === id)) return true;
                    return false;
            }
        },
        updateStarProperty(star: Star, property: string, value: any) {
            const index = this.$state.galaxy.stars.findIndex(s => s.id === star.id);
            if (index > -1) {
                (this.$state.galaxy.stars[index] as any)[property] = value;
            }
        },
        updateCarrierProperty(carrier: Carrier, property: string, value: any) {
            const index = this.$state.galaxy.carriers.findIndex(c => c.id === carrier.id);
            if (index > -1) {
                (this.$state.galaxy.carriers[index] as any)[property] = value;
            }
        },
        updatePlayerProperty(player: Player, property: string, value: any) {
            const index = this.$state.galaxy.players.findIndex(p => p.id === player.id);
            if (index > -1) {
                (this.$state.galaxy.players[index] as any)[property] = value;
            }
        },
        addPlayerToTeam(playerId: string, teamId: string) {
            this.$state.galaxy.teams?.find(t => t.id === teamId)?.players.push(playerId);
        },
        removePlayerFromTeam(playerId: string, teamId: string) {
            const playerIds = this.$state.galaxy.teams?.find(t => t.id === teamId)?.players;
            playerIds?.splice(playerIds.indexOf(playerId), 1);
        },
        removePlayerFromTeams(playerId: string) {
            if (this.$state.galaxy.teams == null) return;
            for (const team of this.$state.galaxy.teams) {
                if (team.players.includes(playerId)) team.players.splice(team.players.indexOf(playerId), 1);
            }
        },
        setIsSplitNaturalResources(isSplitNaturalResources: boolean) {
            this.$state.isSplitNaturalResources = isSplitNaturalResources;
        },
        setGalaxyIsReady(galaxyIsReady: boolean) {
            this.$state.galaxyIsReady = galaxyIsReady;
        },
        updateLowestValidStarId() {
            const numericalIds = this.$state.galaxy.stars.filter((s) => !Number.isNaN(Number(s.id))).map((s) => Number.parseInt(s.id)).sort((a, b) => a - b);
            if (numericalIds.length === 0) {
                this.$state.lowestValidNewStarId = 1;
                return;
            }
            this.$state.lowestValidNewStarId = numericalIds[numericalIds.length - 1] + 1;
        },
        updateLowestValidCarrierId() {
            const numericalIds = this.$state.galaxy.carriers.filter((c) => !Number.isNaN(Number(c.id))).map((c) => Number.parseInt(c.id)).sort((a, b) => a - b);
            if (numericalIds.length === 0) {
                this.$state.lowestValidNewCarrierId = 1;
                return;
            }
            this.$state.lowestValidNewCarrierId = numericalIds[numericalIds.length - 1] + 1;
        },
        updateLowestValidPlayerId() {
            const numericalIds = this.$state.galaxy.players.filter((p) => !Number.isNaN(Number(p.id))).map((p) => Number.parseInt(p.id)).sort((a, b) => a - b);
            if (numericalIds.length === 0) {
                this.$state.lowestValidNewPlayerId = 1;
                return;
            }
            this.$state.lowestValidNewPlayerId = numericalIds[numericalIds.length - 1] + 1;
        },
        updateLowestValidTeamId() {
            const numericalIds = this.$state.galaxy.teams?.filter((t) => !Number.isNaN(Number(t.id))).map((t) => Number.parseInt(t.id)).sort((a, b) => a - b);
            if (!numericalIds || numericalIds.length === 0) {
                this.$state.lowestValidNewTeamId = 1;
                return;
            }
            this.$state.lowestValidNewTeamId = numericalIds[numericalIds.length - 1] + 1;
        },
        getLowestValidStarId() {
            this.updateLowestValidStarId();
            return this.$state.lowestValidNewStarId;
        },
        getLowestValidCarrierId() {
            this.updateLowestValidCarrierId();
            return this.$state.lowestValidNewCarrierId;
        },
        getLowestValidPlayerId() {
            this.updateLowestValidPlayerId();
            return this.$state.lowestValidNewPlayerId;
        },
        getLowestValidTeamId() {
            this.updateLowestValidTeamId();
            return this.$state.lowestValidNewTeamId;
        },
        setClickCallback(data: any) {
            this.$state.clickReceivingElement = data.element;
            this.$state.clickCallbacks = data.callbacks;
        },
        clearClickCallbacks() {
            this.$state.clickReceivingElement = null;
            this.$state.clickCallbacks = null;
        },
        starClicked(data: any) {
            if (this.$state.clickCallbacks && this.$state.clickCallbacks.star) {
                this.$state.clickCallbacks.star(data.star);
            } else {
                data.permitCallback(data.star);
            }
        }
    }
});