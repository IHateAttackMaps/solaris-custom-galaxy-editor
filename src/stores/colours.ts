import type { PlayerShape } from '@/scripts/types/Player';
import { defineStore } from 'pinia';

export const usePlayerColourStore = defineStore({
    id: 'colours',
    state: () => ({
        colours: [
            {
                group: "Red",
                colours: [
                    {
                        alias: "Red",
                        value: "#ff0000"
                    },
                    {
                        alias: "Scarlet",
                        value: "#ff200d"
                    },
                    {
                        alias: "Electric red",
                        value: "#e60000"
                    },
                    {
                        alias: "Coral red",
                        value: "#ff4e2c"
                    }
                ]
            },
            {
                group: "Blue",
                colours: [
                    {
                        alias: "Blue",
                        value: "#0000ff"
                    },
                    {
                        alias: "Ultramarine",
                        value: "#2c13ff"
                    },
                    {
                        alias: "Rich blue",
                        value: "#0000ea"
                    },
                    {
                        alias: "Purplish blue",
                        value: "#6337ff"
                    }
                ]
            },
            {
                group: "Magenta",
                colours: [
                    {
                        alias: "Magenta",
                        value: "#ff00ff"
                    },
                    {
                        alias: "Bright magenta",
                        value: "#ff25ff"
                    },
                    {
                        alias: "Piercing pink",
                        value: "#e900ea"
                    },
                    {
                        alias: "Pink flamingo",
                        value: "#ff56ff"
                    }
                ]
            },
            {
                group: "Green",
                colours: [
                    {
                        alias: "Green",
                        value: "#008000"
                    },
                    {
                        alias: "Tree green",
                        value: "#198a10"
                    },
                    {
                        alias: "Moth green",
                        value: "#007700"
                    },
                    {
                        alias: "Apple",
                        value: "#40a731"
                    }
                ]
            },
            {
                group: "Aqua",
                colours: [
                    {
                        alias: "Cyan",
                        value: "#00ffff"
                    },
                    {
                        alias: "Aqua",
                        value: "#2dffff"
                    },
                    {
                        alias: "Bright turquoise",
                        value: "#00eaea"
                    },
                    {
                        alias: "Dark turquoise",
                        value: "#00d5d6"
                    }
                ]
            },
            {
                group: "Gray",
                colours: [
                    {
                        alias: "Gray",
                        value: "#808080"
                    },
                    {
                        alias: "Gunsmoke",
                        value: "#898989"
                    },
                    {
                        alias: "Steel wool",
                        value: "#777777"
                    },
                    {
                        alias: "Granite",
                        value: "#867e80"
                    }
                ]
            },
            {
                group: "Lime",
                colours: [
                    {
                        alias: "Lime",
                        value: "#00ff00"
                    },
                    {
                        alias: "Neon green",
                        value: "#2cff1e"
                    },
                    {
                        alias: "Electric green",
                        value: "#00ea00"
                    },
                    {
                        alias: "Greenalicious",
                        value: "#00d500"
                    }
                ]
            },
            {
                group: "Maroon",
                colours: [
                    {
                        alias: "Maroon",
                        value: "#800000"
                    },
                    {
                        alias: "Dark red",
                        value: "#8b110a"
                    },
                    {
                        alias: "Rusty red",
                        value: "#ab3322"
                    },
                    {
                        alias: "Chestnut red",
                        value: "#c24732"
                    }
                ]
            },
            {
                group: "Dull blue",
                colours: [
                    {
                        alias: "Submarine blue",
                        value: "#005080"
                    },
                    {
                        alias: "Dusk blue",
                        value: "#165889"
                    },
                    {
                        alias: "Regal blue",
                        value: "#004877"
                    },
                    {
                        alias: "Dull blue",
                        value: "#3c73a6"
                    }
                ]
            },
            {
                group: "Purple",
                colours: [
                    {
                        alias: "Purple",
                        value: "#800080"
                    },
                    {
                        alias: "Rich purple",
                        value: "#760077"
                    },
                    {
                        alias: "Medium orchid",
                        value: "#a838a6"
                    },
                    {
                        alias: "Deep fuchsia",
                        value: "#bd4dba"
                    }
                ]
            },
            {
                group: "Olive",
                colours: [
                    {
                        alias: "Olive",
                        value: "#808000"
                    },
                    {
                        alias: "Reef gold",
                        value: "#8a8911"
                    },
                    {
                        alias: "Browny green",
                        value: "#767700"
                    },
                    {
                        alias: "Brass",
                        value: "#a8a533"
                    }
                ]
            },
            {
                group: "Silver",
                colours: [
                    {
                        alias: "Silver",
                        value: "#e0e0e0"
                    },
                    {
                        alias: "White smoke",
                        value: "#f5f5f5"
                    },
                    {
                        alias: "Platinum",
                        value: "#e7dee0"
                    },
                    {
                        alias: "Pale pink",
                        value: "#fcd7e1"
                    }
                ]
            },
            {
                group: "Teal",
                colours: [
                    {
                        alias: "Teal",
                        value: "#008080"
                    },
                    {
                        alias: "Blue chill",
                        value: "#198989"
                    },
                    {
                        alias: "Deep sea",
                        value: "#007777"
                    },
                    {
                        alias: "Metallic blue",
                        value: "#377d7d"
                    }
                ]
            },
            {
                group: "Yellow",
                colours: [
                    {
                        alias: "Yellow",
                        value: "#ffff00"
                    },
                    {
                        alias: "Lemone",
                        value: "#ffff20"
                    },
                    {
                        alias: "Golden yellow",
                        value: "#e9ea00"
                    },
                    {
                        alias: "Citrine",
                        value: "#d2d600"
                    }
                ]
            },
            {
                group: "Pink",
                colours: [
                    {
                        alias: "Light pink",
                        value: "#ffb6c1"
                    },
                    {
                        alias: "Pale rose",
                        value: "#ffc0cb"
                    },
                    {
                        alias: "Rose",
                        value: "#f4acb7"
                    },
                    {
                        alias: "Dull pink",
                        value: "#d58f9a"
                    }
                ]
            },
            {
                group: "Orange",
                colours: [
                    {
                        alias: "Royal orange",
                        value: "#ff7a2a"
                    },
                    {
                        alias: "Mango orange",
                        value: "#ff8434"
                    },
                    {
                        alias: "Vivid orange",
                        value: "#f37020"
                    },
                    {
                        alias: "Tangerine",
                        value: "#ffa150"
                    }
                ]
            }
        ],
        shapes: ['circle', 'square', 'hexagon', 'diamond'] as PlayerShape[]
    }),
    getters: {

    },
    actions: {
        getAllColours() {
            return this.$state.colours.map((v) => v.colours).flat();
        },
        getAllGroupNames() {
            return this.$state.colours.map((v) => v.group);
        },
        getGroupColours(group: string) {
            return this.$state.colours.find((v) => v.group === group)?.colours;
        },
        /*
        getRandomUnusedColours(amount: number, tryUniqueGroups: boolean) {
            let colours = [];

            if (tryUniqueGroups) {
                const validGroups = this.getAllGroupNames().filter((s) => !this.$state.usedColourGroups.includes(s));
                if (validGroups.length < amount) {
                    _shuffleArray(validGroups);

                    for (const validGroup in validGroups) {
                        const groupColours = this.$state.colours.find((v) => v.group === validGroup)!.colours.slice();
                        _shuffleArray(groupColours);
                        colours.push(groupColours[0]);
                    }
                    return colours.slice(0, amount);
                }
                //throw new Error(`Could not provide enough unused colours from unique groups: not enough valid groups available!`);
            }
            colours = this.getAllColours();
            colours.filter((c) => !this.$state.usedColours.includes(c));
            _shuffleArray(colours);

            if (colours.length < amount) {
                return colours.slice(0, amount);
            }
            //throw new Error(`Could not provide enough unused colours: not enough valid colours available!`);
            colours = this.getAllColours();
            return colours;
        },
        getRandomUnusedColour(tryUniqueGroup: boolean) {
            this.getRandomUnusedColours(1, tryUniqueGroup);
        },
        addUsedColours(colours: Array<{ alias: string, value: string }>) {
            for (const colour of colours) {
                const group = this.$state.colours.find((v) => v.colours.map((c) => c.alias).includes(colour.alias))!;
                this.$state.usedColours.push(colour);
                this.$state.usedColourGroups.push(group.group);
            }
        },
        removeUsedColours(colours: Array<{ alias: string, value: string }>) {
            for (const colour of colours) {
                const group = this.$state.colours.find((v) => v.colours.map((c) => c.alias).includes(colour.alias))!;
                this.$state.usedColours = this.$state.usedColours.filter((c) => c.alias !== colour.alias);
                for (const usedColourAlias of this.$state.usedColours.map((c) => c.alias)) {
                    if (group.colours.map((c) => c.alias).includes(usedColourAlias)) return;
                }
                this.$state.usedColourGroups = this.$state.usedColourGroups.filter((g) => g !== group.group);
            }
        },
        */
        getAllCombos() {
            const combos = [];

            const colours = this.getAllColours();
            for (const colour of colours) {
                for (const shape of this.$state.shapes) {
                    combos.push({ shape: shape, colour: colour });
                }
            }

            return combos;
        },
        /*
        getRandomCombos(amount: number) {
            const combinations = this.getAllCombos();
            _shuffleArray(combinations);
            return combinations.slice(0, amount);
        }
            */
    }
});

/*
function _shuffleArray(array: Array<any>) {
    for (let i = array.length - 1; i >= 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
    */