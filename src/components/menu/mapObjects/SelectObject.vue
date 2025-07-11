<template>
    <div class="menu-page">
        <menu-title :title="'Select Object'" />

        <div class="table-responsive">
            <table class="table">
                <tbody>
                    <tr v-for="mapObject in mapObjects" :key="mapObject.id">
                        <td v-if="mapObject.type === 'star'" class="icon-td ps-2 pe-2" @click="openObjectDetail(mapObject)">
                            <map-object-icon-container :shape="getPlayerShape(mapObject)"
                                :colour="getPlayerColour(mapObject)">
                                <specialist-icon :type="'star'" :default-icon="'star'"
                                    :specialist="mapObject.data.specialist" />
                            </map-object-icon-container>
                        </td>
                        <td v-if="mapObject.type === 'carrier'" class="icon-td ps-2 pe-2" @click="openObjectDetail(mapObject)">
                            <map-object-icon-container :shape="getPlayerShape(mapObject)"
                                :colour="getPlayerColour(mapObject)">
                                <specialist-icon :type="'carrier'" :default-icon="'rocket'"
                                    :specialist="mapObject.data.specialist" />
                            </map-object-icon-container>
                        </td>
                        <td class="bg-dark-custom ps-2 pe-2 text-center auto-width">
                            <span class="ps-2 pe-2">
                                {{ mapObject.data.ships }}
                            </span>
                        </td>
                        <td class="ps-2 pe-2">
                            <span>
                                <a href="javascript:;" @click.prevent="openObjectDetail(mapObject)">{{ mapObject.data.id
                                }}</a>
                            </span>
                        </td>
                        <td class="text-end ps-2 pe-2">
                            <span :title="`Waypoints${mapObject.data.waypointsLooped ? ' (looped)' : ''}`"
                                v-if="mapObject.type === 'carrier' && mapObject.data.waypoints.length">
                                <i class="fas fa-map-marker-alt"></i>
                                <i class="fas fa-sync ms-1" v-if="mapObject.data.waypointsLooped"></i>
                                {{ mapObject.data.waypoints.length }}
                            </span>
                        </td>
                        <td class="ps-2 pe-2">
                            <span
                                :title="`${mapObject.data.orbiting ? `Orbiting ${mapObject.data.orbiting}` : `Flying to ${mapObject.data.waypoints[0].destination}`}`"
                                v-if="mapObject.type === 'carrier'">
                                <i class="fas fa-star" v-if="mapObject.data.orbiting"></i>
                                <i class="fas fa-arrow-right" v-if="!mapObject.data.orbiting"></i>
                            </span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script lang="ts">
import helper from '@/scripts/helper';
import MenuTitle from '../MenuTitle.vue';
import SpecialistIcon from '../icons/SpecialistIcon.vue';
import MapObjectIconContainer from '../icons/MapObjectIconContainer.vue';
import editor from '@/scripts/editor';

export default {
    components: {
        'menu-title': MenuTitle,
        'specialist-icon': SpecialistIcon,
        'map-object-icon-container': MapObjectIconContainer
    },
    props: {
        mapObjects: Array<any>
    },
    methods: {
        getPlayerColour(mapObject: any) {
            const player = helper.getPlayerById(mapObject.data.playerId);
            if (!player) return '#000000';
            return player.colour.value;
        },
        getPlayerShape(mapObject: any) {
            const player = helper.getPlayerById(mapObject.data.playerId);
            if (!player) return;
            return player.shape;
        },
        openObjectDetail(mapObject: any) {
            switch (mapObject.type) {
                case 'star':
                    editor.map!.clickStar(mapObject.data.id);
                    break;
                case 'carrier':
                    editor.map!.clickCarrier(mapObject.data.id);
                    break;
            }
        }
    }
}

</script>

<style scoped>
.table {
    --bs-table-bg: transparent;
    --bs-table-accent-bg: transparent;
    --bs-table-striped-color: rgba(255, 255, 255, 0.75);
    --bs-table-striped-bg: rgba(255, 255, 255, 0.1);
    --bs-table-active-color: rgba(255, 255, 255, 0.75);
    --bs-table-active-bg: rgba(255, 255, 255, 0.15);
    --bs-table-hover-color: rgba(255, 255, 255, 0.75);
    --bs-table-hover-bg: rgba(255, 255, 255, 0.075);
    color: rgba(255, 255, 255, .75) !important;
    border-color: rgba(255, 255, 255, .3);
    width: 100%;
    max-width: 100%;
    margin-top: 0 !important;
    margin-bottom: 0 !important;
}

.table-responsive {
    min-width: calc(100% + 12px);
    margin-left: -6px !important;
}

td {
    color: rgba(255, 255, 255, .75) !important;
    text-overflow: ellipsis !important;
    white-space: nowrap;
    overflow-x: hidden;
    font-weight: 300;
    vertical-align: middle !important;
    height: 34.5px;
}

tr {
    border-color: inherit;
    border-style: solid;
    border-width: 0;
}

.icon-td {
    width: 18%;
}

.bg-dark-custom {
    background-color: rgb(53, 67, 74) !important;
}

.auto-width {
    width: 0;
    white-space: nowrap;
}
</style>