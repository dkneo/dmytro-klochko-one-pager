// The lookbook was hand-built by other agents from originals: 577 files,
// 122 MB, single pictures of 4–5 MB. Nothing on a page of 166 thumbnails
// needs more than 1400 px across. This brings every referenced picture down
// to that, as webp, and rewrites the two pages so width/height stay true
// (tests/lookbook.test.mjs checks them against the files).
//   node scripts/lookbook-images.mjs          dry run: what would change
//   node scripts/lookbook-images.mjs --apply  do it
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(new URL("..", import.meta.url).pathname);
const DIR = path.join(ROOT, "public/lookbook");
const IMG = path.join(DIR, "img");
const MAX_W = 1400;
const MAX_BYTES = 250_000;
const apply = process.argv.includes("--apply");

const pages = ["index.html", "inside.html"].map((f) => path.join(DIR, f)).filter(fs.existsSync);
const refs = new Map(); // rel src → Set(pages)
for (const p of pages) {
  const html = fs.readFileSync(p, "utf8");
  for (const m of html.matchAll(/<img\b[^>]*\bsrc="([^"]+)"/g)) {
    const rel = m[1].replace(/^\/lookbook\//, "");
    if (!refs.has(rel)) refs.set(rel, new Set());
    refs.get(rel).add(p);
  }
}

const all = [];
(function walk(d) { for (const f of fs.readdirSync(d)) { const q = path.join(d, f); fs.statSync(q).isDirectory() ? walk(q) : all.push(q); } })(IMG);

let before = 0, after = 0, shrunk = 0, orphans = 0;
const rewrites = new Map(); // page → [[oldSrc, newSrc, w, h]]
for (const file of all) {
  const rel = path.relative(DIR, file).split(path.sep).join("/");
  const size = fs.statSync(file).size;
  before += size;
  // Orphans are left alone: the lookbook is still being built on other
  // branches, and a file nobody links today may be linked tomorrow.
  if (!refs.has(rel)) { orphans++; after += size; continue; }
  let meta;
  try { meta = await sharp(file).metadata(); } catch { after += size; continue; }
  const needs = meta.width > MAX_W || size > MAX_BYTES || !/\.webp$/i.test(file);
  if (!needs) { after += size; continue; }
  const out = file.replace(/\.[^.]+$/, ".webp");
  const outRel = rel.replace(/\.[^.]+$/, ".webp");
  const img = sharp(file).rotate();
  if (meta.width > MAX_W) img.resize({ width: MAX_W, withoutEnlargement: true });
  const buf = await img.webp({ quality: 80, effort: 5 }).toBuffer();
  const om = await sharp(buf).metadata();
  after += buf.length; shrunk++;
  if (apply) {
    fs.writeFileSync(out, buf);
    if (out !== file) fs.unlinkSync(file);
  }
  for (const p of refs.get(rel)) {
    if (!rewrites.has(p)) rewrites.set(p, []);
    rewrites.get(p).push([rel, outRel, om.width, om.height]);
  }
}

for (const [p, list] of rewrites) {
  let html = fs.readFileSync(p, "utf8");
  for (const [oldRel, newRel, w, h] of list) {
    const re = new RegExp(`<img\\b([^>]*)\\bsrc="(/lookbook/)?${oldRel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"([^>]*)>`, "g");
    let hit = 0;
    html = html.replace(re, (m, a, pre, b) => {
      hit++;
      let tag = `<img${a}src="${pre || ""}${newRel}"${b}>`;
      tag = tag.replace(/\bwidth="\d+"/, `width="${w}"`).replace(/\bheight="\d+"/, `height="${h}"`);
      return tag;
    });
    if (!hit) throw new Error(`no <img> matched ${oldRel} in ${path.basename(p)}`);
  }
  if (apply) fs.writeFileSync(p, html);
}

console.log(`${all.length} files, ${(before / 1e6).toFixed(0)} MB → ${(after / 1e6).toFixed(0)} MB; ${shrunk} re-encoded, ${orphans} orphans left as they are, ${[...rewrites.values()].reduce((a, l) => a + l.length, 0)} tags rewritten${apply ? "" : " (dry run)"}`);
