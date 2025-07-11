import { defineStore } from "pinia";
import { useGalaxyStore } from "./galaxy";
import storage from "@/scripts/storage";

export const useGalaxyMetadataStore = defineStore({
    id: 'galaxyMetadata',
    state: () => ({
        isSplitNaturalResources: false,
        starCount: 0,
        galaxyIsReady: false,
        baseCarrierSpeed: NaN,
        clickCallbacks: null as any,
        clickReceivingElement: null as any,
        lowestValidNewStarId: 1,
        lowestValidNewCarrierId: 1,
        lowestValidNewPlayerId: 1,
        lowestValidNewTeamId: 1
    }),
    getters: {
        getIsSplitNaturalResources: (state) => state.isSplitNaturalResources,
        getStarCount: (state) => state.starCount
    },
    actions: {
        setIsSplitNaturalResources(isSplitNaturalResources: boolean) {
            this.$state.isSplitNaturalResources = isSplitNaturalResources;
        },
        setStarCount(starCount: number) {
            this.$state.starCount = starCount;
        },
        addStars(amount: number) {
            this.$state.starCount += amount;
        },
        removeStars(amount: number) {
            this.$state.starCount -= amount;
        },
        incrementStarCount() {
            this.$state.starCount++;
        },
        decrementStarCount() {
            this.$state.starCount--;
        },
        setGalaxyIsReady(galaxyIsReady: boolean) {
            this.$state.galaxyIsReady = galaxyIsReady;
        },
        setBaseCarrierSpeed(baseCarrierSpeed: number) {
            this.$state.baseCarrierSpeed = baseCarrierSpeed;
        },
        updateLowestValidStarId() {
            const numericalIds = useGalaxyStore().$state.galaxy.stars.filter((s) => !Number.isNaN(Number(s.id))).map((s) => Number.parseInt(s.id)).sort((a, b) => a - b);
            if (numericalIds.length === 0) {
                this.$state.lowestValidNewStarId = 1;
            }
            this.$state.lowestValidNewStarId = numericalIds[numericalIds.length - 1];
        },
        updateLowestValidCarrierId() {
            const numericalIds = useGalaxyStore().$state.galaxy.carriers.filter((c) => !Number.isNaN(Number(c.id))).map((c) => Number.parseInt(c.id)).sort((a, b) => a - b);
            if (numericalIds.length === 0) {
                this.$state.lowestValidNewCarrierId = 1;
                return;
            }
            this.$state.lowestValidNewCarrierId = numericalIds[numericalIds.length - 1] + 1;
        },
        updateLowestValidPlayerId() {
            const numericalIds = useGalaxyStore().$state.galaxy.players.filter((p) => !Number.isNaN(Number(p.id))).map((p) => Number.parseInt(p.id)).sort((a, b) => a - b);
            this.$state.lowestValidNewPlayerId = numericalIds[numericalIds.length - 1];
            if (numericalIds.length === 0) {
                this.$state.lowestValidNewPlayerId = 1;
            }
        },
        updateLowestValidTeamId() {
            const numericalIds = useGalaxyStore().$state.galaxy.teams?.filter((t) => !Number.isNaN(Number(t.id))).map((t) => Number.parseInt(t.id)).sort((a, b) => a - b);
            if (!numericalIds) {
                this.$state.lowestValidNewTeamId = 1;
                return;
            }
            this.$state.lowestValidNewTeamId = numericalIds[numericalIds.length - 1];
        },
        getLowestValidCarrierId() {
            this.updateLowestValidCarrierId();
            return this.$state.lowestValidNewCarrierId;
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