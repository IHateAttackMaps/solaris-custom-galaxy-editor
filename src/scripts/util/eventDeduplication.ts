import type { ICanvas } from "pixi.js";

export const attachEventDeduplication = (topLevel: HTMLElement, targetView: ICanvas) => {
    let lastEvent: any = null;

    topLevel.addEventListener('pointerup', (e) => {
        if (e.target === targetView) {
            lastEvent = {
                clientX: e.clientX,
                clientY: e.clientY,
                timeStamp: e.timeStamp
            };
        }
    }, true);

    // Prevent input elements from triggering
    topLevel.addEventListener('touchend', (e) => {
        if (lastEvent && e.timeStamp <= lastEvent.timeStamp + 100 && e.cancelable) {
            e.stopImmediatePropagation();
            e.preventDefault();
        }
    }, true);

    topLevel.addEventListener('click', (e) => {
        // We have just set lastEvent if this is true, so resetting it would prevent us from actually deduplicating the event.
        if (e.target === targetView) return;

        if (lastEvent && e.timeStamp <= lastEvent.timeStamp + 100 && e.cancelable) {
            e.stopImmediatePropagation();
            e.preventDefault();
        }

        lastEvent = null;
    }, true);
};