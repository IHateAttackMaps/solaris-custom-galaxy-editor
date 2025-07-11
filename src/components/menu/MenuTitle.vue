<template>
    <div class="row">
        <div class="col">
            <h4>{{ title }}</h4>
        </div>
        <div class="col-auto">
            <slot></slot>
            <button @click="close" class="btn btn-danger btn-sm"><i class="fas fa-times"></i></button>
        </div>
    </div>
</template>

<script lang="ts">
import { useMenuStateStore } from '@/stores/menuState';

export default {
    props: {
        title: String
    },
    methods: {
        close() {
            useMenuStateStore().setMenuState('none');
        }
    }
}
</script>

<style scoped>
h4 {
    position: absolute;
    bottom: 0;
    color: white;
    font-family: Chakra Petch, sans-serif;
    font-weight: 600;
    font-size: 22px;
    margin: 0;
    width: 100%;
    text-wrap: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.btn {
    display: inline-block;
    font-weight: 400;
    line-height: 1.5;
    border: 1px solid transparent;
    user-select: none;
    text-align: center;
    vertical-align: middle;
    right: 0;
}

.row {
    --bs-gutter-x: 0px;
    --bs-gutter-y: 0px;
    width: 100%;
    max-width: 100%;
    padding-bottom: 6px;
}

.btn-sm {
    --bs-btn-padding-y: 0.25rem;
    --bs-btn-padding-x: 0.5rem;
    --bs-btn-font-size: 0.875rem;
    --bs-btn-border-radius: 2px;
}

.col {
    position: relative;
    padding: 0;
}

.col-auto {
    padding: 0;
}
</style>