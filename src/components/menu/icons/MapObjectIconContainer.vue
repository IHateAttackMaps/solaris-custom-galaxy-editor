<template>
    <div class="container">
        <div class="pe-1">
            <player-shape-icon :colour="colour" :shape="shape" />
        </div>
        <div class="icon">
            <slot></slot>
        </div>
    </div>
</template>

<script lang="ts">
import PlayerShapeIcon from './PlayerShapeIcon.vue';

export default {
    components: {
        'player-shape-icon': PlayerShapeIcon
    },
    props: {
        colour: String,
        shape: String,
    },
    mounted() {

    },
    methods: {

    },
    computed: {
        source: function () {
            return new URL(`../../../assets/map-objects/256x256_${this.shape}.svg`, import.meta.url).href;
        }
    }
}
</script>

<style scoped>
.container {
    margin: 0;
    padding: 0;
    align-items: center;
    display: flex;
    justify-content: center;
}

.icon {
    justify-content: center;
    display: flex;
}
</style>