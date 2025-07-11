<template>
    <a @click="toggleMenu()" :title="tooltip" :class="{ 'active': isActive }">
        <i :class="iconClass"></i>
    </a>
</template>

<script lang="ts">
import type { MenuState } from '@/scripts/types/MenuStates';
import { useMenuStateStore } from '@/stores/menuState';

export default {
    data() {
        return {
            store: useMenuStateStore()
        }
    },
    props: {
        menuState: String,
        tooltip: String,
        iconClass: String
    },
    methods: {
        toggleMenu() {
            useMenuStateStore().toggleMenuState(this.menuState as MenuState);
        }
    },
    computed: {
        isActive() {
            return this.menuState === useMenuStateStore().$state.menuState;
        }
    }
}
</script>

<style scoped>
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

a.active {
    background-color: #375a7f;
}

a.active:hover {
    color: white !important;
}
</style>