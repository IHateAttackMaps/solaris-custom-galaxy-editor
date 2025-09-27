<template>
    <div class="dropdown-container dropdown" :class="dropType || 'dropup'">
        <button class="btn" :class="buttonClass" type="button" id="dropdownMenuButton" data-bs-toggle="dropdown"
            aria-haspopup="true" aria-expanded="false">
            <i class="fas fa-bars" id="dropdownMenuButtonImage"></i>
        </button>
        <div class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton">
            <a class="dropdown-item" v-on:click="setMenu('select')" title="Select (S)">
                <i class="fas fa-arrow-pointer ms-1"></i>
                Select
            </a>
            <a class="dropdown-item" v-on:click="setMenu('playerList')" title="Players (P)">
                <i class="fas fa-users"></i>
                Players
            </a>
            <a class="dropdown-item" v-on:click="setMenu('brush')" title="Brush (B)">
                <i class="fas fa-paintbrush"></i>
                Brush
            </a>
            <a class="dropdown-item" v-on:click="setMenu('transform')" title="Transform (T)">
                <i class="fas fa-arrows-spin"></i>
                Transform
            </a>
            <a class="dropdown-item" v-on:click="setMenu('randomise')" title="Randomise (R)">
                <i class="fas fa-dice"></i>
                Randomise
            </a>
            <a class="dropdown-item" v-on:click="setMenu('json')" title="JSON (J)">
                <i class="fas fa-file-lines"></i>
                JSON
            </a>
            <a class="dropdown-item" v-on:click="setMenu('generate')" title="Generate (G)">
                <i class="fas fa-code"></i>
                Generate
            </a>
            <a class="dropdown-item" v-on:click="setMenu('ruler')" title="Ruler (V)">
                <i class="fas fa-ruler"></i>
                Ruler
            </a>
            <a class="dropdown-item" v-on:click="setMenu('settings')" title="Settings (X)">
                <i class="fas fa-cog"></i>
                Settings
            </a>
            <a class="dropdown-item" title="How to Use"
                href="https://github.com/IHateAttackMaps/solaris-custom-galaxy-editor/wiki/How-To-Use" target="_blank">
                <i class="fa-regular fa-circle-question"></i>
                How to Use
            </a>
        </div>
    </div>
</template>

<script lang="ts">
import { type MenuState } from '@/scripts/types/MenuStates';
import { useMenuStateStore } from '@/stores/menuState';

export default {
    methods: {
        setMenu(state: MenuState) {
            useMenuStateStore().setMenu(state, []);
        }
    },
    props: {
        buttonClass: String,
        dropType: String
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
    color: white;
    border: 0;
    --bs-btn-active-color: #375a7f;
}

.btn:hover {
    color: #375a7f !important;
}

.dropdown-item {
    display: block;
    width: 100%;
    padding-top: 6px;
    padding-right: 20px;
    padding-bottom: 6px;
    padding-left: 20px;
    color: rgba(255, 255, 255, .5);
    cursor: pointer;
}

.small-hamburger-button {
    display: inline-block;
    box-sizing: border-box;
    text-align: center;
    font-size: 20px;
    padding-top: 5px !important;
    padding-bottom: 5px !important;
    padding-left: 10px !important;
    padding-right: 10px !important;
    cursor: pointer;
    color: white;
    border-radius: 4px;
}

a {
    letter-spacing: .046875rem;
    font-size: .875rem;
    font-weight: 400;
    font-family: "Chakra Petch", sans-serif;
    color: rgba(255, 255, 255, 0.75) !important;
}

i {
    margin-right: 5px;
}

#dropdownMenuButtonImage {
    margin: 0;
}

.dropdown,
.dropend,
.dropstart,
.dropup {
    position: relative
}

.dropdown-toggle {
    white-space: nowrap
}

