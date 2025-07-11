<template>
    <span>
        <i class="fas" :class="'fa-' + defaultIcon" v-if="!hideDefaultIcon && !source"></i>

        <img :src="source" width="24" height="24" v-if="source" :title="specialist?.name">
    </span>
</template>

<script lang="ts">
export default {
    props: {
        type: String,
        defaultIcon: String,
        hideDefaultIcon: Boolean,
        specialist: Object
    },
    mounted() {

    },
    methods: {

    },
    computed: {
        source: function () {
            if (!this.specialist) return null;
            return new URL(`../../../assets/specialists/${this.specialist.key}.svg`, import.meta.url).href;
        }
    }
}
</script>

<style scoped>
i {
    width: 24px;
    height: 24px;
    font-size: 16px;
    text-align: center;
    align-content: center;
}
</style>