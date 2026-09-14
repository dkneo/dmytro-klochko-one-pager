import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import sharp from "sharp";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const attr = (tag, name) => tag.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1];

// Pictures are served at the size they are seen (P05). The attributes tell
// the truth about the file, the big ones offer a srcset, and the homepage
// ships no png or jpg except the social image.
test("the eidos hero and the press portrait tell the truth and offer their sizes", async () => {
  for (const [page, sel] of [["dist/eidos/index.html", /<img[^>]*hero-desktop-poster[^>]*>/], ["dist/press/index.html", /<img[^>]*data-press-portrait="lead"[^>]*>/]]) {
    const tag = read(page).match(sel)?.[0];
    assert.ok(tag, `${page}: no picture`);
    assert.match(tag, /srcset="[^"]*\b768w|srcset="[^"]*\b800w/, `${page}: no srcset`);
    assert.match(tag, /sizes="/, `${page}: no sizes`);
    const largest = attr(tag, "srcset").split(",").map((s) => s.trim().split(" ")[0]).pop();
    const meta = await sharp(path.join(root, "public", largest)).metadata();
    assert.equal(Number(attr(tag, "width")), meta.width, `${page}: width lies`);
    assert.equal(Number(attr(tag, "height")), meta.height, `${page}: height lies`);
  }
});

test("the faun mark is offered small where it is shown small", () => {
  for (const page of ["dist/eidos/index.html", "dist/eidos/inbox/index.html", "dist/eidos/reads/index.html"]) {
    const html = read(page);
    assert.doesNotMatch(html, /src="\/images\/eidos\/product\/faun-mark\.webp"/, `${page} still ships the 720px faun`);
    assert.match(html, /faun-mark-96\.webp 96w, [^"]*faun-mark-540\.webp 540w/, `${page}: faun without srcset`);
  }
});

test("the homepage ships no png or jpg but the social image", () => {
  const html = read("dist/index.html");
  const rasters = [...html.matchAll(/(?:src|poster|href)="([^"]+\.(?:png|jpe?g))(?:\?[^"]*)?"/g)].map((m) => m[1]).filter((u) => !/og\.png|icon-|apple-touch|favicon/.test(u));
  assert.deepEqual(rasters, [], "png/jpg still referenced");
});