.dropdown-toggle::after {
    display: inline-block;
    margin-left: .255em;
    vertical-align: .255em;
    content: "";
    border-top: .3em solid;
    border-right: .3em solid transparent;
    border-bottom: 0;
    border-left: .3em solid transparent
}

.dropdown-toggle:empty::after {
    margin-left: 0
}

.dropdown-menu {
    position: absolute;
    z-index: 1000;
    display: none;
    min-width: 10rem;
    padding: .5rem 0;
    margin: 0;
    font-size: .875rem;
    color: rgba(255, 255, 255, .75);
    text-align: left;
    list-style: none;
    background-color: rgba(29, 40, 53, .98);
    background-clip: padding-box;
    border: 1px solid rgba(255, 255, 255, .15);
    border-radius: 0;
}

.dropdown-menu[data-bs-popper] {
    top: 100%;
    left: 0;
    margin-top: .125rem;
}

.dropdown-menu-start {
    --bs-position: start;
}

.dropdown-menu-start[data-bs-popper] {
    right: auto;
    left: 0;
}

.dropdown-menu-end {
    --bs-position: end;
}

.dropdown-menu-end[data-bs-popper] {
    right: 0;
    left: auto;
}

@media (min-width:576px) {
    .dropdown-menu-sm-start {
        --bs-position: start;
    }

    .dropdown-menu-sm-start[data-bs-popper] {
        right: auto;
        left: 0;
    }

    .dropdown-menu-sm-end {
        --bs-position: end;
    }

    .dropdown-menu-sm-end[data-bs-popper] {
        right: 0;
        left: auto;
    }
}

@media (min-width:768px) {
    .dropdown-menu-md-start {
        --bs-position: start;
    }

    .dropdown-menu-md-start[data-bs-popper] {
        right: auto;
        left: 0;
    }

    .dropdown-menu-md-end {
        --bs-position: end;
    }

    .dropdown-menu-md-end[data-bs-popper] {
        right: 0;
        left: auto;
    }
}

@media (min-width:992px) {
    .dropdown-menu-lg-start {
        --bs-position: start;
    }

    .dropdown-menu-lg-start[data-bs-popper] {
        right: auto;
        left: 0;
    }

    .dropdown-menu-lg-end {
        --bs-position: end;
    }

    .dropdown-menu-lg-end[data-bs-popper] {
        right: 0;
        left: auto;
    }
}

@media (min-width:1200px) {
    .dropdown-menu-xl-start {
        --bs-position: start;
    }

    .dropdown-menu-xl-start[data-bs-popper] {
        right: auto;
        left: 0;
    }

    .dropdown-menu-xl-end {
        --bs-position: end;
    }

    .dropdown-menu-xl-end[data-bs-popper] {
        right: 0;
        left: auto;
    }
}

@media (min-width:1660px) {
    .dropdown-menu-xxl-start {
        --bs-position: start;
    }

    .dropdown-menu-xxl-start[data-bs-popper] {
        right: auto;
        left: 0;
    }

    .dropdown-menu-xxl-end {
        --bs-position: end;
    }

    .dropdown-menu-xxl-end[data-bs-popper] {
        right: 0;
        left: auto;
    }
}

@media (min-width:1900px) {
    .dropdown-menu-xxxl-start {
        --bs-position: start;
    }

    .dropdown-menu-xxxl-start[data-bs-popper] {
        right: auto;
        left: 0;
    }

    .dropdown-menu-xxxl-end {
        --bs-position: end;
    }

    .dropdown-menu-xxxl-end[data-bs-popper] {
        right: 0;
        left: auto;
    }
}

.dropup .dropdown-menu[data-bs-popper] {
    top: auto;
    bottom: 100%;
    margin-top: 0;
    margin-bottom: .125rem;
}

.dropup .dropdown-toggle::after {
    display: inline-block;
    margin-left: .255em;
    vertical-align: .255em;
    content: "";
    border-top: 0;
    border-right: .3em solid transparent;
    border-bottom: .3em solid;
    border-left: .3em solid transparent;
}

