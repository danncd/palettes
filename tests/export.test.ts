import assert from "node:assert/strict";
import { test } from "node:test";
import { JSDOM } from "jsdom";
import { createState } from "../src/palette/defaults.ts";
import { exportPng } from "../src/browser/export-png.ts";

test("export contains palette labels without controls and cleans up on success", async () => {
    const dom = new JSDOM("<body></body>");
    Object.assign(globalThis, { window: dom.window, document: dom.window.document });
    const colors = createState().colors;
    let downloaded = "";
    dom.window.HTMLAnchorElement.prototype.click = function () {
        downloaded = this.download;
    };
    window.html2canvas = async (surface) => {
        assert.equal(surface.children.length, 5);
        assert.equal(surface.querySelectorAll("button, input").length, 0);
        assert.deepEqual(
            Array.from(surface.querySelectorAll("strong"), (node) => node.textContent),
            colors.map((color) => color.hex),
        );
        return { toDataURL: () => "data:image/png;base64,test" } as HTMLCanvasElement;
    };
    await exportPng(colors);
    assert.equal(downloaded, colors.map((color) => color.hex.slice(1)).join("-") + ".png");
    assert.equal(document.querySelector(".export-palette"), null);
    dom.window.close();
});

test("export failures also remove their temporary surface", async () => {
    const dom = new JSDOM("<body></body>");
    Object.assign(globalThis, { window: dom.window, document: dom.window.document });
    window.html2canvas = async () => {
        throw new Error("capture failed");
    };
    await assert.rejects(exportPng(createState().colors), /capture failed/);
    assert.equal(document.querySelector(".export-palette"), null);
    dom.window.close();
});
