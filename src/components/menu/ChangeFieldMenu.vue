<template>
    <div class="fade-in">
        <menu-title :title="title" />
        <div class="row mb-2">
            <input id="value" class="form-control" v-model="value" :placeholder="'Enter a new value'">
        </div>
        <div class="pb-2 text-danger" v-if="errors != null && errors.length !== 0">
            <p>Please correct the following error(s):</p>
            <ul>
                <li v-for="error in errors" v-bind:key="error">{{ error }}</li>
            </ul>
        </div>
        <div class="row pb-2">
            <div class="col col-flex col-auto">
                <button class="btn btn-sm btn-primary" @click="returnToPreviousMenu">
                    <i class="fas fa-arrow-left"></i>
                    Back to {{ objectType }}
                </button>
            </div>
            <div class="col col-flex"></div>
            <div class="col col-flex text-end col-auto">
                <button class="btn btn-sm btn-success" @click="updateField">
                    <i class="fas fa-check"></i>
                    Update {{ objectPropertyName }}
                </button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { useMenuStateStore } from '@/stores/menuState';
import MenuTitle from './MenuTitle.vue';

export default {
    components: {
        'menu-title': MenuTitle,
    },
    props: {
        objectType: String,
        objectPropertyName: String,
        returnToPreviousOnUpdate: Boolean,
        startingValue: String,
        errors: Array<string>
    },
    data() {
        return {
            value: null as any
        }
    },
    mounted() {
        this.value = this.startingValue ? this.startingValue : null;
    },
    methods: {
        returnToPreviousMenu() {
            this.$emit('returnToMenu');
        },
        updateField() {
            this.$emit('updateField', this.objectPropertyName, this.value);
            if (this.errors && this.errors.length !== 0) return;
            if (this.returnToPreviousOnUpdate) {
                this.returnToPreviousMenu();
            } else useMenuStateStore().setMenuState('none');
        }
    },
    computed: {
        title: function () {
            return `Change ${this.objectType} ${this.objectPropertyName}`;
        }
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
</style>