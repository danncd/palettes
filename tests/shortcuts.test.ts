import assert from "node:assert/strict";
import { test } from "node:test";
import { JSDOM } from "jsdom";
import { bindShortcuts } from "../src/app/shortcuts.ts";

test("Space generates from focused controls and prevents their native activation", () => {
    const dom = new JSDOM(`<button data-action="add">Add</button>
        <button data-action="lock">Lock</button><button data-action="export">Export</button>
        <details><summary>More actions</summary></details>
        <input><textarea></textarea><select></select><div contenteditable="true"></div>`);
    Object.assign(globalThis, {
        document: dom.window.document,
        Element: dom.window.Element,
    });
    let generated = 0;
    bindShortcuts(
        () => generated++,
        () => {},
    );
    const doc = dom.window.document;
    const pressSpace = (target: Element, options = {}) => {
        const event = new dom.window.KeyboardEvent("keydown", {
            code: "Space",
            key: " ",
            bubbles: true,
            cancelable: true,
            ...options,
        });
        target.dispatchEvent(event);
        return event;
    };
    for (const control of doc.querySelectorAll<HTMLElement>("button, summary")) {
        control.focus();
        const before = generated;
        assert.equal(pressSpace(doc.activeElement!).defaultPrevented, true);
        assert.equal(generated, before + 1);
        assert.equal(pressSpace(control, { repeat: true }).defaultPrevented, true);
        assert.equal(generated, before + 1);
    }
    const before = generated;
    for (const field of doc.querySelectorAll("input, textarea, select, [contenteditable]")) {
        assert.equal(pressSpace(field).defaultPrevented, false);
    }
    for (const modifier of ["altKey", "ctrlKey", "metaKey", "shiftKey"]) {
        assert.equal(
            pressSpace(doc.querySelector("button")!, { [modifier]: true }).defaultPrevented,
            false,
        );
    }
    assert.equal(generated, before);
    dom.window.close();
});
