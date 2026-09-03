import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import sharp from "sharp";

// The portrait renders twice from one component — whole on /eidos, compact
// on the homepage — so the two can never disagree about what he loves.

const root = path.resolve(import.meta.dirname, "..");
const read = (f) => fs.readFileSync(path.join(root, f), "utf8");

test("the portrait lives on the library; the homepage carries one door to it", () => {
  const home = read("dist/index.html");
  const lib = read("dist/eidos/index.html");
  const map = JSON.parse(read("src/data/map.json"));
  const shelved = map.items.filter((it) => it.type !== "link").length;

  assert.match(lib, /class="eidos-portrait/, "the library has no portrait");
  assert.equal(Number(lib.match(/(\d+) real things i love/)[1]), shelved, "the library miscounts");
  const bars = lib.match(/<ol class="ep-strip"[\s\S]*?<\/ol>/)[0].match(/<li[ >]/g).length;
  assert.equal(bars, map.weathers.length, `strip has ${bars} bars`);

  // The homepage used to carry a compact copy under its own chapter: a second
  // place saying what he loves, right under a wall of eight people already
  // saying it. One sentence and one door now, under that wall.
  assert.doesNotMatch(home, /class="eidos-portrait/, "the homepage carries a copy of the portrait");
  assert.doesNotMatch(home, /id="eidos"/, "the homepage still has an eidos chapter");
  assert.match(home, /id="me"[\s\S]*?class="me-door" href="\/eidos"/, "no door to the library under the wall");
  // the house rule from the last time a copy of the library sat on the homepage
  assert.doesNotMatch(read("src/pages/index.astro"), /me-orbit|orbitData|eidos-mini/);
});

test("the strip is sized by what each weather holds, and painted with its own palette", () => {
  const html = read("dist/eidos/index.html");
  const map = JSON.parse(read("src/data/map.json"));
  const pal = JSON.parse(read("src/data/palettes.json"));
  const shelved = map.items.filter((it) => it.type !== "link");
  const strip = html.match(/<ol class="ep-strip"[\s\S]*?<\/ol>/)[0];
  for (const w of map.weathers) {
    const n = shelved.filter((i) => i.weather === w.name).length;
    assert.ok(strip.includes(`--w:${n};`), `${w.name} bar is not sized ${n}`);
    const p = pal.palettes.find((x) => x.weather === w.name);
    if (p) assert.ok(strip.includes(p.stops[0]), `${w.name} bar is not its own paint`);
  }
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
