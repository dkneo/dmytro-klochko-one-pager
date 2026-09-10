import assert from "node:assert/strict";
import { createHash } from "node:crypto";
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
  const visuals = map.items.filter((i) => ["painting", "print", "poster"].includes(i.type) && i.src && !i.id.startsWith("his-")).length;

  assert.ok(svg.includes(`${visuals} visual things`), "the card counts something other than the moodboard");
  assert.doesNotMatch(svg, /languages|weathers|url\(#g\d+\)/i);
  assert.match(svg, /a beautiful, endless moodboard/);
  assert.match(svg, /faun notices · gryphon remembers/);
  assert.match(svg, /data:image\/jpeg;base64,/);
  assert.match(svg, /#f2e2c9/);
  assert.match(svg, /#a8425d/);
  assert.doesNotMatch(svg, /#131a2b/);
  assert.doesNotMatch(svg, /filed under eight weathers i made up/);
});

test("the share-card headline cannot run underneath the artwork", async () => {
  const { compose } = await import("../scripts/og-eidos-build.mjs");
  const map = JSON.parse(read("src/data/map.json"));
  const palettes = JSON.parse(read("src/data/palettes.json"));
  const svg = compose(map, palettes);
  const lines = [...svg.matchAll(/<text class="og-headline" x="(\d+)"[^>]*textLength="(\d+)"/g)];

  assert.ok(lines.length >= 3, "the headline has no measurable line bounds");
  for (const [, x, width] of lines) {
    assert.ok(Number(x) + Number(width) <= 548, `headline reaches ${Number(x) + Number(width)}px into the artwork column`);
  }
});

test("the card ships at social size and the page points at this build of it", async () => {
  const card = fs.readFileSync(path.join(root, "public/og-eidos.png"));
  const m = await sharp(card).metadata();
  assert.equal(`${m.width}x${m.height}`, "1200x628");
  const version = createHash("sha1").update(card).digest("hex").slice(0, 10);
  assert.match(read("dist/eidos/index.html"), new RegExp(`og-eidos\\.png\\?v=${version}`), "the og url does not carry the image's content hash, so same-day edits stay stale");
  assert.match(read("package.json"), /og-eidos-build\.mjs/, "the card is not part of the build");
});
