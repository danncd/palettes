export type PaletteColor = {
    id: string;
    hex: string;
    locked: boolean;
    previousHexes: string[];
};

export type PaletteState = {
    initialPreset: number;
    colors: PaletteColor[];
    selectedId: string | null;
    snapshots: PaletteColor[][];
};
