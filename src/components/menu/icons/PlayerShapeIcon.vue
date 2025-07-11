<template>
    <div class="player-shape" :style="{ color: colour }">
        <svg v-if="shape === 'circle'" xmlns="http://www.w3.org/2000/svg" id="svg8" version="1.1"
            viewBox="0 0 67.733332 67.733332" height="32" width="32">
            <defs id="defs2" />
            <g transform="translate(1.1135254e-6,-229.26667)" id="layer1-3">
                <circle r="17.904133" cy="263.13333" cx="33.866665" id="path3127"
                    style="opacity:1;vector-effect:none;fill:none;fill-opacity:1;fill-rule:evenodd;stroke:currentColor;stroke-width:7;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-dashoffset:0;stroke-opacity:1" />
            </g>
        </svg>
        <svg v-if="shape === 'diamond'" xmlns="http://www.w3.org/2000/svg" id="svg8" version="1.1"
            viewBox="0 0 67.733332 67.733332" height="32" width="32">
            <defs id="defs2" />
            <g transform="matrix(0.81,0,0,0.81,6.4346683,-179.27132)" id="layer1-35">
                <rect transform="rotate(-45)" ry="0" rx="0" y="190.48242" x="-181.64427" height="39.056538"
                    width="39.056538" id="rect4489-6"
                    style="fill:none;fill-opacity:0.97461925;stroke:currentColor;stroke-width:7.51285982;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:20;stroke-dasharray:none;stroke-dashoffset:981.35430908;stroke-opacity:1;paint-order:fill markers stroke" />
            </g>
        </svg>
        <svg v-if="shape === 'hexagon'" xmlns="http://www.w3.org/2000/svg" id="svg8" version="1.1"
            viewBox="0 0 67.733332 67.733332" height="32" width="32">
            <defs id="defs2" />
            <g id="layer1-7" transform="translate(-3.6024484e-6,-229.26666)"
                style="stroke-width:6.8791666;stroke-miterlimit:4;stroke-dasharray:none">
                <path
                    d="m 53.250523,263.13333 -9.691929,16.78691 H 24.174742 l -9.691926,-16.78691 9.691926,-16.78691 h 19.383854 z"
                    id="path3006"
                    style="fill:none;fill-opacity:0.97461925;stroke:currentColor;stroke-width:6.8791666;stroke-linecap:square;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-dashoffset:0;stroke-opacity:1;paint-order:normal" />
            </g>
        </svg>
        <svg v-if="shape === 'square'" xmlns="http://www.w3.org/2000/svg" id="svg8" version="1.1"
            viewBox="0 0 67.733332 67.733332" height="32" width="32">
            <defs id="defs2" />
            <g transform="translate(59.172784,-277.07573)" id="layer1-6">
                <rect ry="0" rx="0" y="294.12378" x="-42.124722" height="33.637207" width="33.637207" id="rect4489"
                    style="fill:none;fill-opacity:0.97461925;stroke:currentColor;stroke-width:6.61458302;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:20;stroke-dasharray:none;stroke-dashoffset:981.35430908;stroke-opacity:1;paint-order:fill markers stroke" />
            </g>
        </svg>
    </div>
</template>

<script lang="ts">
export default {
    props: {
        colour: String,
        shape: String
    }
}
</script>

<style scoped></style>