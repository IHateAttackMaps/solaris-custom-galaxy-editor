import { defineStore } from "pinia";
import type { MenuState } from "../scripts/types/MenuStates";
import editor from "@/scripts/editor";
import type { Star } from "@/scripts/types/Star";

export const useMenuStateStore = defineStore({
    id: 'menuState',
    state: () => ({
        menuState: 'none' as MenuState,
        args: [] as any[],
        selection: [] as Star[]
    }),
    getters: {
        getMenuState: (state) => state.menuState,
        getMenuArgs: (state) => state.args,
        getSelection: (state) => state.selection
    },
    actions: {
        setMenuState(menuState: MenuState) {
            this.$state.menuState = menuState;
            this.$state.args = [];

            editor.onMenuToggled(this.$state.menuState !== 'none');
        },
        setMenuArgs(args: Array<unknown>) {
            this.$state.args = args;
        },
        setMenu(menuState: MenuState, args: Array<any>) {
            this.setMenuState(menuState);
            this.setMenuArgs(args);

            editor.onMenuToggled(this.$state.menuState !== 'none');
        },
        toggleMenuState(menuState: MenuState) {
            if (this.$state.menuState !== menuState) {
                this.$state.menuState = menuState;
            } else this.$state.menuState = 'none';

            editor.onMenuToggled(this.$state.menuState !== 'none');
        },
        clearSelection() {
            this.selection.length = 0;
        },
        addStarToSelection(star: Star) {
            const index = this.selection.findIndex(s => s.id === star.id);
            if (index !== -1) return;
            this.selection.push(star);
        },
        addStarsToSelection(stars: Star[]) {
            const newStars = stars.filter(star => this.selection.findIndex(s => s.id === star.id) === -1);
            this.selection.push(...newStars);
        },
        removeStarFromSelection(starId: string) {
            const index = this.selection.findIndex(s => s.id === starId);
            if (index === -1) return;
            this.selection.splice(index, 1);
        },
        removeStarsFromSelection(starIds: string[]) {
            // Do not do this.selection = newArray, that breaks starSelection
            const newArray = this.selection.filter(s => !starIds.includes(s.id));
            this.selection.splice(0, this.selection.length);
            this.selection.push(...newArray);
        },
        updateSelectionStar(star: Star) {
            const index = this.selection.findIndex(s => s.id === star.id);
            if (index === -1) return;
            this.selection[index] = star;
        }
    }
});