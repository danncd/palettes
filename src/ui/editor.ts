import { icon } from "../app/icons";
import { colorName } from "../color/names";
import { makeShades } from "../color/shades";
import type { PaletteColor } from "../palette/model";

export function createEditor(container: HTMLElement) {
    container.innerHTML = `
        <div class="editor-value">
            <label class="sr-only" for="hex-input">Hex color</label>
            <input id="hex-input" name="hex" type="text" maxlength="7" autocomplete="off" spellcheck="false" aria-describedby="hex-error" />
            <span class="sr-only" id="hex-error"></span>
        </div>
        <div class="shades" role="group" aria-label="Color shades"></div>
        <div class="editor-actions">
            <button class="icon-button" data-action="copy" aria-label="Copy hex color"></button>
            <button class="icon-button" data-action="close" aria-label="Close color editor"></button>
        </div>`;
    container.querySelector('[data-action="copy"]')!.append(icon("copy"));
    container.querySelector('[data-action="close"]')!.append(icon("x"));
    const shades = container.querySelector(".shades")!;
    for (let index = 0; index < 11; index++) {
        const button = document.createElement("button");
        button.type = "button";
        button.dataset.action = "shade";
        shades.append(button);
    }
}

export function renderEditor(container: HTMLElement, color: PaletteColor | undefined) {
    container.hidden = !color;
    if (!color) return;
    const input = container.querySelector<HTMLInputElement>("input")!;
    if (document.activeElement !== input || container.dataset.colorId !== color.id) {
        input.value = color.hex;
        input.removeAttribute("aria-invalid");
        container.querySelector("#hex-error")!.textContent = "";
    }
    container.dataset.colorId = color.id;
    const shades = makeShades(color.hex);
    container.querySelectorAll<HTMLButtonElement>(".shades button").forEach((button, index) => {
        const hex = shades[index];
        button.dataset.hex = hex;
        button.style.backgroundColor = hex;
        button.setAttribute("aria-label", `${colorName(hex)}, ${hex}`);
        button.setAttribute("aria-pressed", String(index === 5));
    });
}
