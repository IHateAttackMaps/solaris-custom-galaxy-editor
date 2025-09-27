<template>
    <div id="galaxyEditor">
        <loading-animation :loading="!galaxyIsReady" :spinner-id="getRandomLoadingAnimation()" id="loadingSpinner" />
    </div>
</template>

<script lang="ts">
import GalaxyEditor from '@/scripts/editor';
import storage from '@/scripts/storage';
import { useGalaxyStore } from '@/stores/galaxy';
import { attachEventDeduplication } from '@/scripts/util/eventDeduplication';
import LoadingAnimation from './LoadingAnimation.vue';
import { storeToRefs } from 'pinia';
import { useMenuStateStore } from '@/stores/menuState';
import type { Star } from '@/scripts/types/Star';
import type { Carrier } from '@/scripts/types/Carrier';
import helper from '@/scripts/helper';
//import testJSON from '../../testing/custom_2.json'; // JSON for testing
//import type { Galaxy } from '@/scripts/types/Galaxy';

export default {
    components: {
        'loading-animation': LoadingAnimation
    },
    data() {
        return {
            galaxyEditor: GalaxyEditor,
            galaxyIsReady: storeToRefs(useGalaxyStore()).galaxyIsReady
        }
    },

    created() {
        window.addEventListener('resize', this.handleResize);
    },

    async mounted() {
        this.galaxyEditor = GalaxyEditor;

        await this.galaxyEditor.setupApp();

        /*---------- TESTING -----------
        const galaxy = {
            stars: testJSON.stars,
            players: testJSON.players,
            carriers: testJSON.carriers
        } as unknown as Galaxy;

        useGalaxyStore().setGalaxy(galaxy);
        //-----------------------------*/

        useGalaxyStore().setGalaxy({
            players: [],
            stars: [],
            carriers: []
        });
        await this.loadGalaxy();

        this.$el.appendChild(this.galaxyEditor.app!.canvas); // Add the galaxy canvas to the screen.

        await this.drawGalaxy();

        const editorRoot = document.getElementById("editor");
        attachEventDeduplication(editorRoot!, this.galaxyEditor.app!.canvas);

        // Bind to galaxy events.
        this.galaxyEditor.map!.on('onStarClicked', this.onStarClicked.bind(this));
        this.galaxyEditor.map!.on('onStarRightClicked', this.onStarRightClicked.bind(this));
        this.galaxyEditor.map!.on('onCarrierClicked', this.onCarrierClicked.bind(this));
        this.galaxyEditor.map!.on('onCarrierRightClicked', this.onCarrierRightClicked.bind(this));
        this.galaxyEditor.map!.on('onObjectsClicked', this.onObjectsClicked.bind(this));

        useGalaxyStore().setGalaxyIsReady(true);
    },

    beforeUnmount() {
        window.removeEventListener('resize', this.handleResize);

        this.galaxyEditor.map!.off('onStarClicked', this.onStarClicked.bind(this));
        this.galaxyEditor.map!.off('onStarRightClicked', this.onStarRightClicked.bind(this));
        this.galaxyEditor.map!.off('onCarrierClicked', this.onCarrierClicked.bind(this));
        this.galaxyEditor.map!.off('onCarrierRightClicked', this.onCarrierRightClicked.bind(this));
        this.galaxyEditor.map!.off('onObjectsClicked', this.onObjectsClicked.bind(this));

        this.galaxyEditor.destroy();
    },

    methods: {
        async loadGalaxy() {
            await this.galaxyEditor.setupViewport();
            await this.galaxyEditor.setup(storage.getSettings());
        },
        updateGalaxy() {
            this.galaxyEditor.reloadGalaxy(storage.getSettings());
        },
        async drawGalaxy() {
            await this.galaxyEditor.draw();
        },

        handleResize(e: any) {
            this.galaxyEditor.resize();
        },

        onStarClicked(e: Star) {
            this.$emit('onStarClicked', e.id);
            useMenuStateStore().setMenu('star', [e]);
        },
        onStarRightClicked(e: Star) {
            this.$emit('onStarRightClicked', e.id);
            if (e.playerId == null) return;
            const owner = helper.getPlayerById(e.playerId);
            if (owner == null) throw new Error(`Attempted to open menu of non-existent player (id ${e.playerId})!`);
            useMenuStateStore().setMenu('player', [owner]);
        },
        onCarrierClicked(e: Carrier) {
            this.$emit('onCarrierClicked', e.id);
            useMenuStateStore().setMenu('carrier', [e]);
        },
        onCarrierRightClicked(e: Carrier) {
            this.$emit('onCarrierRightClicked', e.id);
            if (e.playerId == null) return;
            const owner = helper.getPlayerById(e.playerId);
            if (owner == null) throw new Error(`Attempted to open menu of non-existent player (id ${e.playerId})!`);
            useMenuStateStore().setMenu('player', [owner]);
        },
        onObjectsClicked(e: any) {
            this.$emit('onObjectsClicked', e);
            useMenuStateStore().setMenu('selectObject', e);
        },
        getRandomLoadingAnimation() {
            const animations = ['binary', 'star', 'probe', 'connection', 'vortex', 'clone'];
            const index = Math.floor(Math.random() * (animations.length));
            return animations[index];
        }
    }
}

</script>

<style scoped>
#galaxyEditor {
    display: block;
    box-sizing: border-box;
    position: absolute;
    left: 0;
    top: 0;
    margin: 0;
    height: 100%;
    width: 100%;
    overflow: hidden;
    z-index: -1;
    background-color: black;
}

#loadingSpinner {
    color: white;
    position: relative;
    top: 50px;
    height: fit-content;
}
</style>