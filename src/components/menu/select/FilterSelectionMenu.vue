<template>
    <div class="fade-in">
        <menu-title :title="'Filter Selection'" />

        <form @submit.prevent="applyFilter()">
            <div class="row pt-2 pb-2 bg-dark-custom align-center">
                <div class="col col-auto me-1">
                    <p>Filter from:</p>
                </div>
                <div class="col col-auto">
                    <select class="form-control small-select" v-model="initialStars">
                        <option value="all">All Stars</option>
                        <option value="selected">Selected Stars</option>
                    </select>
                </div>
            </div>
            <div class="row pt-1 pb-1" v-if="!filter">
                <div class="col">
                    <button class="btn btn-outline-success btn-wide" type="button" @click="addCondition()">
                        <i class="fas fa-plus"></i>
                        Add Condition
                    </button>
                </div>
            </div>
            <div v-if="filter">
                <filter-component :filter-prop="filter" :invertedColor="false" :inverted-condition="false"
                    @deleteOperand="(o: Filter<Star>) => deleteCondition(o)" />
            </div>
            <div class="row mt-1 pb-2">
                <div class="col col-flex col-auto">
                    <button class="btn btn-sm btn-primary" type="button" @click="returnToSelection()">
                        <i class="fas fa-arrow-left"></i>
                        Back to Select
                    </button>
                </div>
                <div class="col col-flex"></div>
                <div class="col col-flex text-end col-auto">
                    <button class="btn btn-sm btn-success" type="submit">
                        <i class="fas fa-check"></i>
                        Apply Filter
                    </button>
                </div>
            </div>

            <div class="text-danger error-text pt-1 pb-2" v-if="errors != null && errors.length !== 0">
                <p>Please correct the following error(s):</p>
                <ul>
                    <li v-for="error in errors" :key="error">{{ error }}</li>
                </ul>
            </div>
        </form>
    </div>
</template>

<script lang="ts">
import { storeToRefs } from 'pinia';
import MenuTitle from '../MenuTitle.vue';
import { useMenuStateStore } from '@/stores/menuState';
import type { Star } from '@/scripts/types/Star';
import type { Condition, Filter } from '@/scripts/types/Filter';
import FilterComponent from './FilterComponent.vue';
import { useGalaxyStore } from '@/stores/galaxy';
import { evalFilter } from '@/scripts/util/filters';
import editor from '@/scripts/editor';

export default {
    components: {
        'menu-title': MenuTitle,
        'filter-component': FilterComponent
    },
    data() {
        return {
            selection: storeToRefs(useMenuStateStore()).selection.value,
            initialStars: 'selected' as 'all' | 'selected',
            filter: null as Filter<Star> | null,
            errors: [] as string[]
        }
    },
    methods: {
        returnToSelection() {
            this.$emit('returnToMenu');
        },
        addCondition() {
            if (!this.filter) {
                this.filter = {
                    type: 'condition',
                    property: undefined,
                    value: {
                        type: undefined,
                        value: undefined
                    },
                    inverted: false
                } as unknown as Condition<Star>;
            }
        },
        applyFilter() {
            if (!this.validateFilter()) return;

            let stars: Star[];
            if (this.initialStars === 'selected') {
                stars = this.selection.slice();
            } else {
                stars = useGalaxyStore().$state.galaxy.stars;
            }

            useMenuStateStore().clearSelection();
            if (!this.filter) {
                useMenuStateStore().addStarsToSelection(stars);
            } else {
                const newSelection: Star[] = [];
                for (const star of stars) {
                    if (evalFilter(this.filter, star)) {
                        newSelection.push(star);
                    }
                }

                useMenuStateStore().addStarsToSelection(newSelection);
            }

            editor.map!.drawStarSelection();

            if (this.selection.length === 0) {
                this.initialStars = 'all';
            }
        },
        validateFilter() {
            if (this.errors.length !== 0) this.errors.length = 0;
            if (!this.filter) return true;

            if (this.filter.type === 'condition') {
                if (!this.filter.property) {
                    this.errors.push(`All conditions must check a valid property.`)
                }

                if (this.filter.value === undefined) {
                    this.errors.push(`All conditions must have a valid value.`);
                }
            }

            if (this.errors.length !== 0) return false;
            return true;
        },
        deleteCondition(condition: Filter<Star>) {
            this.filter = null;
        }
    },
    mounted() {
        if (this.selection.length === 0) {
            this.initialStars = 'all';
        } else this.initialStars = 'selected';
    }
}
</script>

<style scoped>
.row {
    margin: 0;
    width: 100%;
}

.col {
    padding: 0;
}

.col-flex {
    display: flex;
    align-items: center;
    padding: 0 !important;
}

.fade-in {
    animation-name: fadeInAnimation;
    animation-duration: .3s;
}

@keyframes fadeInAnimation {
    0% {
        opacity: 0;
    }

    100% {
        opacity: 1;
    }
}

.form-control.small-input {
    height: 20px;
}

.form-control.semi-small-input {
    height: 23px;
}

.small-select {
    font-size: 14px !important;
    padding-top: 0 !important;
    padding-bottom: 0 !important;
    padding-left: 0.25rem !important;
}

.selected-null {
    color: rgba(255, 255, 255, 0.4) !important;
}

.selected-null:focus {
    color: rgba(255, 255, 255, 0.4) !important;
}

.form-control {
    font-size: 10px;
}

.form-control:disabled {
    opacity: 0.5;
}

.form-control::placeholder {
    color: rgba(255, 255, 255, 0.5);
}

p {
    margin: 0;
}

.text-danger {
    font-size: 14px;
    font-weight: 400;
}

.bg-dark-custom {
    --bs-bg-opacity: 1;
    background-color: rgb(53, 67, 74) !important;
    --bs-gutter-x: 0px;
    --bs-gutter-y: 0px;
    margin-left: -6px !important;
    padding-left: 6px;
    padding-right: 6px;
    min-width: calc(100% + 12px);
}

.col-flex {
    display: flex;
    align-items: center;
    padding: 0 !important;
}

.align-center {
    align-content: center;
    justify-content: center;
}

.align-end {
    align-content: center;
    justify-content: end;
}

.text-warning {
    color: rgba(255, 159, 12, 1) !important;
}

.btn {
    display: inline-block;
    font-weight: 400;
    line-height: 1.5;
    user-select: none;
    text-align: center;
    vertical-align: middle;
    right: 0;
}

.btn-sm {
    --bs-btn-padding-y: 0.25rem;
    --bs-btn-padding-x: 0.5rem;
    --bs-btn-font-size: 0.875rem;
}

.btn-ssm {
    --bs-btn-padding-y: 0px;
    --bs-btn-padding-x: 7.1px;
    --bs-btn-font-size: 14px;
}

.btn-wide {
    width: 100%;
}

.btn-outline-success {
    display: inline-block;
    font-weight: 400;
    line-height: 1;
    text-align: center;
    text-decoration: none;
    vertical-align: middle;
    cursor: pointer;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    font-size: 14px;
    border-radius: 4px;
}

.btn-outline-primary {
    display: inline-block;
    font-weight: 400;
    line-height: 1;
    text-align: center;
    text-decoration: none;
    vertical-align: middle;
    cursor: pointer;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    font-size: 14px;
    border-radius: 4px;
}

.error-text {
    font-size: 14px;
    font-weight: 400;
}

ul {
    margin: 0;
}
</style>