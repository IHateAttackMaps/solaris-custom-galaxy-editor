<template>
    <div class="row pt-2 pb-2">
        <div class="col">
            <h5>{{ title }}</h5>
        </div>
        <div class="col col-auto">
            <h5 @click="toggle">
                <i class="fas fa-chevron-up" v-if="!isCollapsed"></i>
                <i class="fas fa-chevron-down" v-if="isCollapsed"></i>
            </h5>
        </div>
    </div>
    <div v-if="!isCollapsed">
        <slot></slot>
    </div>
</template>

<script lang="ts">

export default {
    props: {
        title: String,
        startsExpanded: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            isCollapsed: true
        }
    },
    mounted() {
        this.isCollapsed = !this.startsExpanded;
    },
    methods: {
        toggle() {
            this.isCollapsed = !this.isCollapsed;
        }
    }
}
</script>

<style scoped>
h5 {
    font-weight: 600;
    font-size: 18px;
    color: white;
    margin: 0;
}
</style>