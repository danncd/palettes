import { icon, updateIcon } from "../app/icons";
import { colorName } from "../color/names";
import { foreground } from "../color/contrast";
import type { PaletteState } from "../palette/model";

function createSwatch(id: string) {
    const swatch = document.createElement("div");
    swatch.className = "swatch";
    swatch.dataset.colorId = id;
    swatch.innerHTML = `
        <div class="swatch-controls">
            <button class="icon-button" data-action="undo-color" aria-label="Undo color"></button>
            <button class="icon-button" data-action="lock" aria-label="Lock color"></button>
        </div>
        <button class="color-label" data-action="edit" aria-expanded="false" aria-controls="editor">
            <span class="hex"></span><span class="color-name"></span>
        </button>`;
    swatch.querySelector('[data-action="undo-color"]')!.append(icon("undo-2"));
    return swatch;
}

export function renderPalette(container: HTMLElement, state: PaletteState) {
    container.style.setProperty(
        "--swatches-min-height",
        `${Math.max(340, state.colors.length * 62)}px`,
    );
    for (const swatch of container.querySelectorAll<HTMLElement>(".swatch")) {
        if (!state.colors.some((color) => color.id === swatch.dataset.colorId)) swatch.remove();
    }
    state.colors.forEach((color, index) => {
        let swatch = Array.from(container.children).find(
            (element) => (element as HTMLElement).dataset.colorId === color.id,
        ) as HTMLElement | undefined;
        if (!swatch) swatch = createSwatch(color.id);
        if (container.children[index] !== swatch)
            container.insertBefore(swatch, container.children[index] ?? null);
        swatch.style.backgroundColor = color.hex;
        swatch.style.color = foreground(color.hex);
        swatch.classList.toggle("light-ink", foreground(color.hex) === "#FFFFFF");
        swatch.querySelector(".hex")!.textContent = color.hex;
        swatch.querySelector(".color-name")!.textContent = colorName(color.hex);
        const lock = swatch.querySelector<HTMLButtonElement>('[data-action="lock"]')!;
        updateIcon(lock, color.locked ? "lock-keyhole" : "lock-keyhole-open");
        lock.setAttribute("aria-pressed", String(color.locked));
        lock.setAttribute(
            "aria-label",
            `${color.locked ? "Unlock" : "Lock"} ${colorName(color.hex)}`,
        );
        const undo = swatch.querySelector<HTMLButtonElement>('[data-action="undo-color"]')!;
        undo.disabled = color.previousHexes.length === 0;
        undo.setAttribute("aria-label", `Undo ${colorName(color.hex)}`);
        swatch
            .querySelector(".color-label")!
            .setAttribute("aria-expanded", String(state.selectedId === color.id));
    });
}
