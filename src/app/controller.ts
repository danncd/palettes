import { createState } from "../palette/defaults";
import {
    generate,
    editColor,
    toggleLock,
    addColor,
    removeColor,
    resetPalette,
} from "../palette/actions";
import { undoColor, undoPalette } from "../palette/history";
import { normalizeHex } from "../color/conversions";
import { renderPalette } from "../ui/palette";
import { createToolbar, renderToolbar } from "../ui/toolbar";
import { createEditor, renderEditor } from "../ui/editor";
import { createFeedback } from "../ui/feedback";
import { copyHex } from "../browser/clipboard";
import { exportPng } from "../browser/export-png";
import { bindShortcuts } from "./shortcuts";
import { icon } from "./icons";

export function startApp() {
    const state = createState();
    const app = document.querySelector<HTMLElement>(".app")!;
    const palette = document.getElementById("palette")!;
    const toolbar = document.getElementById("toolbar")!;
    const editor = document.getElementById("editor")!;
    const notify = createFeedback(document.getElementById("status")!);
    app.querySelector('[data-lucide="swatch-book"]')!.replaceWith(icon("swatch-book"));
    createToolbar(toolbar);
    createEditor(editor);
    const input = editor.querySelector<HTMLInputElement>("input")!;

    function render() {
        renderPalette(palette, state);
        renderToolbar(toolbar, state);
        renderEditor(
            editor,
            state.colors.find((color) => color.id === state.selectedId),
        );
    }
    function returnFocus(id: string | null) {
        const swatch = Array.from(palette.children).find(
            (node) => (node as HTMLElement).dataset.colorId === id,
        );
        const target =
            swatch?.querySelector<HTMLButtonElement>('[data-action="edit"]') ??
            toolbar.querySelector<HTMLButtonElement>('[data-action="generate"]')!;
        target.focus();
    }
    function closeEditor() {
        if (!state.selectedId) return;
        const id = state.selectedId;
        state.selectedId = null;
        render();
        returnFocus(id);
    }
    function generatePalette() {
        const editorHadFocus = editor.contains(document.activeElement);
        generate(state);
        render();
        if (editorHadFocus && !state.selectedId)
            toolbar.querySelector<HTMLButtonElement>('[data-action="generate"]')!.focus();
    }

    app.addEventListener("click", async (event) => {
        if (!(event.target instanceof Element)) return;
        const button = event.target.closest<HTMLButtonElement>("button[data-action]");
        if (!button || button.disabled) return;
        const id =
            button.closest<HTMLElement>("[data-color-id]")?.dataset.colorId ?? state.selectedId;
        switch (button.dataset.action) {
            case "edit":
                state.selectedId = id;
                break;
            case "lock":
                if (id) toggleLock(state, id);
                break;
            case "undo-color":
                if (id) undoColor(state, id);
                break;
            case "generate":
                generatePalette();
                return;
            case "add":
                addColor(state);
                break;
            case "remove":
                removeColor(state);
                break;
            case "undo":
                undoPalette(state);
                break;
            case "reset":
                resetPalette(state);
                toolbar.querySelector("details")!.open = false;
                render();
                returnFocus(null);
                notify("Palette reset");
                return;
            case "close":
                closeEditor();
                return;
            case "shade":
                if (id && button.dataset.hex) editColor(state, id, button.dataset.hex);
                break;
            case "copy": {
                const color = state.colors.find((item) => item.id === state.selectedId);
                if (color) {
                    try {
                        await copyHex(color.hex);
                        notify(`${color.hex} copied`);
                    } catch {
                        notify("Could not copy. Select and copy the hex value manually.");
                    }
                }
                return;
            }
            case "export":
                button.disabled = true;
                try {
                    await exportPng(state.colors);
                    notify("Palette downloaded");
                } catch {
                    notify("Could not export the palette. Please try again.");
                } finally {
                    button.disabled = false;
                }
                return;
        }
        render();
    });
    input.addEventListener("input", () => {
        const hex = normalizeHex(input.value);
        input.setAttribute("aria-invalid", String(hex === null));
        editor.querySelector("#hex-error")!.textContent = hex
            ? ""
            : "Enter six hexadecimal digits.";
        if (hex && state.selectedId) {
            editColor(state, state.selectedId, hex);
            render();
        }
    });
    input.addEventListener("blur", () => {
        const color = state.colors.find((item) => item.id === state.selectedId);
        if (!color) return;
        if (!normalizeHex(input.value)) notify("Invalid hex value. The previous color was kept.");
        input.value = color.hex;
        input.removeAttribute("aria-invalid");
        editor.querySelector("#hex-error")!.textContent = "";
    });
    bindShortcuts(generatePalette, closeEditor);
    render();
}
