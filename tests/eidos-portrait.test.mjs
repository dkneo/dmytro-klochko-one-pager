import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import sharp from "sharp";

// The portrait renders twice from one component — whole on /eidos, compact
// on the homepage — so the two can never disagree about what he loves.

const root = path.resolve(import.meta.dirname, "..");
const read = (f) => fs.readFileSync(path.join(root, f), "utf8");

test("the portrait is one component in two places, saying the same numbers", () => {
  const home = read("dist/index.html");
  const lib = read("dist/eidos/index.html");
  const map = JSON.parse(read("src/data/map.json"));
  const shelved = map.items.filter((it) => it.type !== "link").length;

  for (const [name, html] of [["home", home], ["library", lib]]) {
    assert.match(html, /class="eidos-portrait/, `${name} has no portrait`);
    assert.equal(Number(html.match(/(\d+) real things i love/)[1]), shelved, `${name} miscounts`);
    const bars = html.match(/<ol class="ep-strip"[\s\S]*?<\/ol>/)[0].match(/<li[ >]/g).length;
    assert.equal(bars, map.weathers.length, `${name} strip has ${bars} bars`);
  }
  // the homepage one is the compact door; the library's is whole
  assert.match(home, /class="eidos-portrait is-compact"/);
  assert.match(home, /class="ep-go" href="\/eidos"/);
  assert.doesNotMatch(lib, /class="eidos-portrait is-compact"/);
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
