import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";
import { startApp } from "../src/app/controller.ts";

test("editor, keyboard, focus, and swatch identity work together", () => {
    const dom = new JSDOM(readFileSync(new URL("../index.html", import.meta.url), "utf8"), {
        url: "http://localhost",
    });
    Object.assign(globalThis, {
        window: dom.window,
        document: dom.window.document,
        Element: dom.window.Element,
    });
    startApp();
    const doc = dom.window.document;
    const click = (selector: string) => doc.querySelector<HTMLButtonElement>(selector)!.click();
    const space = (target: Element, options = {}) =>
        target.dispatchEvent(
            new dom.window.KeyboardEvent("keydown", {
                code: "Space",
                key: " ",
                bubbles: true,
                cancelable: true,
                ...options,
            }),
        );
    const palette = doc.querySelector("#palette")!;
    const originalSwatch = palette.firstElementChild;
    click('.swatch [data-action="edit"]');
    assert.equal(doc.querySelector<HTMLElement>("#editor")!.hidden, false);
    assert.equal(doc.querySelector<HTMLElement>("#toolbar")!.hidden, true);
    const input = doc.querySelector<HTMLInputElement>("#hex-input")!;
    input.focus();
    input.value = "#123456";
    input.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
    assert.equal(doc.querySelector(".hex")!.textContent, "#123456");
    assert.equal(doc.activeElement, input);
    assert.equal(palette.firstElementChild, originalSwatch);
    space(input);
    assert.equal(doc.querySelector(".hex")!.textContent, "#123456");
    assert.equal(doc.querySelector<HTMLElement>("#editor")!.hidden, false);
    click('.swatch [data-action="lock"]');
    space(doc.querySelector('.swatch [data-action="edit"]')!);
    assert.equal(doc.querySelector(".hex")!.textContent, "#123456");
    assert.equal(doc.querySelector<HTMLElement>("#editor")!.hidden, false);
    click('.swatch [data-action="lock"]');
    space(doc.querySelector('.swatch [data-action="edit"]')!, { repeat: true });
    assert.equal(doc.querySelector<HTMLElement>("#editor")!.hidden, false);
    space(doc.querySelector('.swatch [data-action="edit"]')!);
    assert.equal(doc.querySelector<HTMLElement>("#editor")!.hidden, true);
    click('.swatch [data-action="edit"]');
    click('[data-action="close"]');
    assert.equal(doc.activeElement, doc.querySelector('.swatch [data-action="edit"]'));
    dom.window.close();
});
