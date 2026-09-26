export async function copyHex(hex: string) {
    if (!navigator.clipboard) throw new Error("Clipboard is unavailable in this browser.");
    await navigator.clipboard.writeText(hex);
}
