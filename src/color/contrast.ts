import { hexToRgb } from "./conversions";

export function foreground(hex: string) {
    const { r, g, b } = hexToRgb(hex);
    const [red, green, blue] = [r, g, b].map((value) => {
        const channel = value / 255;
        return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
    });
    return red * 0.2126 + green * 0.7152 + blue * 0.0722 < 0.2 ? "#FFFFFF" : "#000000";
}
