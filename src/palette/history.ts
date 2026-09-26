import { HISTORY_LIMIT } from "./defaults";
import type { PaletteState, PaletteColor } from "./model";

export function saveSnapshot(state: PaletteState) {
    state.snapshots.push(structuredClone(state.colors));
    if (state.snapshots.length > HISTORY_LIMIT) state.snapshots.shift();
}

export function setColor(color: PaletteColor, hex: string) {
    if (hex === color.hex) return;
    color.previousHexes.push(color.hex);
    if (color.previousHexes.length > HISTORY_LIMIT) color.previousHexes.shift();
    color.hex = hex;
}

export function undoColor(state: PaletteState, id: string) {
    const color = state.colors.find((item) => item.id === id);
    if (!color?.previousHexes.length) return;
    saveSnapshot(state);
    color.hex = color.previousHexes.pop()!;
}

export function undoPalette(state: PaletteState) {
    const previous = state.snapshots.pop();
    if (!previous) return;
    state.colors = previous;
    if (!state.colors.some((color) => color.id === state.selectedId)) state.selectedId = null;
}
