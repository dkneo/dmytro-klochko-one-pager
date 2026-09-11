import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import sharp from "sharp";

// The product is now the visual wall itself. The analytical portrait was an
// explanation placed in front of the thing people actually came to see.

const root = path.resolve(import.meta.dirname, "..");
const read = (f) => fs.readFileSync(path.join(root, f), "utf8");

test("the visual moodboard lives in the library; the homepage carries one door to it", () => {
  const home = read("dist/index.html");
  const lib = read("dist/eidos/index.html");
  const map = JSON.parse(read("src/data/map.json"));
  const visual = map.items.filter((it) => ["painting", "print", "poster"].includes(it.type) && it.src && !it.id.startsWith("his-")).length;

  assert.match(lib, /data-visual-moodboard/, "the library has no visual wall");
  const pieces = [...lib.matchAll(/<figure class="ep-visual/g)].length;
  assert.equal(pieces, visual, "the library miscounts its visual work");
  assert.doesNotMatch(lib, /ep-reading|data-weather-filter/, "analysis still blocks the pictures");

  // The homepage used to carry a compact copy under its own chapter: a second
  // place saying what he loves, right under a wall of eight people already
  // saying it. One sentence and one door now, under that wall.
  assert.doesNotMatch(home, /class="eidos-portrait/, "the homepage carries a copy of the portrait");
  assert.doesNotMatch(home, /id="eidos"/, "the homepage still has an eidos chapter");
  assert.match(home, /id="me"[\s\S]*?class="me-door" href="\/eidos"/, "no door to the library under the wall");
  // the house rule from the last time a copy of the library sat on the homepage
  assert.doesNotMatch(read("src/pages/index.astro"), /me-orbit|orbitData|eidos-mini/);
});

test("the weather taxonomy remains in the vault, not in the main experience", () => {
  const html = read("dist/eidos/index.html");
  const map = JSON.parse(read("src/data/map.json"));
  assert.equal(map.weathers.length, 8, "the private taxonomy disappeared from its data");
  assert.doesNotMatch(html, /data-weather-filter|eight ways a thing can feel/);
  assert.ok(fs.existsSync(path.join(root, "dist/eidos/words/index.html")), "the displaced words were lost");
});

test("the library shares as itself, with a card made from its own data", async () => {
  const og = path.join(root, "public/og-eidos.png");
  assert.ok(fs.existsSync(og), "no og-eidos.png");
  const m = await sharp(og).metadata();
  assert.equal(m.width, 1200);
  assert.equal(m.height, 628);
  const lib = read("dist/eidos/index.html");
  assert.match(lib, /og:image" content="https?:\/\/[^"]*\/og-eidos\.png/);
  // the homepage still shares as the site
  assert.match(read("dist/index.html"), /og:image" content="https?:\/\/[^"]*\/og\.png/);
});
