import { hexToRgb, rgbToHsl, hslToRgb, rgbToHex } from "./conversions";

function adjustLightness(hex: string, amount: number) {
    const { r, g, b } = hexToRgb(hex);
    const hsl = rgbToHsl(r, g, b);
    const rgb = hslToRgb(hsl.h, hsl.s, Math.max(0, Math.min(1, hsl.l + amount)));
    return rgbToHex(rgb.r, rgb.g, rgb.b);
}

export function makeShades(hex: string) {
    const lighter: string[] = [];
    const darker: string[] = [];
    let light = hex;
    let dark = hex;
    for (let step = 0; step < 5; step++) {
        light = adjustLightness(light, 0.03);
        dark = adjustLightness(dark, -0.03);
        lighter.push(light);
        darker.push(dark);
    }
    return [...lighter.reverse(), hex, ...darker];
}
