<template>
    <div class="bordered pt-1 pb-1 mt-1 mb-1" v-if="filterProp" :style="{ backgroundColor: backgroundColor }">
        <div class="ps-1 allow-overflow" v-if="filterProp.type === 'condition'">
            <div class="flex nowrap">
                <div class="blocker flex me-auto">
                    <button class="btn btn-ssm btn-outline-warning me-1" type="button" title="Invert condition"
                        @click="invertSelf()" :class="{ active: filterProp.inverted }">
                        <i class="fas fa-exclamation"></i>
                    </button>
                </div>
                <p class="align-center ms-1 me-1">Property</p>
                <select class="form-control small-select short-select me-1" v-model="selectedProperty"
                    @change="onPropertyChanged()" :class="{ 'selected-null': selectedProperty === '(select)' }">
                    <option v-for="prop in starProperties" :value="prop.name">
                        {{ prop.name }}
                    </option>
                </select>
                <div class="flex ms-auto">
                    <button class="btn btn-ssm btn-success me-1" type="button" title="Add condition"
                        @click="addCondition()">
                        <i class="fas fa-plus"></i>
                    </button>
                    <button class="btn btn-ssm btn-danger me-1" type="button" title="Delete condition"
                        @click="deleteCondition()">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="flex pt-1">
                <div class="ms-auto flex">
                    <p class="align-center ms-1 me-1">Value</p>
                    <select class="form-control small-select short-select" v-model="selectedValueType"
                        @change="onValueTypeChanged()" :class="{ 'selected-null': selectedValueType === null }">
                        <option v-for="v in filteredPropertyValues" :value="v.id">
                            {{ v.name }}
                        </option>
                    </select>
                </div>
                <div class="me-auto min-content">
                    <div class="ms-1" v-if="selectedValueType === 'exact'">
                        <div v-if="starProperties.find(prop => prop.name === selectedProperty)?.type === 'integer'">
                            <input class="form-control hidden-number semi-small-input" type="number" min="0" step="1"
                                required="true" v-model="filterProp.value.value">
                        </div>
                        <div v-if="starProperties.find(prop => prop.name === selectedProperty)?.type === 'number'">
                            <input class="form-control hidden-number semi-small-input" type="number" min="0" step="any"
                                required="true" v-model="filterProp.value.value">
                        </div>
                        <div v-if="starProperties.find(prop => prop.name === selectedProperty)?.type === 'boolean'">
                            <select class="form-control small-select short-select" v-model="filterProp.value.value">
                                <option :value="true">true</option>
                                <option :value="false">false</option>
                            </select>
                        </div>
                        <div
                            v-if="starProperties.find(prop => prop.name === selectedProperty)?.type === 'select-player'">
                            <select class="form-control small-select short-select" v-model="filterProp.value.value"
                                :class="{ 'selected-null': !filterProp.value.value }">
                                <option v-for="player in selectionPlayers" :value="player.id">
                                    {{ player.alias }}
                                </option>
                            </select>
                        </div>
                        <div
                            v-if="starProperties.find(prop => prop.name === selectedProperty)?.type === 'select-specialist'">
                            <select class="form-control small-select short-select" v-model="filterProp.value.value"
                                :class="{ 'selected-null': !filterProp.value.value }">
                                <option v-for="specialist in selectionSpecialists" :value="specialist.id">
                                    {{ specialist.name }}
                                </option>
                            </select>
                        </div>
                    </div>
                    <div class="flex ms-1 min-content" v-if="selectedValueType === 'range'">
                        <div class="flex"
                            v-if="starProperties.find(prop => prop.name === selectedProperty)?.type === 'integer'">
                            <input class="form-control hidden-number semi-small-input me-1" type="number" min="0"
                                step="1" required="true" v-model="filterProp.value.min">
                            <p>and</p>
                            <input class="form-control hidden-number semi-small-input ms-1" type="number"
                                :min="filterProp.value.min" step="1" required="true" v-model="filterProp.value.max">
                        </div>
                        <div class="flex"
                            v-if="starProperties.find(prop => prop.name === selectedProperty)?.type === 'number'">
                            <input class="form-control hidden-number semi-small-input me-1" type="number" min="0"
                                step="any" required="true" v-model="filterProp.value.min">
                            <p>and</p>
                            <input class="form-control hidden-number semi-small-input ms-1" type="number"
                                :min="filterProp.value.min" step="any" required="true" v-model="filterProp.value.max">
                        </div>
                    </div>
                    <div class="flex ms-1 min-content" v-if="selectedValueType === 'greaterThan'">
                        <div class="flex"
                            v-if="starProperties.find(prop => prop.name === selectedProperty)?.type === 'integer'">
                            <input class="form-control hidden-number semi-small-input" type="number" min="0" step="1"
                                required="true" v-model="filterProp.value.min">
                        </div>
                        <div class="flex"
                            v-if="starProperties.find(prop => prop.name === selectedProperty)?.type === 'number'">
                            <input class="form-control hidden-number semi-small-input" type="number" min="0" step="any"
                                required="true" v-model="filterProp.value.min">
                        </div>
                    </div>
                    <div class="flex ms-1 min-content" v-if="selectedValueType === 'lessThan'">
                        <div class="flex"
                            v-if="starProperties.find(prop => prop.name === selectedProperty)?.type === 'integer'">
                            <input class="form-control hidden-number semi-small-input" type="number" min="0" step="1"
                                required="true" v-model="filterProp.value.max">
                        </div>
                        <div class="flex"
                            v-if="starProperties.find(prop => prop.name === selectedProperty)?.type === 'number'">
                            <input class="form-control hidden-number semi-small-input" type="number" min="0" step="any"
                                required="true" v-model="filterProp.value.max">
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="ms-1 me-1 ps-1 pe-1" v-if="filterProp.type === 'operator'">
            <filter-component :filter-prop="filterProp.c1" :invertedColor="!invertedColor"
                @deleteOperand="(o: Filter<Star>) => deleteOperand(o)" />
            <div class="flex align-center">
                <button class="btn btn-ssm btn-outline-warning me-1" type="button" title="Invert condition"
                    @click="invertSelf()" :class="{ active: filterProp.inverted }">
                    <i class="fas fa-exclamation"></i>
                </button>
                <select class="form-control small-select short-select" v-model="filterProp.name">
                    <option value="and">AND</option>
                    <option value="or">OR</option>
                    <option value="xor">XOR</option>
                </select>
                <div class="end-blocker-small"></div>
            </div>
            <filter-component :filter-prop="filterProp.c2" :invertedColor="!invertedColor"
                @deleteOperand="(o: Filter<Star>) => deleteOperand(o)" />
        </div>
    </div>
