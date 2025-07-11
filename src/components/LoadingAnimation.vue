<template>
    <div class="text-center" v-show="loading">
        <div v-show="!hideSpinner">
            <div v-show="spinnerId === 'binary'" id="spinnerCircle">
                <img src="../assets/map-objects/128x128_star_scannable.svg" id="star1">
                <img src="../assets/map-objects/128x128_star_scannable.svg" id="star2">
            </div>
            <div v-show="spinnerId === 'star'" id="stationaryContainer">
                <img src="../assets/map-objects/128x128_star_scannable.svg" id="star">
            </div>
            <div v-show="spinnerId === 'probe'" id="stationaryContainerVeryLarge">
                <img src="../assets/specialists/spoutnik.svg" id="probe">
                <img src="../assets/map-objects/128x128_star_black_hole.svg" id="blackHole">
            </div>
            <div v-show="spinnerId === 'connection'" id="stationaryContainerLarge">
                <img src="../assets/specialists/radar-dish.svg" id="connection">
                <div id="quarterCircle1"></div>
                <div id="quarterCircle2"></div>
                <div id="quarterCircle3"></div>
            </div>
            <div v-show="spinnerId === 'vortex'" id="stationaryContainer">
                <img src="../assets/stars/vortex.png" id="vortex">
            </div>
            <div v-show="spinnerId === 'clone'" id="stationaryContainerVeryLarge">
                <img src="../assets/specialists/cryo-chamber.svg" id="cryoChamber">
                <img src="../assets/specialists/hazmat-suit.svg" id="clone1">
                <img src="../assets/specialists/hazmat-suit.svg" id="clone2">
            </div>
        </div>
        <p v-if="!hideText">{{ text || 'Loading...' }}</p>
    </div>
</template>

<script lang="ts">
import '../assets/map-objects/128x128_star_scannable.svg';
import '../assets/specialists/spoutnik.svg';
import '../assets/map-objects/128x128_star_black_hole.svg';
import '../assets/specialists/radar-dish.svg';
import '../assets/stars/vortex.png';
import '../assets/specialists/cryo-chamber.svg';
import '../assets/specialists/hazmat-suit.svg';

export default {
    props: {
        loading: Boolean,
        text: String,
        hideText: Boolean,
        hideSpinner: Boolean,
        spinnerId: String
    }
}
</script>

<style scoped>
.text-center {
    align-content: center;
    font-family: Chakra Petch;
}

#stationaryContainer {
    position: relative;
    display: inline-block;
    width: 36px;
    height: 36px;
    margin-top: 6px;
    margin-bottom: 3px;
}

#stationaryContainerLarge {
    position: relative;
    display: inline-block;
    width: 48px;
    height: 36px;
    margin-top: 6px;
    margin-bottom: 3px;
}

#stationaryContainerVeryLarge {
    position: relative;
    display: inline-block;
    width: 80px;
    height: 48px;
    margin-top: 6px;
    margin-bottom: 3px;
    overflow: hidden;
}

#spinnerCircle {
    position: relative;
    display: inline-block;
    width: 36px;
    height: 36px;
    animation: rotate 4s linear infinite;
    border-radius: 50%;
    margin-top: 6px;
    margin-bottom: 3px;
}

#star {
    height: 36px;
    width: 36px;
    animation: rotate 2s linear infinite;
}

#star1,
#star2 {
    position: absolute;
    display: block;
    height: 32px;
    width: 32px;
    animation: inherit;
    animation-direction: reverse;
}

#star1 {
    top: 12px;
    left: 12px;
}

#star2 {
    bottom: 12px;
    right: 12px;
}

#probe {
    position: absolute;
    width: 16px;
    height: 16px;
    left: 0;
    top: 0;
    rotate: -5deg;
    animation: fly 15s linear infinite;
}

#blackHole {
    position: absolute;
    width: 24px;
    height: 24px;
    right: 0;
    bottom: 0;
}

#connection {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 28px;
    height: 28px;
}

#quarterCircle1 {
    position: absolute;
    left: 20px;
    bottom: 15px;
    width: 11px;
    height: 11px;

    border-radius: 50%;
    border: solid white;
    border-width: 0 1px 0 0;
    rotate: -23deg;

    opacity: 0;
    animation: ping 6s linear infinite 0s;
}

#quarterCircle2 {
    position: absolute;
    left: 18px;
    bottom: 13px;
    width: 16px;
    height: 16px;

    border-radius: 50%;
    border: solid white;
    border-width: 0 1px 0 0;
    rotate: -23deg;

    opacity: 0;
    animation: ping 6s linear infinite 1s;
}

#quarterCircle3 {
    position: absolute;
    left: 16px;
    bottom: 11px;
    width: 21px;
    height: 21px;

    border-radius: 50%;
    border: solid white;
    border-width: 0 1px 0 0;
    rotate: -23deg;

    opacity: 0;
    animation: ping 6s linear infinite 2s;
}

#vortex {
    height: 36px;
    width: 36px;
    animation: rotate 1.5s linear infinite;
}

#cryoChamber {
    position: absolute;
    left: 0;
    bottom: 0;
    height: 32px;
    width: 32px;
    z-index: 2;
    background-color: black;
}

#clone1 {
    position: absolute;
    left: 0;
    bottom: 0;
    height: 24px;
    width: 24px;
    z-index: 1;
    animation: spawn 4s linear infinite 0s;
}

#clone2 {
    position: absolute;
    left: 0;
    bottom: 0;
    height: 24px;
    width: 24px;
    z-index: 1;
    animation: spawn 4s linear infinite 2s;
}

@keyframes rotate {
    100% {
        transform: rotate(360deg);
    }
}

@keyframes fly {
    100% {
        transform: translate(72px, 40px);
        opacity: 0.4;
        scale: 0.8;
    }
}

@keyframes ping {
    20% {
        opacity: 1;
    }

    70% {
        opacity: 0;
    }
}

@keyframes spawn {
    100% {
        transform: translate(96px, 0px);
    }
}
</style>