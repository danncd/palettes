import assert from "node:assert/strict";
import { test } from "node:test";
import { createState, HISTORY_LIMIT } from "../src/palette/defaults.ts";
import {
    generate,
    editColor,
    toggleLock,
    addColor,
    removeColor,
    resetPalette,
} from "../src/palette/actions.ts";
import { undoColor, undoPalette } from "../src/palette/history.ts";

test("generation preserves locked colors and closes only an unlocked selection", () => {
    const state = createState();
    const first = state.colors[0];
    toggleLock(state, first.id);
    state.selectedId = first.id;
    const original = first.hex;
    generate(state, () => 0.5);
    assert.equal(first.hex, original);
    assert.equal(state.colors[1].hex, "#808080");
    assert.equal(state.selectedId, first.id);
    state.selectedId = state.colors[1].id;
    generate(state, () => 0.4);
    assert.equal(state.selectedId, null);
});

test("generation with all colors locked and unchanged edits do not create history", () => {
    const state = createState();
    state.colors.forEach((color) => (color.locked = true));
    generate(state);
    editColor(state, state.colors[0].id, state.colors[0].hex);
    editColor(state, state.colors[0].id, "invalid");
    assert.equal(state.snapshots.length, 0);
});

test("individual undo and global undo restore values and histories consistently", () => {
    const state = createState();
    const id = state.colors[0].id;
    const original = state.colors[0].hex;
    editColor(state, id, "#112233");
    editColor(state, id, "#AABBCC");
    undoColor(state, id);
    assert.equal(state.colors[0].hex, "#112233");
    assert.deepEqual(state.colors[0].previousHexes, [original]);
    undoPalette(state);
    assert.equal(state.colors[0].hex, "#AABBCC");
    assert.deepEqual(state.colors[0].previousHexes, [original, "#112233"]);
    undoPalette(state);
    assert.equal(state.colors[0].hex, "#112233");
    undoPalette(state);
    assert.equal(state.colors[0].hex, original);
    assert.equal(state.colors[0].previousHexes.length, 0);
});

test("count limits, selection removal, and global undo preserve removed color identity", () => {
    const state = createState();
    for (let i = 0; i < 10; i++) addColor(state);
    assert.equal(state.colors.length, 8);
    const last = state.colors[7];
    editColor(state, last.id, "#123456");
    toggleLock(state, last.id);
    state.selectedId = last.id;
    removeColor(state);
    assert.equal(state.selectedId, null);
    undoPalette(state);
    assert.deepEqual(state.colors[7], last);
    for (let i = 0; i < 10; i++) removeColor(state);
    assert.equal(state.colors.length, 1);
});

test("reset creates independent defaults and can itself be undone", () => {
    const state = createState();
    const originals = state.colors.map((color) => color.hex);
    resetPalette(state);
    editColor(state, state.colors[0].id, "#123456");
    resetPalette(state);
    assert.deepEqual(
        state.colors.map((color) => color.hex),
        originals,
    );
    assert.ok(state.colors.every((color) => !color.locked && color.previousHexes.length === 0));
    undoPalette(state);
    assert.equal(state.colors[0].hex, "#123456");
});

test("both history levels are bounded", () => {
    const state = createState();
    for (let i = 0; i < 150; i++)
        editColor(state, state.colors[0].id, i % 2 ? "#000000" : "#FFFFFF");
    assert.equal(state.snapshots.length, HISTORY_LIMIT);
    assert.equal(state.colors[0].previousHexes.length, HISTORY_LIMIT);
});

test("each preset can be selected on arrival with clean, independent colors", () => {
    const palettes = new Set<string>();
    for (let index = 0; index < 5; index++) {
        const state = createState(() => (index + 0.5) / 5);
        assert.equal(state.initialPreset, index);
        assert.equal(state.colors.length, 5);
        assert.ok(
            state.colors.every(
                (color) =>
                    /^#[0-9A-F]{6}$/.test(color.hex) &&
                    !color.locked &&
                    color.previousHexes.length === 0,
            ),
        );
        palettes.add(state.colors.map((color) => color.hex).join(","));
        const original = state.colors.map((color) => color.hex);
        generate(state, () => 0);
        resetPalette(state);
        assert.deepEqual(
            state.colors.map((color) => color.hex),
            original,
        );
    }
    assert.equal(palettes.size, 5);
    assert.equal(createState(() => 0).initialPreset, 0);
    assert.equal(createState(() => 0.999999).initialPreset, 4);
});
