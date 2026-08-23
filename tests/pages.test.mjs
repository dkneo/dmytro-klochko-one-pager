import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

// Guards for the pages shipped from dist/. These read the built output, not
// the sources, because the built output is what deploys: npm test builds
// first, so a broken build fails before any assertion runs.

const root = path.resolve(import.meta.dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const exists = (file) => fs.existsSync(path.join(root, file));

test("the pond is whole", () => {
  const html = read("dist/pond/index.html");

  // both artworks, with their responsive derivatives wired
  assert.match(html, /\/images\/pond\/frog\.webp/);
  assert.match(html, /\/images\/pond\/fuji\.webp/);
  assert.match(html, /\/images\/responsive\/pond\/fuji-800\.webp 800w/);
  assert.match(html, /\/images\/responsive\/pond\/frog-340\.webp 340w/);

  // the poem is present but withheld
  assert.match(html, /hidden/);
  assert.equal(html.match(/pond-haiku-lines/g).length >= 1, true);
  for (const line of ["the old pond", "a frog jumps in", "the sound of water"]) {
    assert.ok(html.includes(line), `haiku line missing: ${line}`);
  }

  // the credits point at the real sources
  assert.match(html, /commons\.wikimedia\.org\/wiki\/File:Frog_by_Matsumoto_Hoji/);
  assert.match(html, /commons\.wikimedia\.org\/wiki\/File:Red_Fuji/);

  // the stillness override for demos survives minification
  const js = html + bundled("dist/pond/index.html", html);
  assert.match(js, /still/);
});

test("the pond's stylesheet keeps its floors", () => {
  const css = bundledCss("dist/pond/index.html");
  assert.match(css, /touch-action:manipulation/);
  assert.match(css, /prefers-reduced-motion/);
  // the fuji mask uses the sumi token, not a bare literal
  assert.match(css, /mask-image:linear-gradient\(to bottom, var\(--sumi\)/);
});

test("the terminal guide is intact", () => {
  const html = read("dist/learning/terminal.html");
  assert.match(html, /og:image/);
  assert.match(html, /term-known/);
  assert.match(html, /don't rehearse the chords in this tab/);

  // every move has a unique id (the last element of each row)
  const ids = [...html.matchAll(/,"([a-z0-9]+)"\]/g)].map((m) => m[1]);
  assert.ok(ids.length >= 30, `expected 30+ moves, found ${ids.length}`);
  assert.equal(new Set(ids).size, ids.length, "duplicate move ids");
});

test("the learning page carries its three subjects and the queue", () => {
  const html = read("dist/learning/index.html");
  for (const s of [
    "the vocabulary of interface",
    "the terminal, played properly",
    "the words for motion",
  ]) assert.ok(html.includes(s), `subject missing: ${s}`);
  assert.match(html, /\/learning\/terminal/);
  assert.ok(exists("public/images/learning-terminal.webp"), "artefact shot missing");
});

test("the sitemap lists the public pages and only those", () => {
  const xml = read("dist/sitemap.xml");
  for (const url of ["/pond/", "/learning/terminal", "/today/", "/hokku/"]) {
    assert.ok(xml.includes(url), `sitemap missing ${url}`);
  }
  for (const gated of ["/names", "/ask", "/scout", "/curate"]) {
    assert.ok(!xml.includes(gated), `sitemap leaks ${gated}`);
  }
});

// Astro moves page CSS/JS into hashed bundle files; resolve them from the page.
function bundledCss(page) {
  const html = read(page);
  return [...html.matchAll(/href="(\/_astro\/[^"]+\.css)"/g)]
    .map((m) => read(path.join("dist", m[1])))
    .join("\n");
}
function bundled(page, html) {
  return [...html.matchAll(/src="(\/_astro\/[^"]+\.js)"/g)]
    .map((m) => read(path.join("dist", m[1])))
    .join("\n");
}
