<template>
    <div class="menu-page">
        <menu-title :title="titleText" />

        <div class="pt-2 pb-2 bg-dark-custom">
            <div class="row mb-2">
                <div class="col text-center">
                    <h5>Locations</h5>
                </div>
            </div>
            <div class="row">
                <div class="col col-3 text-center me-2">
                    Offset (units):
                </div>
                <div class="col me-2">
                    <input id="locMinOffset" class="form-control hidden-number" type="number" min="0" step="any"
                        :max="locMaxOffset" required="true" v-model="locMinOffset" ref="locMinOffsetInput">
                </div>
                <div class="col col-auto me-2">
                    to
                </div>
                <div class="col me-2">
                    <input id="locMaxOffset" class="form-control hidden-number" type="number" :min="locMinOffset"
                        step="any" required="true" v-model="locMaxOffset" ref="locMaxOffsetInput">
                </div>
                <div class="col col-auto">
                    <button class="btn btn-ssm btn-outline-primary" title="Randomise" @click="randomiseOffset()">
                        <i class="fas fa-dice"></i>
                    </button>
                </div>
            </div>
        </div>
        <div class="pt-2 pb-2 mt-1 bg-dark-custom">
            <div class="row mb-2">
                <div class="col full-width-col">
                    <h5>Natural Resources</h5>
                </div>
                <div class="col text-end">
                    <button class="btn btn-ssm btn-outline-warning" @click="switchSplitNR()">
                        <i class="fas fa-globe"></i>
                        <p class="nr-select-text ms-1">{{ isSplitNR ? 'Split' : 'Single' }}</p>
                    </button>
                </div>
            </div>
            <div class="row mb-1" v-if="!isSplitNR">
                <div class="col col-3 text-center me-2">
                    Value:
                </div>
                <div class="col me-2">
                    <input id="minNR" class="form-control hidden-number" type="number" min="0" step="1" :max="maxNR"
                        required="true" v-model="minNR" ref="minNRInput">
                </div>
                <div class="col col-auto me-2">
                    to
                </div>
                <div class="col me-2">
                    <input id="maxNR" class="form-control hidden-number" type="number" :min="minNR" step="1"
                        required="true" v-model="maxNR" ref="maxNRInput">
                </div>
                <div class="col col-auto text-end" title="Randomise">
                    <button class="btn btn-ssm btn-outline-primary" @click="randomiseNR('all')">
                        <i class="fas fa-dice"></i>
                    </button>
                </div>
            </div>
            <div class="row mb-1" v-if="isSplitNR">
                <div class="col col-3 text-center me-2">
                    Economy:
                </div>
                <div class="col me-2">
                    <input id="minEconomyNR" class="form-control hidden-number" type="number" min="0" step="1"
                        :max="maxEconomyNR" required="true" v-model="minEconomyNR" ref="minEconomyNRInput">
                </div>
                <div class="col col-auto text-center me-2">
                    to
                </div>
                <div class="col me-2">
                    <input id="maxEconomyNR" class="form-control hidden-number" type="number" :min="minEconomyNR"
                        step="1" required="true" v-model="maxEconomyNR" ref="maxEconomyNRInput">
                </div>
                <div class="col col-auto text-end" title="Randomise">
                    <button class="btn btn-ssm btn-outline-primary" @click="randomiseNR('economy')">
                        <i class="fas fa-dice"></i>
                    </button>
                </div>
            </div>
            <div class="row mb-1" v-if="isSplitNR">
                <div class="col col-3 text-center me-2">
                    Industry:
                </div>
                <div class="col me-2">
                    <input id="minIndustryNR" class="form-control hidden-number" type="number" min="0" step="1"
                        :max="maxIndustryNR" required="true" v-model="minIndustryNR" ref="minIndustryNRInput">
                </div>
                <div class="col col-auto text-center me-2">
                    to
                </div>
                <div class="col me-2">
                    <input id="maxIndustryNR" class="form-control hidden-number" type="number" :min="minIndustryNR"
                        step="1" required="true" v-model="maxIndustryNR" ref="maxIndustryNRInput">
                </div>
                <div class="col col-auto text-end" title="Randomise">
                    <button class="btn btn-ssm btn-outline-primary" @click="randomiseNR('industry')">
                        <i class="fas fa-dice"></i>
                    </button>
                </div>
            </div>
            <div class="row mb-1" v-if="isSplitNR">
                <div class="col col-3 text-center me-2">
                    Science:
                </div>
                <div class="col me-2">
                    <input id="minScienceNR" class="form-control hidden-number" type="number" min="0" step="1"
                        :max="maxScienceNR" required="true" v-model="minScienceNR" ref="minScienceNRInput">
                </div>
                <div class="col col-auto text-center me-2">
                    to
                </div>
                <div class="col me-2">
                    <input id="maxScienceNR" class="form-control hidden-number" type="number" :min="minScienceNR"
                        step="1" required="true" v-model="maxScienceNR" ref="maxScienceNRInput">
                </div>
                <div class="col col-auto text-end" title="Randomise">
                    <button class="btn btn-ssm btn-outline-primary" @click="randomiseNR('science')">
                        <i class="fas fa-dice"></i>
                    </button>
                </div>
            </div>
            <div class="row pt-2 align-center">
                <div class="col col-auto me-2 text-center">
                    Distribution Mode:
                </div>
                <div class="col col-4">
                    <select class="form-control" v-model="distributionModeNR"
                        @change="checkDistributionInputValidity('lowValueBiasNRInput', 'radiusWeightNRInput', distributionModeNR)">
                        <option value="unweighted">Unweighted</option>
                        <option value="weighted">Weighted</option>
                        <option value="weightedRadius">Weighted Radius</option>
                    </select>
                </div>
            </div>
            <div class="row align-center mt-2" v-show="distributionModeNR !== 'unweighted'">
                <div class="col col-4 me-2 text-center">
                    Low Value Bias:
                </div>
                <div class="col col-auto slider-col-2 pe-2">
                    <input class="form-range slider" type="range" min="0.01" max="0.99" step="0.01"
                        v-model.number="lowValueBiasNR"
                        @input="checkDistributionInputValidity('lowValueBiasNRInput', 'radiusWeightNRInput', distributionModeNR)">
                </div>
                <div class="col col-2">
                    <input id="lowValueBiasNR" class="form-control hidden-number" type="number" min="0" max="1"
                        step="any" required="true" v-model="lowValueBiasNR" ref="lowValueBiasNRInput"
                        @input="checkDistributionInputValidity('lowValueBiasNRInput', 'radiusWeightNRInput', distributionModeNR)">
                </div>
            </div>
            <div class="row align-center" v-show="distributionModeNR === 'weightedRadius'">
                <div class="col col-4 me-2 text-center">
                    Radius Weight:
                </div>
                <div class="col col-auto slider-col-2 pe-2">
                    <input class="form-range slider" type="range" min="-0.99" max="0.99" step="0.01"
                        v-model.number="radiusWeightNR"
                        @input="checkDistributionInputValidity('lowValueBiasNRInput', 'radiusWeightNRInput', distributionModeNR)">
                </div>
                <div class="col col-2">
                    <input id="weightedRadiusNR" class="form-control hidden-number" type="number" min="-1" max="1"
                        step="any" required="true" v-model="radiusWeightNR"
                        :disabled="distributionModeNR !== 'weightedRadius'" ref="radiusWeightNRInput"
                        @input="checkDistributionInputValidity('lowValueBiasNRInput', 'radiusWeightNRInput', distributionModeNR)">
                </div>
            </div>
            <div class="row mt-1 align-center" v-if="distributionModeNR === 'weightedRadius'">
                <div class="col col-auto me-2 text-center">
                    Center Type:
                </div>
                <div class="col me-1 col-3" v-if="selection != null && selection.length > 0">
                    <select class="form-control" v-model="centerNR" @change="switchCenter()">
                        <option value="galaxy">Galaxy</option>
                        <option value="selection">Selection</option>
                    </select>
                </div>
                <div class="col col-3">
                    <select class="form-control" v-model="centerTypeNR">
                        <option value="coordinate" v-if="centerNR === 'galaxy'">Origin</option>
                        <option value="midpoint">Midpoint</option>
                        <option value="centroid">Centroid</option>
                    </select>
                </div>
            </div>
        </div>
        <div class="pt-2 pb-2 mt-1 bg-dark-custom">
            <div class="row mb-2">
                <div class="col text-center">
                    <h5>Infrastructure</h5>
                </div>
            </div>
            <div class="row mb-1">
                <div class="col col-3 text-center me-2">
                    Economy:
                </div>
                <div class="col me-2">
                    <input id="minEconomyInfra" class="form-control hidden-number" type="number" min="0" step="1"
                        :max="maxEconomyInfra" required="true" v-model="minEconomyInfra" ref="minEconomyInfraInput">
                </div>
                <div class="col col-auto text-center me-2">
                    to
                </div>
                <div class="col me-2">
                    <input id="maxEconomyInfra" class="form-control hidden-number" type="number" :min="minEconomyInfra"
                        step="1" required="true" v-model="maxEconomyInfra" ref="maxEconomyInfraInput">
                </div>
                <div class="col col-auto text-end" title="Randomise">
                    <button class="btn btn-ssm btn-outline-primary" @click="randomiseInfra('economy')">
                        <i class="fas fa-dice"></i>
                    </button>
                </div>
            </div>
            <div class="row mb-1">
                <div class="col col-3 text-center me-2">
                    Industry:
                </div>
                <div class="col me-2">
                    <input id="minIndustryInfra" class="form-control hidden-number" type="number" min="0" step="1"
                        :max="maxIndustryInfra" required="true" v-model="minIndustryInfra" ref="minIndustryInfraInput">
                </div>
                <div class="col col-auto text-center me-2">
                    to
                </div>
                <div class="col me-2">
                    <input id="maxIndustryInfra" class="form-control hidden-number" type="number"
                        :min="minIndustryInfra" step="1" required="true" v-model="maxIndustryInfra"
                        ref="maxIndustryInfraInput">
                </div>
                <div class="col col-auto text-end" title="Randomise">
                    <button class="btn btn-ssm btn-outline-primary" @click="randomiseInfra('industry')">
                        <i class="fas fa-dice"></i>
                    </button>
                </div>
            </div>
            <div class="row">
                <div class="col col-3 text-center me-2">
                    Science:
                </div>
                <div class="col me-2">
                    <input id="minScienceInfra" class="form-control hidden-number" type="number" min="0" step="1"
                        :max="maxScienceInfra" required="true" v-model="minScienceInfra" ref="minScienceInfraInput">
                </div>
                <div class="col col-auto text-center me-2">
                    to
                </div>
                <div class="col me-2">
                    <input id="maxScienceInfra" class="form-control hidden-number" type="number" :min="minScienceInfra"
                        step="1" required="true" v-model="maxScienceInfra" ref="maxScienceInfraInput">
                </div>
                <div class="col col-auto text-end" title="Randomise">
                    <button class="btn btn-ssm btn-outline-primary" @click="randomiseInfra('science')">
                        <i class="fas fa-dice"></i>
                    </button>
                </div>
            </div>
            <div class="row pt-2 align-center">
                <div class="col col-auto me-2 text-center">
                    Distribution Mode:
                </div>
                <div class="col col-4">
                    <select class="form-control" v-model="distributionModeInfra"
                        @change="checkDistributionInputValidity('lowValueBiasInfraInput', 'radiusWeightInfraInput', distributionModeInfra)">
                        <option value="unweighted">Unweighted</option>
                        <option value="weighted">Weighted</option>
                        <option value="weightedRadius">Weighted Radius</option>
                    </select>
                </div>
            </div>
            <div class="row align-center mt-2" v-show="distributionModeInfra !== 'unweighted'">
                <div class="col col-4 text-center">
                    Low Value Bias:
                </div>
                <div class="col col-auto slider-col-2 pe-2">
                    <input class="form-range slider" type="range" min="0.01" max="0.99" step="0.01"
                        v-model.number="lowValueBiasInfra"
                        @input="checkDistributionInputValidity('lowValueBiasInfraInput', 'radiusWeightInfraInput', distributionModeInfra)">
                </div>
                <div class="col col-2">
                    <input id="lowValueBiasInfra" class="form-control hidden-number" type="number" min="0" max="1"
                        step="any" required="true" v-model="lowValueBiasInfra" ref="lowValueBiasInfraInput"
                        @input="checkDistributionInputValidity('lowValueBiasInfraInput', 'radiusWeightInfraInput', distributionModeInfra)">
                </div>
            </div>
            <div class="row align-center" v-show="distributionModeInfra === 'weightedRadius'">
                <div class="col col-4 text-center">
                    Radius Weight:
                </div>
                <div class="col col-auto slider-col-2 pe-2">
                    <input class="form-range slider" type="range" min="-0.99" max="0.99" step="0.01"
                        v-model.number="radiusWeightInfra"
                        @input="checkDistributionInputValidity('lowValueBiasInfraInput', 'radiusWeightInfraInput', distributionModeInfra)">
                </div>
                <div class="col col-2" v-show="distributionModeInfra === 'weightedRadius'">
                    <input id="radiusWeightInfra" class="form-control hidden-number" type="number" min="-1" max="1"
                        step="any" required="true" v-model="radiusWeightInfra"
                        :disabled="distributionModeInfra !== 'weightedRadius'" ref="radiusWeightInfraInput"
                        @input="checkDistributionInputValidity('lowValueBiasInfraInput', 'radiusWeightInfraInput', distributionModeInfra)">
                </div>
            </div>
            <div class="row mt-1 align-center" v-if="distributionModeInfra === 'weightedRadius'">
                <div class="col col-auto me-2 text-center">
                    Center Type:
                </div>
                <div class="col me-1 col-3" v-if="selection != null && selection.length > 0">
                    <select class="form-control" v-model="centerInfra" @change="switchCenter()">
                        <option value="galaxy">Galaxy</option>
                        <option value="selection">Selection</option>
                    </select>
                </div>
                <div class="col col-3">
                    <select class="form-control" v-model="centerTypeInfra">
                        <option value="coordinate" v-if="centerInfra === 'galaxy'">Origin</option>
                        <option value="midpoint">Midpoint</option>
                        <option value="centroid">Centroid</option>
                    </select>
                </div>
            </div>
        </div>
        <div class="pt-2 pb-2 mt-1 bg-dark-custom">
            <div class="row mb-2">
                <div class="col full-width-col">
                    <h5>Terrain</h5>
                </div>
                <div class="col text-end">
                    <button class="btn btn-ssm btn-outline-primary" @click="randomiseAllTerrain()">
                        <i class="fas fa-dice"></i>
                        Randomise All
                    </button>
                </div>
            </div>
            <div class="row">
                <div class="col col-4 text-center me-2">
                    Asteroid Field %:
                </div>
                <div class="col col-auto slider-col pe-2">
                    <input class="form-range slider" type="range" min="0.0" max="100.0" step="1"
                        v-model.number="asteroidFieldP">
                </div>
                <div class="col col-2 me-1">
                    <input id="asteroidFieldP" class="form-control hidden-number" type="number" min="0" max="100"
                        step="any" required="true" v-model="asteroidFieldP" ref="asteroidFieldPInput">
                </div>
                <div class="col text-end">
                    <button class="btn btn-ssm btn-outline-primary" title="Randomise"
                        @click="randomiseTerrain('asteroidField')">
                        <i class="fas fa-dice"></i>
                    </button>
                </div>
            </div>
            <div class="row">
                <div class="col col-4 text-center me-2">
                    Binary Star %:
                </div>
                <div class="col col-auto slider-col pe-2">
                    <input class="form-range slider" type="range" min="0.0" max="100.0" step="1"
                        v-model.number="binaryP">
                </div>
                <div class="col col-2 me-1">
                    <input id="binaryP" class="form-control hidden-number" type="number" min="0" max="100" step="any"
                        required="true" v-model="binaryP" ref="binaryPInput">
                </div>
                <div class="col text-end">
                    <button class="btn btn-ssm btn-outline-primary" title="Randomise"
                        @click="randomiseTerrain('binary')">
                        <i class="fas fa-dice"></i>
                    </button>
                </div>
            </div>
            <div class="row">
                <div class="col col-4 text-center me-2">
                    Black Hole %:
                </div>
                <div class="col col-auto slider-col pe-2">
                    <input class="form-range slider" type="range" min="0.0" max="100.0" step="1"
                        v-model.number="blackHoleP">
                </div>
                <div class="col col-2 me-1">
                    <input id="blackHoleP" class="form-control hidden-number" type="number" min="0" max="100" step="any"
                        required="true" v-model="blackHoleP" ref="blackHolePInput">
                </div>
                <div class="col text-end">
                    <button class="btn btn-ssm btn-outline-primary" title="Randomise"
                        @click="randomiseTerrain('blackHole')">
                        <i class="fas fa-dice"></i>
                    </button>
                </div>
            </div>
            <div class="row">
                <div class="col col-4 text-center me-2">
                    Nebula %:
                </div>
                <div class="col col-auto slider-col pe-2">
                    <input class="form-range slider" type="range" min="0.0" max="100.0" step="1"
                        v-model.number="nebulaP">
                </div>
                <div class="col col-2 me-1">
                    <input id="nebulaP" class="form-control hidden-number" type="number" min="0" max="100" step="any"
                        required="true" v-model="nebulaP" ref="nebulaPInput">
                </div>
                <div class="col text-end">
                    <button class="btn btn-ssm btn-outline-primary" title="Randomise"
                        @click="randomiseTerrain('nebula')">
                        <i class="fas fa-dice"></i>
                    </button>
                </div>
            </div>
            <div class="row">
                <div class="col col-4 text-center me-2">
                    Pulsar %:
                </div>
                <div class="col col-auto slider-col pe-2">
                    <input class="form-range slider" type="range" min="0.0" max="100.0" step="1"
                        v-model.number="pulsarP">
                </div>
                <div class="col col-2 me-1">
                    <input id="pulsarP" class="form-control hidden-number" type="number" min="0" max="100" step="any"
                        required="true" v-model="pulsarP" ref="pulsarPInput">
                </div>
                <div class="col text-end">
                    <button class="btn btn-ssm btn-outline-primary" title="Randomise"
                        @click="randomiseTerrain('pulsar')">
                        <i class="fas fa-dice"></i>
                    </button>
                </div>
            </div>
            <div class="row">
                <div class="col col-4 text-center me-2">
                    Warp Gate %:
                </div>
                <div class="col col-auto slider-col pe-2">
                    <input class="form-range slider" type="range" min="0.0" max="100.0" step="1"
                        v-model.number="warpGateP">
                </div>
                <div class="col col-2 me-1">
                    <input id="warpGateP" class="form-control hidden-number" type="number" min="0" max="100" step="any"
                        required="true" v-model="warpGateP" ref="warpGatePInput">
                </div>
                <div class="col text-end">
                    <button class="btn btn-ssm btn-outline-primary" title="Randomise"
                        @click="randomiseTerrain('warpGate')">
                        <i class="fas fa-dice"></i>
                    </button>
                </div>
            </div>
            <div class="row">
                <div class="col col-4 text-center me-2">
                    Wormhole %:
                </div>
                <div class="col col-auto slider-col pe-2">
                    <input class="form-range slider" type="range" min="0.0" max="100.0" step="1"
                        v-model.number="wormHoleP">
                </div>
                <div class="col col-2 me-1">
                    <input id="wormHoleP" class="form-control hidden-number" type="number" min="0" max="100" step="any"
                        required="true" v-model="wormHoleP" ref="wormHolePInput">
                </div>
                <div class="col text-end">
                    <button class="btn btn-ssm btn-outline-primary" title="Randomise"
                        @click="randomiseTerrain('wormHole')">
                        <i class="fas fa-dice"></i>
                    </button>
                </div>
            </div>
        </div>
        <div class="text-danger error-text pt-1 pb-2" v-if="errors != null && errors.length !== 0">
            <p>Please correct the following error(s):</p>
            <ul>
                <li v-for="error in errors" :key="error">{{ error }}</li>
            </ul>
        </div>
    </div>
