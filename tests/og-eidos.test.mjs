import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import sharp from "sharp";

// The share card is drawn from the vault at build time so it can never say
// 65 things while the library holds 98. It used to be a static png; it lied
// within a day.

const root = path.resolve(import.meta.dirname, "..");
const read = (f) => fs.readFileSync(path.join(root, f), "utf8");

test("the share card is composed from the same vault the page reads", async () => {
  const { compose } = await import("../scripts/og-eidos-build.mjs");
  const map = JSON.parse(read("src/data/map.json"));
  const palettes = JSON.parse(read("src/data/palettes.json"));
  const svg = compose(map, palettes);
  const shelved = map.items.filter((i) => i.type !== "link").length;

  assert.ok(svg.includes(`${shelved} real things`), "the card counts something other than the library");
  assert.equal((svg.match(/fill="url\(#g\d+\)"/g) || []).length, map.weathers.length, "one bar per weather");
  for (const w of map.weathers) assert.ok(svg.includes(`${w.name} `), `${w.name} is not named on the card`);

  // nothing runs off the right edge. The 26px serif sentences: 1056px holds
  // about 72 characters. The 12px mono legend is a different measure, about
  // 140, and is checked at its own.
  const prose = (svg.match(/<g font-family="Georgia[^>]*font-size="26"[^>]*>([\s\S]*?)<\/g>/) || [])[1] || "";
  const texts = [...prose.matchAll(/<text[^>]*>([^<]*)<\/text>/g)].map((m) => m[1]);
  assert.ok(texts.length >= 4, "the card lost its sentences");
  for (const t of texts) assert.ok(t.length <= 72, `a line is too long for the card: "${t}"`);
  for (const m of svg.matchAll(/font-size="12"[^>]*>([^<]*)<\/text>/g)) assert.ok(m[1].length <= 140, `a legend line is too long: "${m[1]}"`);
  // and the last sentence is whole, not cut by a line cap
  assert.ok(texts.some((t) => /languages\.$/.test(t)), "the portrait's last sentence was cut");
});

test("the card ships at social size and the page points at this build of it", async () => {
  const m = await sharp(path.join(root, "public/og-eidos.png")).metadata();
  assert.equal(`${m.width}x${m.height}`, "1200x628");
  const map = JSON.parse(read("src/data/map.json"));
  assert.match(read("dist/eidos/index.html"), new RegExp(`og-eidos\\.png\\?v=${map.built}`), "the og url does not carry the map's build date, so caches will show a stale card");
  assert.match(read("package.json"), /og-eidos-build\.mjs/, "the card is not part of the build");
});
