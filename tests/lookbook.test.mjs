import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const html = fs.readFileSync(path.join(root, "public/lookbook/index.html"), "utf8");
const attr = (tag, name) =>
  tag.match(new RegExp(`(?:^|\\s)${name}="([^"]*)"`))?.[1] ?? "";

test("lookbook images reserve their real aspect ratios", async () => {
  const tags = [...html.matchAll(/<img\b[^>]*>/g)].map((match) => match[0]);
  assert.ok(tags.length >= 60, `expected the full lookbook, found ${tags.length} images`);

  for (const tag of tags) {
    const src = attr(tag, "src");
    const file = path.join(root, "public/lookbook", src);
    assert.ok(fs.existsSync(file), `missing ${src}`);
    const metadata = await sharp(file).metadata();
    assert.equal(Number(attr(tag, "width")), metadata.width, `${src} width`);
    assert.equal(Number(attr(tag, "height")), metadata.height, `${src} height`);
  }
});

test("the lookbook loads one lead image before deferring the long gallery", () => {
  const tags = [...html.matchAll(/<img\b[^>]*>/g)].map((match) => match[0]);
  assert.equal(attr(tags[0], "loading"), "eager");
  assert.equal(attr(tags[0], "fetchpriority"), "high");

  for (const tag of tags.slice(1)) {
    assert.equal(attr(tag, "loading"), "lazy", `${attr(tag, "src")} loading`);
    assert.equal(attr(tag, "decoding"), "async", `${attr(tag, "src")} decoding`);
  }
});
