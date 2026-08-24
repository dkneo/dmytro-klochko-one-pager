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

test("the sitting can be sat", () => {
  const html = read("dist/eidos/sit/index.html");
  const css = bundledCss("dist/eidos/sit/index.html");

  // every candidate rides along, and every one of them is attributed
  const data = JSON.parse(html.match(/id="sit-data"[^>]*>([^<]*)</)[1]);
  assert.ok(data.length >= 20, `expected 20+ candidates, found ${data.length}`);
  for (const c of data) {
    assert.ok(c.id && c.src, `candidate without id or src: ${JSON.stringify(c)}`);
    assert.ok(c.source, `${c.id} has no source url`);
    assert.ok(c.licence, `${c.id} has no licence`);
  }

  // all eight weathers are offered for a correction
  const picks = [...html.matchAll(/data-w="([^"]+)"/g)].map((m) => m[1]);
  assert.equal(picks.length, 8, "the weather picker must offer all eight");

  // the card flies to 120vw, so the stage must clip sideways or a phone
  // gains half a screen of horizontal scroll
  assert.match(css, /overflow-x:\s*clip/);
  // and a finger must still be able to scroll the page past the deck
  assert.match(css, /touch-action:\s*pan-y/);

  // A kept card waits, lit, while its weather is settled: asking which
  // weather a painting belongs to after throwing the painting off screen is
  // filing from memory, and it left a screen of empty dark behind.
  // Astro scopes every selector with a [data-astro-cid-…] attribute, so a
  // naive /\.sit-after\{/ never matches and a negative assertion built on one
  // passes while guarding nothing. `scoped` allows for the attribute.
  const scoped = (sel) => sel.replace(/\./g, "\\.") + "(?:\\[[^\\]]*\\])?";
  assert.match(css, new RegExp(`${scoped(".sit-card")}\\.is-held`));
  assert.ok(
    !new RegExp(`${scoped(".sit-after")}\\{[^}]*position:\\s*absolute`).test(css),
    "the question must sit under its card in the flow, not float below a void",
  );
  assert.ok(
    !new RegExp(`${scoped(".sit-stage")}\\{[^}]*min-height`).test(css),
    "the stage must not reserve height it may not fill",
  );
  // the guard must be able to fail: prove it sees the rules at all
  assert.match(css, new RegExp(`${scoped(".sit-after")}\\{`));
  assert.match(css, new RegExp(`${scoped(".sit-stage")}\\{`));
});

test("both orbits read from one mapper, and agree", async () => {
  const { toMarks } = await import("../src/scripts/eidos-marks.mjs");
  const map = JSON.parse(read("src/data/map.json"));
  const { marks, threads } = toMarks(map);

  assert.equal(marks.length, map.items.length);
  for (const m of marks) {
    for (const k of ["x", "y", "z"]) {
      assert.equal(Number.isFinite(m[k]), true, `${m.id} has a non-finite ${k}`);
    }
    assert.ok(m.thumb || m.glyph, `${m.id} has neither thumbnail nor glyph`);
  }
  assert.ok(threads.length > 0, "the author threads vanished");

  // the page and the porch must ship the same geometry
  const orbit = JSON.parse(read("dist/eidos/orbit/index.html").match(/id="eo-data"[^>]*>([^<]*)</)[1]);
  const porch = JSON.parse(read("dist/index.html").match(/id="me-orbit-data"[^>]*>([^<]*)</)[1]);
  assert.deepEqual(porch.marks, orbit.marks, "the porch and the orbit page disagree");

  // the thumbnails they point at have to exist
  for (const m of marks.filter((x) => x.thumb).slice(0, 8)) {
    assert.ok(exists(path.join("public", m.thumb)), `missing derivative ${m.thumb}`);
  }
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