.dropup .dropdown-toggle:empty::after {
    margin-left: 0;
}

.dropend .dropdown-menu[data-bs-popper] {
    top: 0;
    right: auto;
    left: 100%;
    margin-top: 0;
    margin-left: .125rem;
}

.dropend .dropdown-toggle::after {
    display: inline-block;
    margin-left: .255em;
    vertical-align: .255em;
    content: "";
    border-top: .3em solid transparent;
    border-right: 0;
    border-bottom: .3em solid transparent;
    border-left: .3em solid;
}

.dropend .dropdown-toggle:empty::after {
    margin-left: 0;
}

.dropend .dropdown-toggle::after {
    vertical-align: 0;
}

.dropstart .dropdown-menu[data-bs-popper] {
    top: 0;
    right: 100%;
    left: auto;
    margin-top: 0;
    margin-right: .125rem;
}

.dropstart .dropdown-toggle::after {
    display: inline-block;
    margin-left: .255em;
    vertical-align: .255em;
    content: "";
}

.dropstart .dropdown-toggle::after {
    display: none;
}

.dropstart .dropdown-toggle::before {
    display: inline-block;
    margin-right: .255em;
    vertical-align: .255em;
    content: "";
    border-top: .3em solid transparent;
    border-right: .3em solid;
    border-bottom: .3em solid transparent;
}

.dropstart .dropdown-toggle:empty::after {
    margin-left: 0;
}

.dropstart .dropdown-toggle::before {
    vertical-align: 0;
}

.dropdown-divider {
    height: 0;
    margin: .5rem 0;
    overflow: hidden;
    border-top: 1px solid rgba(255, 255, 255, .15);
}

.dropdown-item {
    display: block;
    width: 100%;
    padding: 6px 20px;
    clear: both;
    font-weight: 400;
    color: rgba(255, 255, 255, .5);
    text-align: inherit;
    text-decoration: none;
    white-space: nowrap;
    background-color: transparent;
    border: 0;
}

.dropdown-item:focus,
.dropdown-item:hover {
    color: #fff;
    background-color: rgba(255, 255, 255, .15);
}

.dropdown-item.active,
.dropdown-item:active {
    color: var(--bs-theme-color);
    text-decoration: none;
    background-color: var(--bs-theme);
}

.dropdown-item.disabled,
.dropdown-item:disabled {
    color: #617a86;
    pointer-events: none;
    background-color: transparent;
}

.dropdown-menu.show {
    display: block;
}

.dropdown-header {
    display: block;
    padding: .5rem 20px;
    margin-bottom: 0;
    font-size: .8125rem;
    color: rgba(255, 255, 255, .5);
    white-space: nowrap;
}

.dropdown-item-text {
    display: block;
    padding: 6px 20px;
    color: rgba(255, 255, 255, .5);
}

.dropdown-menu-dark {
    color: #90a2aa;
    background-color: #35434a;
    border-color: rgba(255, 255, 255, .15);
}

.dropdown-menu-dark .dropdown-item {
    color: #90a2aa;
}

.dropdown-menu-dark .dropdown-item:focus,
.dropdown-menu-dark .dropdown-item:hover {
    color: #fff;
    background-color: rgba(255, 255, 255, .15);
}

.dropdown-menu-dark .dropdown-item.active,
.dropdown-menu-dark .dropdown-item:active {
    color: var(--bs-theme-color);
    background-color: var(--bs-theme);
}

.dropdown-menu-dark .dropdown-item.disabled,
.dropdown-menu-dark .dropdown-item:disabled {
    color: #617a86;
}

.dropdown-menu-dark .dropdown-divider {
    border-color: rgba(255, 255, 255, .15);
}

.dropdown-menu-dark .dropdown-item-text {
    color: #90a2aa;
}

.dropdown-menu-dark .dropdown-header {
    color: #617a86;
}
</style>