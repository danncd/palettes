import { foreground } from "../color/contrast";
import { colorName } from "../color/names";
import type { PaletteColor } from "../palette/model";

declare global {
    interface Window {
        html2canvas?: (
            element: HTMLElement,
            options: { backgroundColor: string; scale: number; logging: boolean },
        ) => Promise<HTMLCanvasElement>;
    }
}

export async function exportPng(colors: PaletteColor[]) {
    if (!window.html2canvas)
        throw new Error("Image export could not load. Please reload the page.");
    const palette = colors.map((color) => ({ ...color }));
    const surface = document.createElement("div");
    surface.className = "export-palette";
    for (const color of palette) {
        const swatch = document.createElement("div");
        swatch.style.backgroundColor = color.hex;
        swatch.style.color = foreground(color.hex);
        const hex = document.createElement("strong");
        hex.textContent = color.hex;
        const name = document.createElement("span");
        name.textContent = colorName(color.hex);
        swatch.append(hex, name);
        surface.append(swatch);
    }
    document.body.append(surface);
    try {
        const canvas = await window.html2canvas(surface, {
            backgroundColor: "#FFFFFF",
            scale: 2,
            logging: false,
        });
        const link = document.createElement("a");
        link.download = `${palette.map((color) => color.hex.slice(1)).join("-")}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
    } finally {
        surface.remove();
    }
}
