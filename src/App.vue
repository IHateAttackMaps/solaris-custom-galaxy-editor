<script lang="ts">
import GalaxyContainer from './components/GalaxyContainer.vue';
import MainMenu from './components/menu/MainMenu.vue';

export default {
    name: 'App',
    components: {
        'galaxy-container': GalaxyContainer,
        'main-menu': MainMenu,
    },
    methods: {

    }
}
</script>

<template>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/5.3.3/css/bootstrap.min.css"
        integrity="sha512-jnSuA4Ss2PkkikSOLtYs8BlYIeeIK1h99ty4YfvRPAlzr377vr3CXDb7sb7eEEBYjDtcYj+AjBH3FLv5uSJuXg=="
        crossorigin="anonymous" />
    <main>
        <div id="editor">
            <main-menu />
            <galaxy-container />
        </div>
    </main>
</template>

<style scoped>
@import url(https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@300;500&display=swap);

header {
    line-height: 1.5;
}

.logo {
    display: block;
    margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
    header {
        display: flex;
        place-items: center;
        padding-right: calc(var(--section-gap) / 2);
    }

    .logo {
        margin: 0 2rem 0 0;
    }

    header .wrapper {
        display: flex;
        place-items: flex-start;
        flex-wrap: wrap;
    }
}

@font-face {
    font-family: Chakra Petch;
    src: url(https://fonts.gstatic.com/s/chakrapetch/v11/cIflMapbsEk7TDLdtEz1BwkebIl1R5_F.woff2) format(woff2);
}
</style>
