import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { fitEaselFrame } from "../src/scripts/easel-frame.js";

test("portrait and landscape memories shape their own bounded print", () => {
  assert.deepEqual(fitEaselFrame(440, 804), {
    width: 280,
    height: 512,
    ratio: 440 / 804,
  });
  assert.deepEqual(fitEaselFrame(760, 428), {
    width: 480,
    height: 270,
    ratio: 760 / 428,
  });
  assert.deepEqual(fitEaselFrame(760, 1014), {
    width: 340,
    height: 453,
    ratio: 760 / 1014,
  });
});

test("the built journey interaction bundles its frame helper", async () => {
  const html = await readFile(new URL("../dist/index.html", import.meta.url), "utf8");
  assert.doesNotMatch(html, /\bfitEaselFrame\b/);
});

test("journey focus lights the bead instead of boxing the opened print", async () => {
  const css = await readFile(new URL("../src/styles/dream.css", import.meta.url), "utf8");
  assert.match(css, /\.log--journey li:focus-visible\s*{[^}]*outline:\s*none/s);
  assert.match(css, /\.log--journey li:focus-visible::before\s*{[^}]*box-shadow:/s);
});
