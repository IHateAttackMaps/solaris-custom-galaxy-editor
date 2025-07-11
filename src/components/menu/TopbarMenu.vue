<template>
    <div class="topbar-menu container-fluid menu-bg">
        <div class="topbar-menu-left">
            <div class="topbar-item text-center ps-2 pe-2">
                <span title="Players / Teams" v-if="teams !== 0">
                    <i class="fas fa-users"></i>
                    {{ galaxyData.players.length }}/{{ teams }}
                </span>
                <span title="Players / Teams" v-if="teams === 0">
                    <i class="fas fa-users"></i>
                    {{ galaxyData.players.length }}
                </span>
            </div>
            <div class="topbar-item text-center ps-2 pe-2">
                <span title="Stars">
                    <i class="fas fa-star"></i>
                    {{ galaxyData.stars.length }}
                </span>
            </div>
            <div class="topbar-item text-center ps-2 pe-2">
                <span title="Carriers">
                    <i class="fas fa-rocket"></i>
                    {{ galaxyData.carriers.length }}
                </span>
            </div>
        </div>
        <div class="topbar-menu-right">
            <div class="topbar-item text-center ps-2 pe-2" title="Toggle Split Natural Resources">
                <i class="fas fa-globe me-1"></i>
                <select class="form-control" id="NRSelect" :value="isSplitNR" @change="toggleSplitNR()">
                    <option value="false">Single</option>
                    <option value="true">Split</option>
                </select>
            </div>
            <hamburger-menu class="topbar-item hamburger-menu" :buttonClass="'small-hamburger-button'"
                :dropType="'dropdown'" />
        </div>
    </div>
</template>

<script lang="ts">
import { type MenuState } from '@/scripts/types/MenuStates';
import HamburgerMenu from './HamburgerMenu.vue';
import { useMenuStateStore } from '@/stores/menuState';
import { useGalaxyStore } from '@/stores/galaxy';
import { storeToRefs } from 'pinia';
import storage from '@/scripts/storage';
import editor from '@/scripts/editor';

export default {
    components: {
        'hamburger-menu': HamburgerMenu
    },
    data() {
        return {
            galaxyData: storeToRefs(useGalaxyStore()).galaxy,
            isSplitNR: storeToRefs(useGalaxyStore()).isSplitNaturalResources
        }
    },
    methods: {
        setMenu(state: MenuState) {
            useMenuStateStore().setMenu(state, []);
        },
        toggleSplitNR() {
            // this.isSplitNR is current value
            if (this.isSplitNR) {
                useGalaxyStore().setIsSplitNaturalResources(false);
                for (const star of this.galaxyData.stars) {
                    const economy = star.naturalResources.economy;
                    const industry = star.naturalResources.industry;
                    const science = star.naturalResources.science;
                    const newNR = Math.round((economy + industry + science) / 3);

                    star.naturalResources = { economy: newNR, industry: newNR, science: newNR };

                    if (this.naturalResourceDisplayMode === 'numbers') {
                        editor.reloadStar(star);
                    }
                }

                if (useMenuStateStore().$state.menuState === 'star') this.setMenu('none');
            } else {
                useGalaxyStore().setIsSplitNaturalResources(true);
                for (const star of this.galaxyData.stars) {
                    if (this.naturalResourceDisplayMode === 'numbers') {
                        editor.reloadStar(star);
                    }
                }

            }
        }
    },
    computed: {
        teams: function () {
            return this.galaxyData.teams?.length == null ? 0 : this.galaxyData.teams.length;
        },
        naturalResourceDisplayMode: function () {
            return storage.getSettings().visual.resources;
        }
    }
}
</script>

<style scoped>
.topbar-menu {
    display: flex;
    box-sizing: border-box;
    position: absolute;
    top: 0;
    left: 0;
    height: 45px;
    width: 100%;
    align-items: center;
    --bs-gutter-x: 0;
    font-family: Chakra Petch, sans-serif;
    color: rgba(255, 255, 255, 0.75);
    font-size: 16px;
}

.topbar-item {
    display: flex;
    align-items: center;
    justify-items: center;
}

#NRSelect {
    padding-left: 0.5rem !important;
    padding-right: 0.5rem !important;
    padding-top: 0.1rem !important;
    padding-bottom: 0.1rem !important;
}

.row {
    max-width: 100%;
    padding-right: calc(var(--bs-gutter-x) * .5);
    padding-left: calc(var(--bs-gutter-x) * .5);
    margin-top: var(--bs-gutter-y);
}

.topbar-menu-left,
.topbar-menu-right {
    height: 45px;
    display: flex;
}

.topbar-menu-right {
    position: absolute;
    right: 0;
}

p {
    margin-bottom: 0;
}

@media screen and (max-width: 768px) {
    .hamburger-menu {
        display: none;
    }
}
</style>