</template>

<script lang="ts">
import storage from '@/scripts/storage';
import MenuTitle from '../MenuTitle.vue';
import { useGalaxyStore } from '@/stores/galaxy';
import type { Star } from '@/scripts/types/Star';
import helper from '@/scripts/helper';
import editor from '@/scripts/editor';
import type { Location } from '@/scripts/types/Location';
import { useMenuStateStore } from '@/stores/menuState';

export default {
    components: {
        'menu-title': MenuTitle
    },
    data() {
        return {
            selection: useMenuStateStore().$state.selection,
            locMinOffset: 0,
            locMaxOffset: 0,
            isSplitNR: useGalaxyStore().$state.isSplitNaturalResources,
            minNR: 0,
            maxNR: 0,
            minEconomyNR: storage.getSettings().random.minEconomyResources,
            minIndustryNR: storage.getSettings().random.minIndustryResources,
            minScienceNR: storage.getSettings().random.minScienceResources,
            maxEconomyNR: storage.getSettings().random.maxEconomyResources,
            maxIndustryNR: storage.getSettings().random.maxIndustryResources,
            maxScienceNR: storage.getSettings().random.maxScienceResources,
            minEconomyInfra: storage.getSettings().random.minEconomyInfrastructure,
            maxEconomyInfra: storage.getSettings().random.maxEconomyInfrastructure,
            minIndustryInfra: storage.getSettings().random.minIndustryInfrastructure,
            maxIndustryInfra: storage.getSettings().random.maxEconomyInfrastructure,
            minScienceInfra: storage.getSettings().random.minScienceInfrastructure,
            maxScienceInfra: storage.getSettings().random.maxScienceInfrastructure,
            asteroidFieldP: storage.getSettings().random.asteroidFieldPercentage,
            binaryP: storage.getSettings().random.binaryPercentage,
            blackHoleP: storage.getSettings().random.blackHolePercentage,
            nebulaP: storage.getSettings().random.nebulaPercentage,
            pulsarP: storage.getSettings().random.pulsarPercentage,
            warpGateP: storage.getSettings().random.warpGatePercentage,
            wormHoleP: storage.getSettings().random.wormHolePercentage,
            stars: [] as Star[],
            lowValueBiasNR: storage.getSettings().random.lowValueBiasNR,
            lowValueBiasInfra: storage.getSettings().random.lowValueBiasInfra,
            radiusWeightNR: storage.getSettings().random.radiusWeightNR,
            radiusWeightInfra: storage.getSettings().random.radiusWeightInfra,
            distributionModeNR: 'unweighted' as 'unweighted' | 'weighted' | 'weightedRadius',
            distributionModeInfra: 'unweighted' as 'unweighted' | 'weighted' | 'weightedRadius',
            centerNR: 'galaxy' as 'galaxy' | 'selection',
            centerInfra: 'galaxy' as 'galaxy' | 'selection',
            centerTypeNR: 'midpoint' as 'coordinate' | 'midpoint' | 'centroid',
            centerTypeInfra: 'midpoint' as 'coordinate' | 'midpoint' | 'centroid',
            errors: [] as string[]
        }
    },
    methods: {
        switchSplitNR() {
            if (this.isSplitNR) {
                this.minNR = Math.round((this.minEconomyNR + this.minIndustryNR + this.minScienceNR) / 3);
                this.maxNR = Math.round((this.maxEconomyNR + this.maxIndustryNR + this.maxScienceNR) / 3);
            } else {
                this.minEconomyNR = this.minNR;
                this.minIndustryNR = this.minNR;
                this.minScienceNR = this.minNR;

                this.maxEconomyNR = this.maxNR;
                this.maxIndustryNR = this.maxNR;
                this.maxScienceNR = this.maxNR;
            }

            this.isSplitNR = !this.isSplitNR;
        },
        switchCenter() {
            if (this.centerNR === 'selection' && this.centerTypeNR === 'coordinate') {
                this.centerTypeNR = 'midpoint';
            }
            if (this.centerInfra === 'selection' && this.centerTypeInfra === 'coordinate') {
                this.centerTypeInfra = 'midpoint';
            }
        },
        randomiseOffset() {
            this.errors.length = 0;
            if (!this.validateInputs('locMinOffsetInput', 'locMaxOffsetInput')) return;

            const starIds = new Set<string>;
            this.stars.forEach(s => starIds.add(s.id));

            const affectedCarriers = helper.getStarTranslationAffectedCarriers(starIds);

            if (affectedCarriers.map(c => c.affectedPositionInFlight).includes(true)) {
                this.errors.push(`Cannot move stars that have a carrier in flight to/from them.`);
                return;
            }

            for (const star of this.stars) {
                let offsetX = helper.randomIntBetween(this.locMinOffset, this.locMaxOffset);
                const negX = helper.randomIntBetween(0, 1) === 1;
                if (negX) offsetX = -offsetX;

                let offsetY = helper.randomIntBetween(this.locMinOffset, this.locMaxOffset);
                const negY = helper.randomIntBetween(0, 1) === 1;
                if (negY) offsetY = -offsetY;

                star.location = { x: star.location.x + offsetX, y: star.location.y + offsetY };
                editor.transformStar(star);
            }

            for (const affectedCarrier of affectedCarriers) {
                for (let i = 0; i < affectedCarrier.carrier.waypoints.length; i++) {
                    if (!helper.isWaypointDistanceValid(affectedCarrier.carrier, affectedCarrier.carrier.waypoints[i])) {
                        affectedCarrier.carrier.waypoints.length = i; // Removes Nth waypoint and all waypoints after.
                        break;
                    }
                }

                if (affectedCarrier.carrier.orbiting && starIds.has(affectedCarrier.carrier.orbiting)) {
                    affectedCarrier.carrier.location = helper.getStarById(affectedCarrier.carrier.orbiting)!.location;
                    editor.reloadCarrier(affectedCarrier.carrier);
                } else {
                    editor.updateCarrierWaypoints(affectedCarrier.carrier);
                }
            }

            editor.updateWormholes();
            if (this.selection != null && this.selection.length > 0) {
                editor.map!.drawStarSelection();
            }
        },
        randomiseNR(type: 'economy' | 'industry' | 'science' | 'all') {
            this.errors.length = 0;
            if (!this.validateNRInputs(type)) return;

            let min = 0;
            let max = 0;

            switch (type) {
                case 'all':
                    min = this.minNR;
                    max = this.maxNR;
                    break;
                case 'economy':
                    min = this.minEconomyNR;
                    max = this.maxEconomyNR;
                    break;
                case 'industry':
                    min = this.minIndustryNR;
                    max = this.maxIndustryNR;
                    break;
                case 'science':
                    min = this.minScienceNR;
                    max = this.maxScienceNR;
                    break;
            }

            switch (this.distributionModeNR) {
                case 'unweighted':
                    for (const star of this.stars) {
                        const resources = this.randomIntBetweenExp(min, max);
                        this.setStarNRValues(star, type, resources);
                        this.updateStarForNRChange(star);
                    }
                    break;
                case 'weighted':
                    for (const star of this.stars) {
                        const resources = this.randomIntBetweenExp(min, max, this.lowValueBiasNR);
                        this.setStarNRValues(star, type, resources);
                        this.updateStarForNRChange(star);
                    }
                    break;
                case 'weightedRadius':
                    let selectionForRadius: Location[];
                    if (this.centerNR === 'galaxy') {
                        selectionForRadius = this.galaxy.stars.map(s => s.location);
                    } else selectionForRadius = this.stars.map(s => s.location);

                    const selectionCenter = this.getSelectionCenter(selectionForRadius, this.centerTypeNR);
                    const selectionRadius = helper.calculateSelectionRadiusFromPoint(selectionForRadius, selectionCenter);

                    for (const star of this.stars) {
                        const radius = helper.getDistanceBetweenLocations(selectionCenter, star.location);
                        const resources = this.randomIntBetweenExp(min, max, (radius / selectionRadius * this.radiusWeightNR + this.lowValueBiasNR));
                        this.setStarNRValues(star, type, resources);
                        this.updateStarForNRChange(star);
                    }
                    break;
            }

            if (type !== 'all' && !useGalaxyStore().$state.isSplitNaturalResources) {
                useGalaxyStore().setIsSplitNaturalResources(true);
                if (storage.getSettings().visual.resources === 'numbers') this.galaxy.stars.forEach(s => editor.reloadStar(s)); // Update NR display
            }
        },
        setStarNRValues(star: Star, type: 'economy' | 'industry' | 'science' | 'all', value: number) {
            switch (type) {
                case 'economy':
                    star.naturalResources.economy = value;
                    break;
                case 'industry':
                    star.naturalResources.industry = value;
                    break;
                case 'science':
                    star.naturalResources.science = value;
                    break;
                case 'all':
                    star.naturalResources = { economy: value, industry: value, science: value };
                    break;
            }
        },
        validateNRInputs(type: 'economy' | 'industry' | 'science' | 'all') {
            switch (type) {
                case 'economy':
                    return this.validateInputs('minEconomyNRInput', 'maxEconomyNRInput', 'lowValueBiasNRInput', 'radiusWeightNRInput');
                case 'industry':
                    return this.validateInputs('minIndustryNRInput', 'maxIndustryNRInput', 'lowValueBiasNRInput', 'radiusWeightNRInput');
                case 'science':
                    return this.validateInputs('minScienceNRInput', 'maxScienceNRInput', 'lowValueBiasNRInput', 'radiusWeightNRInput');
                case 'all':
                    return this.validateInputs('minNRInput', 'maxNRInput', 'lowValueBiasNRInput', 'radiusWeightNRInput');
            }
        },
        updateStarForNRChange(star: Star) {
            if (helper.isDeadStar(star)) {
                star.warpGate = false;
                star.specialist = undefined;
                star.specialistExpireTick = null;
            }
            editor.reloadStar(star);
        },
        randomiseInfra(type: 'economy' | 'industry' | 'science') {
            this.errors.length = 0;
            if (!this.validateInfraInputs(type)) return;

            let min = 0;
            let max = 0;

            switch (type) {
                case 'economy':
                    min = this.minEconomyInfra;
                    max = this.maxEconomyInfra;
                    break;
                case 'industry':
                    min = this.minIndustryInfra;
                    max = this.maxIndustryInfra;
                    break;
                case 'science':
                    min = this.minScienceInfra;
                    max = this.maxScienceInfra;
                    break;
            }

            switch (this.distributionModeInfra) {
                case 'unweighted':
                    for (const star of this.stars) {
                        const resources = this.randomIntBetweenExp(min, max);
                        this.setStarInfraValues(star, type, resources);
                        editor.reloadStar(star);
                    }
                    break;
                case 'weighted':
                    for (const star of this.stars) {
                        const resources = this.randomIntBetweenExp(min, max, this.lowValueBiasNR);
                        this.setStarInfraValues(star, type, resources);
                        editor.reloadStar(star);
                    }
                    break;
                case 'weightedRadius':
                    let selectionForRadius: Location[];
                    if (this.centerNR === 'galaxy') {
                        selectionForRadius = this.galaxy.stars.map(s => s.location);
                    } else selectionForRadius = this.stars.map(s => s.location);

                    const selectionCenter = this.getSelectionCenter(selectionForRadius, this.centerTypeNR);
                    const selectionRadius = helper.calculateSelectionRadiusFromPoint(selectionForRadius, selectionCenter);

                    for (const star of this.stars) {
                        const radius = helper.getDistanceBetweenLocations(selectionCenter, star.location);
                        const resources = this.randomIntBetweenExp(min, max, (radius / selectionRadius * this.radiusWeightInfra + this.lowValueBiasInfra));
                        this.setStarInfraValues(star, type, resources);
                        editor.reloadStar(star);
                    }
                    break;
            }
        },
        setStarInfraValues(star: Star, type: 'economy' | 'industry' | 'science', value: number) {
            switch (type) {
                case 'economy':
                    star.infrastructure.economy = value;
                    break;
                case 'industry':
                    star.infrastructure.industry = value;
                    break;
                case 'science':
                    star.infrastructure.science = value;
                    break;
            }
        },
        validateInfraInputs(type: 'economy' | 'industry' | 'science') {
            switch (type) {
                case 'economy':
                    return this.validateInputs('minEconomyInfraInput', 'maxEconomyInfraInput', 'lowValueBiasInfraInput', 'radiusWeightInfraInput');
                case 'industry':
                    return this.validateInputs('minIndustryInfraInput', 'maxIndustryInfraInput', 'lowValueBiasInfraInput', 'radiusWeightInfraInput');
                case 'science':
                    return this.validateInputs('minScienceInfraInput', 'maxScienceInfraInput', 'lowValueBiasInfraInput', 'radiusWeightInfraInput');
            }
        },
        randomiseTerrain(type: 'asteroidField' | 'binary' | 'blackHole' | 'nebula' | 'pulsar' | 'warpGate' | 'wormHole', reloadStars: boolean = true) {
            this.errors.length = 0;

            if (type === 'asteroidField') {
                if (!this.validateInputs('asteroidFieldPInput')) return;
                let count = Math.floor((this.stars.length - this.stars.filter(s => s.homeStar).length) / 100 * this.asteroidFieldP);

                const applicableStars = this.stars.filter(s => !s.homeStar);
                helper.shuffleArray(applicableStars);

                const selectedStarIds = new Set<string>;
                applicableStars.map(s => s.id).slice(0, Math.max(count, 0)).forEach(id => selectedStarIds.add(id));

                for (const star of this.stars) {
                    if (selectedStarIds.has(star.id)) {
                        star.isAsteroidField = true;
                    } else star.isAsteroidField = false;
                }
            } else if (type === 'binary') {
                if (!this.validateInputs('binaryPInput')) return;
                let count = Math.floor((this.stars.length - this.stars.filter(s => s.homeStar).length) / 100 * this.binaryP);

                const applicableStars = this.stars.filter(s => !s.homeStar);
                helper.shuffleArray(applicableStars);

                const selectedStarIds = new Set<string>;
                applicableStars.map(s => s.id).slice(0, Math.max(count, 0)).forEach(id => selectedStarIds.add(id));

                for (const star of this.stars) {
                    if (selectedStarIds.has(star.id)) {
                        star.isBinaryStar = true;
                    } else star.isBinaryStar = false;
                }
            } else if (type === 'blackHole') {
                if (!this.validateInputs('blackHolePInput')) return;
                let count = Math.floor((this.stars.length - this.stars.filter(s => s.homeStar).length) / 100 * this.blackHoleP);

                const applicableStars = this.stars.filter(s => !s.homeStar);
                helper.shuffleArray(applicableStars);

                const selectedStarIds = new Set<string>;
                applicableStars.map(s => s.id).slice(0, Math.max(count, 0)).forEach(id => selectedStarIds.add(id));

                for (const star of this.stars) {
                    if (selectedStarIds.has(star.id)) {
                        star.isBlackHole = true;
                    } else star.isBlackHole = false;
                }
            } else if (type === 'nebula') {
                if (!this.validateInputs('nebulaPInput')) return;
                let count = Math.floor((this.stars.length - this.stars.filter(s => s.homeStar).length) / 100 * this.nebulaP);

                const applicableStars = this.stars.filter(s => !s.homeStar);
                helper.shuffleArray(applicableStars);

                const selectedStarIds = new Set<string>;
                applicableStars.map(s => s.id).slice(0, Math.max(count, 0)).forEach(id => selectedStarIds.add(id));

                for (const star of this.stars) {
                    if (selectedStarIds.has(star.id)) {
                        star.isNebula = true;
                    } else star.isNebula = false;
                }
            } else if (type === 'pulsar') {
                if (!this.validateInputs('pulsarPInput')) return;
                let count = Math.floor((this.stars.length - this.stars.filter(s => s.homeStar).length) / 100 * this.pulsarP);

                const applicableStars = this.stars.filter(s => !s.homeStar);
                helper.shuffleArray(applicableStars);

                const selectedStarIds = new Set<string>;
                applicableStars.map(s => s.id).slice(0, Math.max(count, 0)).forEach(id => selectedStarIds.add(id));

                for (const star of this.stars) {
                    if (selectedStarIds.has(star.id)) {
                        star.isPulsar = true;
                    } else star.isPulsar = false;
                }
            } else if (type === 'warpGate') {
                if (!this.validateInputs('warpGatePInput')) return;
                let count = Math.floor((this.stars.length - this.stars.filter(s => s.homeStar).length) / 100 * this.warpGateP);

                const applicableStars = this.stars.filter(s => !s.homeStar && !helper.isDeadStar(s));
                helper.shuffleArray(applicableStars);

                const selectedStarIds = new Set<string>;
                applicableStars.map(s => s.id).slice(0, Math.max(count, 0)).forEach(id => selectedStarIds.add(id));

                for (const star of this.stars) {
                    if (selectedStarIds.has(star.id)) {
                        star.warpGate = true;
                    } else star.warpGate = false;
                }
            } else if (type === 'wormHole') {
                if (!this.validateInputs('wormHolePInput')) return;
                let count = Math.floor((this.stars.length - this.stars.filter(s => s.homeStar).length) / 2 / 100 * this.wormHoleP);

                const applicableStars = this.stars.filter(s => !s.homeStar && !helper.isDeadStar(s));
                helper.shuffleArray(applicableStars);

                const selectedStars = applicableStars.slice(0, Math.max(count, 0) * 2);

                for (const star of this.stars) {
                    star.wormHoleToStarId = null;
                }

                for (let i = 0; i < count; i++) {
                    const starA = selectedStars[i * 2];
                    const starB = selectedStars[i * 2 + 1];
                    starA.wormHoleToStarId = starB.id;
                    starB.wormHoleToStarId = starA.id;
                }
            }

            if (reloadStars) {
                for (const star of this.stars) {
                    editor.reloadStar(star);
                    editor.updateWormholes();
                }
            }
        },
        randomiseAllTerrain() {
            this.randomiseTerrain('asteroidField', false);
            this.randomiseTerrain('binary', false);
            this.randomiseTerrain('blackHole', false);
            this.randomiseTerrain('nebula', false);
            this.randomiseTerrain('pulsar', false);
            this.randomiseTerrain('warpGate', false);
            this.randomiseTerrain('wormHole', true);
        },
        randomIntBetweenExp(min: number, max: number, lowValueBias: number = 0.5) {
            if (lowValueBias <= 0 || lowValueBias >= 1) throw new Error('Invalid lowValueBias value!');

            const exp = Math.log(1 - lowValueBias) / Math.log(0.5);
            return Math.floor((Math.random() ** exp) * (max - min + 1) + min);
        },
        getSelectionCenter(selection: Location[], centerType: 'coordinate' | 'midpoint' | 'centroid'): Location {
            switch (centerType) {
                case 'coordinate':
                    return { x: 0, y: 0 };
                case 'midpoint':
                    return helper.calculateSelectionMidpoint(selection);
                case 'centroid':
                    return helper.calculateSelectionCentroid(selection);
            }
        },
        checkDistributionInputValidity(lowValueBiasInput: string, radiusWeightInput: string, distributionMode: 'unweighted' | 'weighted' | 'weightedRadius'): boolean {
            let isValid = true;
            if (distributionMode === 'unweighted') return true;

            (this.$refs[lowValueBiasInput] as HTMLInputElement).setCustomValidity('');
            (this.$refs[radiusWeightInput] as HTMLInputElement).setCustomValidity('');

            const lowValueBias = (this.$refs[lowValueBiasInput] as HTMLInputElement).valueAsNumber;
            const radiusWeight = (this.$refs[radiusWeightInput] as HTMLInputElement).valueAsNumber;

            if (distributionMode === 'weightedRadius' && (lowValueBias + radiusWeight <= 0 || lowValueBias + radiusWeight >= 1)) {
                (this.$refs[lowValueBiasInput] as HTMLInputElement).setCustomValidity('The sum of Low Value Bias and Radius Weight must be between 0 and 1 (exclusive).');
                (this.$refs[radiusWeightInput] as HTMLInputElement).setCustomValidity('The sum of Low Value Bias and Radius Weight must be between 0 and 1 (exclusive).');
                isValid = false;
            }

            if (lowValueBias <= 0 || lowValueBias >= 1) {
                (this.$refs[lowValueBiasInput] as HTMLInputElement).setCustomValidity('Low Value Bias must be between 0 and 1 (exclusive).');
                isValid = false;
            }

            if (radiusWeight <= -1 || radiusWeight >= 1) {
                (this.$refs[radiusWeightInput] as HTMLInputElement).setCustomValidity('Radius Weight must be between 0 and 1 (exclusive).');
                isValid = false;
            }

            return isValid;
        },
        validateInputs(...inputRefs: string[]): boolean {
            for (const inputRef of inputRefs) {
                const valid = (this.$refs[inputRef] as HTMLInputElement).checkValidity();
                if (!valid) {
                    (this.$refs[inputRef] as HTMLInputElement).reportValidity();
                    return false;
                }
            }
            return true;
        }
    },
    mounted() {
        if (this.selection == null || this.selection.length === 0) {
            this.stars = this.galaxy.stars;
        } else this.stars = this.selection;
        this.minNR = Math.round((this.minEconomyNR + this.minIndustryNR + this.minScienceNR) / 3);
        this.maxNR = Math.round((this.maxEconomyNR + this.maxIndustryNR + this.maxScienceNR) / 3);
    },
    beforeUnmount() {

    },
    computed: {
        galaxy: function () {
            return useGalaxyStore().$state.galaxy;
        },
        titleText: function () {
            return (this.selection == null || this.selection.length === 0) ? 'Randomise' : 'Randomise Selected';
        }
    }
}
</script>