</template>

<script lang="ts">
import helper from '@/scripts/helper';
import type { Condition, Filter } from '@/scripts/types/Filter';
import type { Star } from '@/scripts/types/Star';
import { useSpecialistsStore } from '@/stores/specialists';

export default {
    name: 'filter-component',
    props: {
        filterProp: Object,
        invertedColor: Boolean
    },
    data() {
        return {
            filter: this.filterProp as Filter<Star>,
            starProperties: [
                {
                    name: '(select)',
                    key: null,
                    values: [null],
                    type: null
                },
                {
                    name: 'Player',
                    key: ['playerId'],
                    values: ['exact', 'notNull'],
                    type: 'select-player'
                },
                {
                    name: 'Ships',
                    key: ['shipsActual'],
                    values: ['exact', 'range', 'greaterThan', 'lessThan'],
                    type: 'number'
                },
                {
                    name: 'Capital Star',
                    key: ['homeStar'],
                    values: ['exact'],
                    type: 'boolean'
                },
                {
                    name: 'Natural Resources: Economy',
                    key: ['naturalResources', 'economy'],
                    values: ['exact', 'range', 'greaterThan', 'lessThan'],
                    type: 'integer'
                },
                {
                    name: 'Natural Resources: Industry',
                    key: ['naturalResources', 'industry'],
                    values: ['exact', 'range', 'greaterThan', 'lessThan'],
                    type: 'integer'
                },
                {
                    name: 'Natural Resources: Science',
                    key: ['naturalResources', 'science'],
                    values: ['exact', 'range', 'greaterThan', 'lessThan'],
                    type: 'integer'
                },
                {
                    name: 'Infrastructure: Economy',
                    key: ['infrastructure', 'economy'],
                    values: ['exact', 'range', 'greaterThan', 'lessThan'],
                    type: 'integer'
                },
                {
                    name: 'Infrastructure: Industry',
                    key: ['infrastructure', 'industry'],
                    values: ['exact', 'range', 'greaterThan', 'lessThan'],
                    type: 'integer'
                },
                {
                    name: 'Infrastructure: Science',
                    key: ['infrastructure', 'science'],
                    values: ['exact', 'range', 'greaterThan', 'lessThan'],
                    type: 'integer'
                },
                {
                    name: 'Specialist',
                    key: ['specialistId'],
                    values: ['exact', 'notNull'],
                    type: 'select-specialist'
                },
                {
                    name: 'Specialist Expiry Tick',
                    key: ['specialistExpireTick'],
                    values: ['exact', 'range', 'notNull', 'greaterThan', 'lessThan'],
                    type: 'integer'
                },
                {
                    name: 'Asteroid Field',
                    key: ['isAsteroidField'],
                    values: ['exact'],
                    type: 'boolean'
                },
                {
                    name: 'Binary Star',
                    key: ['isBinaryStar'],
                    values: ['exact'],
                    type: 'boolean'
                },
                {
                    name: 'Black Hole',
                    key: ['isBlackHole'],
                    values: ['exact'],
                    type: 'boolean'
                },
                {
                    name: 'Nebula',
                    key: ['isNebula'],
                    values: ['exact'],
                    type: 'boolean'
                },
                {
                    name: 'Pulsar',
                    key: ['isPulsar'],
                    values: ['exact'],
                    type: 'boolean'
                },
                {
                    name: 'Warp Gate',
                    key: ['warpGate'],
                    values: ['exact'],
                    type: 'boolean'
                },
                {
                    name: 'Wormhole',
                    key: ['wormHoleToStarId'],
                    values: ['notNull'],
                    type: 'boolean'
                }
            ],
            propertyValues: [
                {
                    id: null,
                    name: '(none)'
                },
                {
                    id: 'exact',
                    name: 'equals'
                },
                {
                    id: 'range',
                    name: 'is between'
                },
                {
                    id: 'notNull',
                    name: 'is not null'
                },
                {
                    id: 'greaterThan',
                    name: 'is greater than'
                },
                {
                    id: 'lessThan',
                    name: 'is less than'
                }
            ],
            selectedProperty: '(select)' as string | null,
            selectedValueType: null as string | null,
            selectionPlayers: helper.selectionPlayers(),
            selectionSpecialists: helper.selectionSpecialists(useSpecialistsStore().getValidStarSpecialists()),
            selectedPlayer: null as string | null,
            selectedSpecialist: null as number | null
        }
    },
    methods: {
        onPropertyChanged() {
            if (!this.filterProp) return;

            const property = this.starProperties.find(prop => prop.name === this.selectedProperty);
            if (!property) return;

            if (property.key != null) this.filterProp.property = property.key;

            this.selectedValueType = property.values[0];
            this.onValueTypeChanged();
        },
        onValueTypeChanged() {
            if (!this.filterProp) return;

            switch (this.selectedValueType) {
                case 'exact':
                    this.filterProp.value.type = 'exact';
                    this.filterProp.value.min = undefined;
                    this.filterProp.value.max = undefined;
                    break;
                case 'range':
                    this.filterProp.value.type = 'range';
                    this.filterProp.value.value = undefined;
                    break;
                case 'greaterThan':
                    this.filterProp.value.type = 'range';
                    this.filterProp.value.value = undefined;
                    this.filterProp.value.max = undefined;
                    break;
                case 'lessThan':
                    this.filterProp.value.type = 'range';
                    this.filterProp.value.min = undefined;
                    this.filterProp.value.value = undefined;
                    break;
                case 'notNull':
                    this.filterProp.value.type = 'notNull';
                    this.filterProp.value.value = undefined;
                    this.filterProp.value.min = undefined;
                    this.filterProp.value.max = undefined;
                    break;
                case null:
                default:
                    this.filterProp.value.type = null;
                    this.filterProp.value.value = undefined;
                    this.filterProp.value.min = undefined;
                    this.filterProp.value.max = undefined;
                    break;
            }

            const property = this.starProperties.find(prop => prop.name === this.selectedProperty);
            if (!property) return;

            if (this.selectedValueType === 'exact') {
                if (property.type === 'select-player' || property.type === 'select-specialist') {
                    this.filterProp.value.value = null;
                } else if (property.type === 'boolean') {
                    this.filterProp.value.value = true;
                } else {
                    this.filterProp.value.value = undefined;
                }
            }
        },
        addCondition() {
            if (!this.filterProp) return;

            const currentCondition = {
                type: this.filterProp.type,
                property: this.filterProp.property,
                value: this.filterProp.value,
                inverted: this.filterProp.inverted
            };

            const copy = JSON.parse(JSON.stringify(currentCondition));

            this.filterProp.value = undefined;
            this.filterProp.property = undefined;
            this.filterProp.inverted = false;

            this.filterProp.type = 'operator';
            this.filterProp.c1 = copy;
            this.filterProp.c2 = {
                type: 'condition',
                property: undefined,
                value: {
                    type: undefined,
                    value: undefined
                },
                inverted: false
            };
            this.filterProp.name = 'and';
        },
        deleteCondition() {
            this.$emit('deleteOperand', this.filterProp);
        },
        deleteOperand(operand: Filter<Star>) {
            if (!this.filterProp) return;

            let retained: Filter<Star>;
            if (this.filterProp.c1 === operand) {
                retained = JSON.parse(JSON.stringify(this.filterProp.c2));
            } else if (this.filterProp.c2 === operand) {
                retained = JSON.parse(JSON.stringify(this.filterProp.c1));
            } else return;

            this.filterProp.c1 = undefined;
            this.filterProp.c2 = undefined;
            this.filterProp.name = undefined;

            this.filterProp.type = retained.type;
            this.filterProp.inverted = retained.inverted;
            if (retained.type === 'condition') {
                this.filterProp.property = retained.property;
                this.filterProp.value = retained.value;
            } else if (retained.type === 'operator') {
                this.filterProp.c1 = retained.c1;
                this.filterProp.c2 = retained.c2;
                this.filterProp.name = retained.name;
            }

            this.updateSelf();
        },
        invertSelf() {
            if (!this.filterProp) return;

            this.filterProp.inverted = !this.filterProp.inverted;
        },
        updateSelf() {
            if (!this.filterProp) return;

            if (this.filterProp.property) {
                const selected = this.starProperties.find(p => p.key?.join() === this.filterProp!.property.join());
                this.selectedProperty = selected ? selected.name : null;

                if (this.filterProp.value?.type) {
                    const type = this.propertyValues.find(pv => pv.id === this.filterProp!.value?.type);
                    this.selectedValueType = type ? type.id : null;
                }
            }
        }
    },
    mounted() {
        this.updateSelf();
    },
    computed: {
        backgroundColor: function () {
            let color = this.invertedColor ? 'rgb(28, 39, 52)' : 'rgb(51, 61, 72)';
            if (this.filterProp) color = this.filterProp.type === 'condition' ? 'rgb(40, 50, 71)' : color;
            return color;
        },
        selectedPropertyValues: function () {
            return this.starProperties.find(p => p.name === this.selectedProperty)!.values;
        },
        filteredPropertyValues: function () {
            return this.propertyValues.filter(pv => this.selectedPropertyValues.findIndex(sv => sv === pv.id) !== -1);
        }
    }
}
</script>

