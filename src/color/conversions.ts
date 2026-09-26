export function normalizeHex(value: string): string | null {
    const hex = value.trim().replace(/^#/, "");
    return /^[0-9a-f]{6}$/i.test(hex) ? `#${hex.toUpperCase()}` : null;
}

export function hexToRgb(hex: string) {
    const value = hex.replace("#", "");
    return {
        r: parseInt(value.slice(0, 2), 16),
        g: parseInt(value.slice(2, 4), 16),
        b: parseInt(value.slice(4, 6), 16),
    };
}

export function rgbToHex(r: number, g: number, b: number) {
    return (
        "#" +
        [r, g, b]
            .map((n) => Math.round(n).toString(16).padStart(2, "0"))
            .join("")
            .toUpperCase()
    );
}

export function rgbToHsl(r: number, g: number, b: number) {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    let l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }
        h /= 6;
    }

    return { h: h * 360, s, l };
}

export function hslToRgb(h: number, s: number, l: number) {
    let r, g, b;

    h /= 360;
    s = s || 0;
    l = l || 0;

    const temp1 = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const temp2 = 2 * l - temp1;

    function hueToRgb(p: number, q: number, t: number) {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
    }

    r = hueToRgb(temp2, temp1, h + 1 / 3);
    g = hueToRgb(temp2, temp1, h);
    b = hueToRgb(temp2, temp1, h - 1 / 3);

    return {
        r: Math.round(Math.min(Math.max(r * 255, 0), 255)),
        g: Math.round(Math.min(Math.max(g * 255, 0), 255)),
        b: Math.round(Math.min(Math.max(b * 255, 0), 255)),
    };
}