<style scoped>
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

.form-control {
    display: block !important;
    width: 100% !important;
    padding: 0px 8px !important;
    font-size: 14px !important;
    font-weight: 300 !important;
    line-height: 1.5 !important;
    color: rgba(255, 255, 255, 0.75) !important;
    background-color: transparent !important;
    background-clip: padding-box !important;
    border: 1px solid rgba(255, 255, 255, .3);
    -webkit-appearance: none !important;
    -moz-appearance: none !important;
    appearance: none !important;
    border-radius: 4px !important;
    margin: 0 !important;
    opacity: 1 !important;
}

.form-control:disabled {
    opacity: 0.5 !important;
}

p {
    margin: 0;
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

.pre-textbox-span {
    margin-right: 6px;
}

.form-control.small-input {
    height: 20px;
}

.form-control.semi-small-input {
    height: 23px;
}

.form-control.large-input {
    height: 31px;
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

.form-control::placeholder {
    color: rgba(255, 255, 255, 0.5);
}

.text-warning {
    color: rgba(255, 159, 12, 1) !important;
}

.align-center {
    align-content: center;
    justify-content: center;
}

.align-end {
    align-content: center;
    justify-content: end;
}

h4 {
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

h5 {
    font-weight: 400;
    font-size: 18px;
    margin: 0;
}

.btn-ssm {
    --bs-btn-padding-y: 0px;
    --bs-btn-padding-x: 7.1px;
    --bs-btn-font-size: 14px;
}

.full-width-col {
    position: absolute;
    left: 50%;
    translate: -50% 0;
    width: fit-content;
}

.radius-weight-disabled {
    color: rgba(255, 255, 255, 0.4) !important;
}

.radius-weight-disabled:focus {
    color: rgba(255, 255, 255, 0.4) !important;
}


.nr-select-text {
    display: inline;
}

ul {
    margin: 0;
}

.error-text {
    font-size: 14px;
    font-weight: 400;
}

.slider-col {
    flex-shrink: 0 !important;
    flex-grow: 10 !important;
    flex-basis: 0 !important;
}

.slider-col-2 {
    flex-shrink: 0 !important;
    flex-grow: 0 !important;
    flex-basis: 40% !important;
}
</style>