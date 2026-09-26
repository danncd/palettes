import config from "../../config.json";
import type { PaletteColor, PaletteState } from "./model";

export const MIN_COLORS = 1;
export const MAX_COLORS = 8;
export const HISTORY_LIMIT = 100;

export function createColor(hex: string): PaletteColor {
    return { id: crypto.randomUUID(), hex: hex.toUpperCase(), locked: false, previousHexes: [] };
}

export function defaultColor(index: number) {
    return config.colors[index].toUpperCase();
}

export function initialColors(preset = 0) {
    return config.presets[preset].colors.map(createColor);
}

export function createState(random = Math.random): PaletteState {
    const initialPreset = Math.floor(random() * config.presets.length);
    return { initialPreset, colors: initialColors(initialPreset), selectedId: null, snapshots: [] };
}
