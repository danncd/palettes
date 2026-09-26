import { icon } from "../app/icons";
import { MAX_COLORS, MIN_COLORS } from "../palette/defaults";
import type { PaletteState } from "../palette/model";

export function createToolbar(container: HTMLElement) {
    container.innerHTML = `
        <div class="color-count">
            <button class="icon-button" data-action="remove" aria-label="Remove last color"></button>
            <span id="color-count"></span>
            <button class="icon-button" data-action="add" aria-label="Add color"></button>
        </div>
        <button class="generate-button" data-action="generate"></button>
        <div class="toolbar-actions">
            <button class="icon-button" data-action="undo" aria-label="Undo palette change"></button>
            <button data-action="export"></button>
            <details class="more-actions">
                <summary aria-label="More actions">···</summary>
                <div class="action-menu"><button data-action="reset">Reset palette</button></div>
            </details>
        </div>`;
    container.querySelector('[data-action="remove"]')!.append(icon("minus"));
    container.querySelector('[data-action="add"]')!.append(icon("plus"));
    container
        .querySelector('[data-action="generate"]')!
        .append(icon("shuffle"), "Space to generate");
    container.querySelector('[data-action="undo"]')!.append(icon("undo-2"));
    container.querySelector('[data-action="export"]')!.append(icon("download"), "Export");
}

export function renderToolbar(container: HTMLElement, state: PaletteState) {
    container.hidden = state.selectedId !== null;
    container.querySelector("#color-count")!.textContent =
        `${state.colors.length} ${state.colors.length === 1 ? "color" : "colors"}`;
    container.querySelector<HTMLButtonElement>('[data-action="remove"]')!.disabled =
        state.colors.length <= MIN_COLORS;
    container.querySelector<HTMLButtonElement>('[data-action="add"]')!.disabled =
        state.colors.length >= MAX_COLORS;
    container.querySelector<HTMLButtonElement>('[data-action="undo"]')!.disabled =
        state.snapshots.length === 0;
}
