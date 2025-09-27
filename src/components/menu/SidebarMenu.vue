<template>
    <div class="sidebar-menu d-none d-md-block menu-bg" id="sidebarMenu">
        <div class="sidebar-menu-top">
            <sidebar-menu-item :menu-state="'select'" tooltip="Select (S)" icon-class="fas fa-arrow-pointer" />
            <sidebar-menu-item :menu-state="'playerList'" tooltip="Players (P)" icon-class="fas fa-users" />
            <sidebar-menu-item :menu-state="'brush'" tooltip="Brush (B)" icon-class="fas fa-paintbrush" />
            <sidebar-menu-item :menu-state="'transform'" tooltip="Transform (T)" icon-class="fas fa-arrows-spin" />
            <sidebar-menu-item :menu-state="'randomise'" tooltip="Randomise (R)" icon-class="fas fa-dice" />
            <sidebar-menu-item :menu-state="'json'" tooltip="JSON (J)" icon-class="fas fa-file-lines" />
            <sidebar-menu-item :menu-state="'generate'" tooltip="Generate (G)" icon-class="fas fa-code" />
            <sidebar-menu-item :menu-state="'ruler'" tooltip="Ruler (V)" icon-class="fas fa-ruler" />
        </div>
        <div class="sidebar-menu-bottom">
            <sidebar-menu-item :menu-state="'settings'" tooltip="Settings (X)" icon-class="fas fa-gear" />
            <a title="How to Use" href="https://github.com/IHateAttackMaps/solaris-custom-galaxy-editor/wiki/How-To-Use"
                target="_blank">
                <i class="fa-regular fa-circle-question"></i>
            </a>
        </div>
    </div>
</template>

<script lang="ts">
import { type MenuState } from '@/scripts/types/MenuStates';
import SidebarMenuItem from './SidebarMenuItem.vue';
import { useMenuStateStore } from '@/stores/menuState';

export default {
    components: {
        'sidebar-menu-item': SidebarMenuItem
    },
    methods: {
        setMenu(state: MenuState, args: Array<unknown>) {
            useMenuStateStore().setMenu(state, args);
        }
    }
}
</script>

<style scoped>
.sidebar-menu {
    position: absolute;
    left: 0;
    top: 45px;
    height: calc(100% - 45px);
    box-sizing: border-box;
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    overflow: hidden;
}

.sidebar-menu-top,
.sidebar-menu-bottom {
    width: 50px;
}

.sidebar-menu-bottom {
    position: absolute;
    bottom: 0;
}

a {
    display: block;
    text-align: center;
    font-size: 20px;
    padding-top: 10px;
    padding-bottom: 10px;
    padding-left: 12px;
    padding-right: 12px;
    cursor: pointer;
    color: white !important;
}

a:hover {
    color: #375a7f !important;
}

@media screen and (max-height: 500px) {
    .sidebar-menu-bottom {
        display: none;
    }
}
</style>