<style scoped>
.flex {
    display: flex;
}

.nowrap {
    flex-wrap: nowrap;
    flex-flow: nowrap;
}

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

.form-control.small-input {
    height: 20px;
}

.form-control.semi-small-input {
    height: 23px;
}

.short-flex {
    width: 50% !important;
}

.min-content {
    width: min-content !important;
}

input {
    min-width: 72px;
}

.small-select {
    font-size: 14px !important;
    padding-top: 0 !important;
    padding-bottom: 0 !important;
    padding-left: 0.25rem !important;
}

.short-select {
    width: fit-content !important;
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

.col-flex {
    display: flex;
    align-items: center;
    padding: 0 !important;
}

.align-center {
    align-content: center;
    justify-content: safe center;
}

.align-end {
    align-content: center;
    justify-content: end;
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

.bordered {
    border-width: 1px;
    border-color: gray;
    border-style: solid;
    border-radius: 4px;
}

.ms-2px {
    margin-left: 2px;
}

.me-2px {
    margin-right: 2px;
}

.w-100 {
    width: 100%;
}

.blocker {
    height: 23px;
    width: 64.9px;
}

.end-blocker-small {
    height: 23px;
    width: 23.7px;
}

.allow-overflow {
    overflow-x: auto;
    scrollbar-width: thin;
}
</style>