<template>
    <div id="menu-container">
        <topbar-menu />
        <sidebar-menu />

        <user-settings v-if="menuState === 'settings'" class="menu menu-bg" />
        <ruler-menu v-if="menuState === 'ruler'" class="menu menu-bg" />
        <json-menu v-if="menuState === 'json'" class="menu menu-bg" />
        <star-detail v-if="menuState === 'star'" class="menu menu-bg" :starId="menuArguments[0].id"
            :key="menuArguments[0]" ref="starDetailRef" />
        <carrier-detail v-if="menuState === 'carrier'" class="menu menu-bg" :carrierId="menuArguments[0].id"
            :key="menuArguments[0]" ref="carrierDetailRef" />
        <player-detail v-if="menuState === 'player'" class="menu menu-bg" :playerId="menuArguments[0].id"
            :key="menuArguments[0]" />
        <select-object v-if="menuState === 'selectObject'" class="menu menu-bg" :map-objects="menuArguments" />
        <player-list v-if="menuState === 'playerList'" class="menu menu-bg" />
        <brush-menu v-if="menuState === 'brush'" class="menu menu-bg" />
        <randomise-menu v-if="menuState === 'randomise'" class="menu menu-bg" />
        <select-menu v-if="menuState === 'select'" ref="selectRef" class="menu menu-bg" />
        <transform-menu v-if="menuState === 'transform'" class="menu menu-bg" />
        <footer-menu />
    </div>
</template>

<script lang="ts">
import SidebarMenu from './SidebarMenu.vue';
import TopbarMenu from './TopbarMenu.vue';
import FooterMenu from './FooterMenu.vue';
import { useMenuStateStore } from '@/stores/menuState';
import { storeToRefs } from 'pinia';
import UserSettings from './UserSettings.vue';
import RulerMenu from './ruler/RulerMenu.vue';
import JSONMenu from './json/JSONMenu.vue';
import editor from '@/scripts/editor';
import StarDetail from './mapObjects/StarDetail.vue';
import CarrierDetail from './mapObjects/CarrierDetail.vue';
import SelectObject from './mapObjects/SelectObject.vue';
import PlayerList from './players/PlayerList.vue';
import { useGalaxyStore } from '@/stores/galaxy';
import PlayerDetail from './players/PlayerDetail.vue';
import BrushMenu from './brush/BrushMenu.vue';
import RandomiseMenu from './randomise/RandomiseMenu.vue';
import SelectMenu from './select/SelectMenu.vue';
import TransformMenu from './transform/TransformMenu.vue';

export default {
    components: {
        'sidebar-menu': SidebarMenu,
        'topbar-menu': TopbarMenu,
        'footer-menu': FooterMenu,
        'user-settings': UserSettings,
        'ruler-menu': RulerMenu,
        'json-menu': JSONMenu,
        'star-detail': StarDetail,
        'carrier-detail': CarrierDetail,
        'select-object': SelectObject,
        'player-list': PlayerList,
        'player-detail': PlayerDetail,
        'brush-menu': BrushMenu,
        'randomise-menu': RandomiseMenu,
        'select-menu': SelectMenu,
        'transform-menu': TransformMenu
    },
    data() {
        return {
            menuState: storeToRefs(useMenuStateStore()).menuState,
            menuArguments: storeToRefs(useMenuStateStore()).args,
            galaxyIsReady: storeToRefs(useGalaxyStore()).galaxyIsReady
        }
    },
    mounted() {
        document.addEventListener('keydown', this.handleKeyDown);
        document.addEventListener('keyup', this.handleKeyUp);
    },
    unmounted() {

    },
    methods: {
        handleKeyDown(e: KeyboardEvent) {
            const tagName = (e.target as HTMLInputElement).tagName;
            if (tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'BUTTON' || tagName === 'SELECT') {
                return;
            }

            const key = e.key;

            if (e.altKey || e.shiftKey || e.ctrlKey || e.metaKey) {
                if (key === 'Shift') {
                    if (this.menuState === 'brush') editor.map!.setModeArg(2, 'radius_only');
                } else if (key === 'Control') {
                    if (this.menuState === 'brush') editor.map!.setModeArg(2, 'radius_and_angle');
                }
                return;
            }

            switch (key) {
                case 'Escape':
                    useMenuStateStore().setMenuState('none');
                    break;
                case 'x':
                    useMenuStateStore().toggleMenuState('settings');
                    break;
                case 'p':
                    useMenuStateStore().toggleMenuState('playerList');
                    break;
                case 'v':
                    useMenuStateStore().toggleMenuState('ruler');
                    break;
                case 's':
                    useMenuStateStore().toggleMenuState('select');
                    break;
                case 'b':
                    useMenuStateStore().toggleMenuState('brush');
                    break;
                case 't':
                    useMenuStateStore().toggleMenuState('transform');
                    break;
                case 'r':
                    useMenuStateStore().toggleMenuState('randomise');
                    break;
                case 'j':
                    useMenuStateStore().toggleMenuState('json');
                    break;
                case 'ArrowLeft':
                    if (this.menuState === 'ruler' && this.galaxyIsReady) editor.map!.removeLastRulerPoint();
                    break;
                case 'Delete':
                    if (this.menuState === 'star') (this.$refs['starDetailRef'] as typeof StarDetail).deleteStar();
                    if (this.menuState === 'carrier') (this.$refs['carrierDetailRef'] as typeof CarrierDetail).deleteCarrier();
                    if (this.menuState === 'select') (this.$refs['selectRef'] as typeof SelectMenu).deleteSelected();
                    break;
                case '.':
                    if (this.menuState === 'select') (this.$refs['selectRef'] as typeof SelectMenu).togglePaused();
                    break;
            }

        },
        handleKeyUp(e: KeyboardEvent) {
            const tagName = (e.target as HTMLInputElement).tagName;
            if (tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'BUTTON' || tagName === 'SELECT') {
                return;
            }

            const key = e.key;

            switch (key) {
                case 'Shift':
                    if (this.menuState === 'brush') editor.map!.setModeArg(2, 'off');
                    break;
                case 'Control':
                    if (this.menuState === 'brush') editor.map!.setModeArg(2, 'off');
                    break;
            }
        }
    }
}
</script>

<style scoped>
#menu-container {
    overflow: visible;
}

.menu-bg {
    background-color: rgba(29, 40, 53, .98);
}

.menu {
    position: absolute;
    left: 50px;
    top: 45px;
    width: 473px;
    max-height: calc(100% - 45px);
    overflow: auto;
    overflow-x: hidden;
    scrollbar-width: none;
    padding-left: 6px;
    padding-right: 6px;
    padding-top: 6px;
    border: solid 1px;
    border-color: #121921;
    font-family: Chakra Petch, sans-serif;
    color: rgba(255, 255, 255, 0.75);
}

.footer-menu {
    display: flex;
    position: fixed;
    bottom: 0;
    left: 0;
}

::-webkit-scrollbar {
    width: 0px;
    background: transparent;
}

@media(max-width: 473px) {
    .menu {
        width: 100%;
    }
}

@media(max-width: 768px) {
    .menu {
        left: 0px;
        max-height: calc(100% - 45px - 56px);
        /* Account for height of footer bar */
    }
}

.menu-page {
    opacity: 1;
    animation-name: fadeInAnimation;
    animation-duration: .3s;
    background-color: #1d2835fa;
    font-size: 14px;
    font-weight: 300;
}

@keyframes fadeInAnimation {
    0% {
        opacity: 0;
    }

    100% {
        opacity: 1;
    }
}
</style>