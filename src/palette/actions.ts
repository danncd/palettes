import { createColor, defaultColor, initialColors, MIN_COLORS, MAX_COLORS } from "./defaults";
import { saveSnapshot, setColor } from "./history";
import { normalizeHex, rgbToHex } from "../color/conversions";
import type { PaletteState } from "./model";

export function randomColor(random = Math.random) {
    return rgbToHex(
        ...([0, 0, 0].map(() => Math.floor(random() * 256)) as [number, number, number]),
    );
}

export function generate(state: PaletteState, random = Math.random) {
    const selected = state.colors.find((color) => color.id === state.selectedId);
    if (selected && !selected.locked) state.selectedId = null;
    const next = state.colors.map((color) => (color.locked ? color.hex : randomColor(random)));
    if (next.every((hex, index) => hex === state.colors[index].hex)) return;
    saveSnapshot(state);
    state.colors.forEach((color, index) => setColor(color, next[index]));
}

export function editColor(state: PaletteState, id: string, value: string) {
    const hex = normalizeHex(value);
    const color = state.colors.find((item) => item.id === id);
    if (!hex || !color || hex === color.hex) return;
    saveSnapshot(state);
    setColor(color, hex);
}

export function toggleLock(state: PaletteState, id: string) {
    const color = state.colors.find((item) => item.id === id);
    if (!color) return;
    saveSnapshot(state);
    color.locked = !color.locked;
}

export function addColor(state: PaletteState) {
    if (state.colors.length >= MAX_COLORS) return;
    saveSnapshot(state);
    state.colors.push(createColor(defaultColor(state.colors.length)));
}

export function removeColor(state: PaletteState) {
    if (state.colors.length <= MIN_COLORS) return;
    saveSnapshot(state);
    const removed = state.colors.pop()!;
    if (removed.id === state.selectedId) state.selectedId = null;
}

export function resetPalette(state: PaletteState) {
    saveSnapshot(state);
    state.colors = initialColors(state.initialPreset);
    state.selectedId = null;
}
