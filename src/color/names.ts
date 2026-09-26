declare global {
    interface Window {
        ntc?: { name(hex: string): [string, string, boolean] };
    }
}

export function colorName(hex: string) {
    return window.ntc?.name(hex)[1] ?? hex;
}
