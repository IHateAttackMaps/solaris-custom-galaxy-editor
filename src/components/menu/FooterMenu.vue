<template>
    <div class="footer-menu container-fluid d-xs-block d-md-none menu-bg">
        <div class="col">
            <button class="btn" v-on:click="toggleMenu('select')">
                <i class="fas fa-arrow-pointer"></i>
            </button>
        </div>
        <div class="col">
            <button class="btn" v-on:click="toggleMenu('brush')">
                <i class="fas fa-paintbrush"></i>
            </button>
        </div>
        <div class="col">
            <button class="btn" v-on:click="toggleMenu('transform')">
                <i class="fas fa-arrows-spin"></i>
            </button>
        </div>
        <div class="col">
            <hamburger-menu :dropType="'dropup'" />
        </div>
    </div>
</template>

<script lang="ts">
import { type MenuState } from '@/scripts/types/MenuStates';
import HamburgerMenu from './HamburgerMenu.vue';
import { useMenuStateStore } from '@/stores/menuState';

export default {
    components: {
        'hamburger-menu': HamburgerMenu
    },
    methods: {
        toggleMenu(state: MenuState) {
            useMenuStateStore().toggleMenuState(state);
        }
    }
}
</script>

<style scoped>
.btn {
    display: inline-block;
    box-sizing: border-box;
    text-align: center;
    font-size: 20px;
    padding-top: 12px;
    padding-bottom: 12px;
    padding-left: 10px;
    padding-right: 10px;
    cursor: pointer;
    color: white !important;
    border-radius: 4px;
}

.col {
    display: inline-flex;
    flex-direction: row;
    text-align: center;
    flex-grow: 1;
    flex-shrink: 0;
    flex-basis: 0%;
    line-height: 1.5;
    justify-content: center;
}

.btn:hover {
    color: #375a7f !important;
}
</style>