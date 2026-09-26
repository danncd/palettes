import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { normalizeHex, hexToRgb, rgbToHex, rgbToHsl, hslToRgb } from "../src/color/conversions.ts";
import { makeShades } from "../src/color/shades.ts";
import { foreground } from "../src/color/contrast.ts";

test("hex normalization accepts original formats and rejects incomplete input", () => {
    for (const value of ["abcdef", "#ABCDEF", " #abcdef "])
        assert.equal(normalizeHex(value), "#ABCDEF");
    for (const value of ["", "#123", "#12345g", "##123456", "1234567"])
        assert.equal(normalizeHex(value), null);
});

test("RGB order and HSL round trips preserve representative colors", () => {
    assert.deepEqual(hexToRgb("#123456"), { r: 18, g: 52, b: 86 });
    for (const hex of [
        "#000000",
        "#FFFFFF",
        "#808080",
        "#FF0000",
        "#00FF00",
        "#0000FF",
        "#4255A3",
        "#BB8066",
    ]) {
        const { r, g, b } = hexToRgb(hex);
        const hsl = rgbToHsl(r, g, b);
        const rgb = hslToRgb(hsl.h, hsl.s, hsl.l);
        assert.equal(rgbToHex(rgb.r, rgb.g, rgb.b), hex);
    }
});

test("shades produce five lighter and five darker values, including at extremes", () => {
    for (const hex of ["#000000", "#FFFFFF", "#4255A3", "#808080"]) {
        const shades = makeShades(hex);
        assert.equal(shades.length, 11);
        assert.equal(shades[5], hex);
        const lightness = shades.map((shade) => {
            const { r, g, b } = hexToRgb(shade);
            return rgbToHsl(r, g, b).l;
        });
        for (let i = 1; i < lightness.length; i++) assert.ok(lightness[i] <= lightness[i - 1]);
        shades.forEach((shade) => assert.equal(normalizeHex(shade), shade));
    }
});

test("foreground retains the existing luminance behavior", () => {
    assert.equal(foreground("#000000"), "#FFFFFF");
    assert.equal(foreground("#FFFFFF"), "#000000");
});

test("bundled color names retain exact and nearest-name lookup", () => {
    const context: { ntc?: { name: (hex: string) => [string, string, boolean] } } = {};
    runInNewContext(
        readFileSync(new URL("../public/vendor/ntc.js", import.meta.url), "utf8"),
        context,
    );
    assert.equal(context.ntc!.name("#FFFFFF")[1], "White");
    assert.equal(context.ntc!.name("#000000")[1], "Black");
    assert.ok(context.ntc!.name("#4255A3")[1].length > 0);
});
