import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = path.resolve(import.meta.dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const exists = (file) => fs.existsSync(path.join(root, file));

test("the homepage lights weather only while the hero owns the sky", () => {
  const page = read("src/pages/index.astro");
  const fire = [...page.matchAll(/data-weather="fire"/g)];
  const calm = [...page.matchAll(/data-weather="none"/g)];

  assert.equal(fire.length, 1, "only the hero should carry live fire weather");
  assert.equal(calm.length, 6, "every later homepage chapter should calm the weather");
});

test("visible hero video plays on phones unless the user asks the browser to save data", async () => {
  const file = "src/scripts/motion-control.js";
  assert.ok(exists(file), "the shared motion policy is missing");
  const { motionPolicy } = await import(path.join(root, file));

  assert.deepEqual(
    motionPolicy({ width: 390, fine: false, reduced: false, saveData: false, paused: false }),
    { rich: false, paused: false, autoplay: true },
  );
  assert.deepEqual(
    motionPolicy({ width: 390, fine: false, reduced: false, saveData: true, paused: false }),
    { rich: false, paused: false, autoplay: false },
  );
  assert.deepEqual(
    motionPolicy({ width: 1366, fine: true, reduced: false, saveData: false, paused: false }),
    { rich: true, paused: false, autoplay: true },
  );
  assert.equal(
    motionPolicy({ width: 1366, fine: true, reduced: true, saveData: false, paused: false }).paused,
    true,
  );
  assert.equal(
    motionPolicy({ width: 1366, fine: true, reduced: false, saveData: true, paused: false }).rich,
    false,
  );
  assert.equal(
    motionPolicy({ width: 1366, fine: true, reduced: false, saveData: false, paused: true }).autoplay,
    false,
  );
});

test("homepage navigation contains destinations, not unexplained utility modes", () => {
  const layout = read("src/layouts/Layout.astro");
  const page = read("src/pages/index.astro");

  assert.doesNotMatch(layout, /class="tone-btn/);
  assert.doesNotMatch(layout, /class="motion-btn/);
  assert.match(layout, /setupMotionControl/);
  assert.doesNotMatch(page, /<video autoplay[^>]*data-ambient-video/);
  const ambient = [...page.matchAll(/<video[^>]*data-ambient-video[^>]*>/g)].map((match) => match[0]);
  assert.equal(ambient.length, 6);
  assert.ok(ambient.every((tag) => /preload="none"/.test(tag)));
});

test("replika keeps one playable stage while its alternate footage stays deferred", () => {
  const html = read("dist/index.html");
  const videoTags = [...html.matchAll(/<video\b[^>]*>/g)].map((match) => match[0]);
  const stage = videoTags.filter((tag) => tag.includes("data-replika-stage"));
  const pickTags = [...html.matchAll(/<button\b[^>]*>/g)]
    .map((match) => match[0])
    .filter((tag) => tag.includes("data-replika-pick"));

  assert.equal(stage.length, 1, "the case file should load through one video element");
  assert.match(stage[0], /preload="none"/);
  assert.doesNotMatch(stage[0], /autoplay/);
  assert.ok(pickTags.length >= 3, "the stage needs alternates to be a strip at all");
  assert.ok(pickTags.length <= 4,
    "past four the strip stops being a reel and becomes a cast list of strangers");

  // The section makes its case in motion. It twice grew a still gallery
  // beside the film — five scattered prints, then three cropped to a shared
  // ratio that beheaded the portrait — and both times the page ended up with
  // more photographs of models than of him.
  assert.doesNotMatch(html, /data-replika-print/,
    "the replika case is the film, not a wall of campaign stills");
  assert.equal(pickTags.filter((tag) => /aria-pressed="true"/.test(tag)).length, 1);

  const sources = pickTags.map((tag) => tag.match(/data-src="([^"]+)"/)?.[1]);
  assert.ok(sources.every(Boolean));
  assert.equal(new Set(sources).size, sources.length, "the strip should not repeat an encode");
  for (const src of sources) assert.ok(exists(`public${src}`), `${src} is missing`);

  const sizes = sources.map((src) => fs.statSync(path.join(root, "public", src)).size);
  assert.ok(sizes.every((size) => size < 3_500_000), "each deferred clip must stay web-sized");
  assert.ok(sizes.reduce((sum, size) => sum + size, 0) < 20_000_000, "the full case file is too heavy");
});

test("the phone stylesheet leaves the hero films as its only ambient motion", () => {
  const css = read("src/styles/dream.css");

  assert.match(css, /@media \(max-width: 900px\)[\s\S]*?\.weather--fire[\s\S]*?display:\s*none/);
  assert.match(css, /@media \(max-width: 700px\)\s*\{\s*\.dream-sky b\s*\{[^}]*display:\s*none[^}]*\}/);
});

test("proof arrives before the homepage asks readers to trust its operating style", () => {
  const page = read("src/pages/index.astro");
  assert.ok(page.indexOf('id="experience"') < page.indexOf('id="how"'));
  assert.match(page, /id="experience"[\s\S]*?<p class="card-no">02<\/p>/);
  assert.match(page, /id="how"[\s\S]*?<p class="card-no">03<\/p>/);
  assert.match(page, /my sense of urgency is outstanding/i);
  assert.match(page, /natural aptitude for <b>taste<\/b>/i);
  assert.match(page, /<b>clairvoyant<\/b>/i);
  assert.match(page, /truly novel and beautiful/i);
  assert.match(page, /unleash their potential to the fullest/i);
});

test("the homepage moves through three authored acts without changing sky mid-thought", () => {
  const page = read("src/pages/index.astro");
  const sceneFor = (id) => page.match(new RegExp(`<section[^>]*id="${id}"[^>]*data-scene="([^"]+)"`))?.[1];

  assert.match(page, /scenes=\{\["fire", "ember", "estuary"\]\}/);
  assert.deepEqual(
    ["top", "experience", "how", "journey", "alongside", "me", "contact"].map(sceneFor),
    ["fire", "ember", "ember", "ember", "estuary", "estuary", "estuary"],
  );
});

test("the homepage wall ends with the work itself instead of a second orbit", () => {
  const page = read("src/pages/index.astro");

  assert.doesNotMatch(page, /me-orbit|me-orbit-data|orbitData|eidos-mini/);
});

test("every journey preview works from the keyboard and announces its state", () => {
  const page = read("src/pages/index.astro");
  assert.match(page, /role="button"/);
  assert.match(page, /tabindex="0"/);
  assert.match(page, /aria-expanded="false"/);
  assert.match(page, /aria-controls="journey-preview"/);
  assert.match(page, /id="journey-preview"/);
  assert.match(page, /keydown/);
  assert.match(page, /Enter/);
  assert.match(page, /aria-expanded/);
});

test("desktop readers get a real chapter index into the long homepage", () => {
  const page = read("src/pages/index.astro");
  const chapters = ["top", "experience", "how", "journey", "alongside", "me", "contact"];

  assert.match(page, /aria-label="on this page"/);
  assert.match(page, /href=\{`#\$\{chapter\.id\}`\}/);
  for (const chapter of chapters) assert.match(page, new RegExp(`id: "${chapter}"`));
});

test("the chapter rail follows the section crossing the reading line", async () => {
  const file = "src/scripts/chapter-rail.js";
  assert.ok(exists(file), "the chapter rail has no deferred scroll controller");
  const { setupChapterRail } = await import(path.join(root, file));

  const attrs = new Map();
  const links = ["top", "experience"].map((id) => ({
    dataset: { chapter: id },
    setAttribute(name, value) { attrs.set(`${id}:${name}`, value); },
    removeAttribute(name) { attrs.delete(`${id}:${name}`); },
  }));
  const rects = {
    top: { top: 0, bottom: 620 },
    experience: { top: 620, bottom: 1600 },
  };
  const sections = Object.fromEntries(Object.keys(rects).map((id) => [id, {
    id,
    getBoundingClientRect: () => rects[id],
  }]));
  const listeners = new Map();
  const doc = {
    querySelectorAll: () => links,
    getElementById: (id) => sections[id],
  };
  const view = {
    innerHeight: 1000,
    addEventListener: (name, fn) => listeners.set(name, fn),
    requestAnimationFrame: (fn) => { fn(); return 1; },
  };

  setupChapterRail(doc, view);
  assert.equal(attrs.get("top:aria-current"), "location");

  rects.top = { top: -700, bottom: -80 };
  rects.experience = { top: -80, bottom: 900 };
  listeners.get("scroll")();
  assert.equal(attrs.has("top:aria-current"), false);
  assert.equal(attrs.get("experience:aria-current"), "location");
});

test("the journey easel has two media buffers so a new memory cannot teleport in", () => {
  const page = read("src/pages/index.astro");
  const layers = [...page.matchAll(/class="easel-layer(?: is-active)?"/g)];

  assert.equal(layers.length, 2);
});

test("fingerprinted bundles can stay cached while the html remains fresh", () => {
  const headers = "public/_headers";
  assert.ok(exists(headers));
  assert.match(read(headers), /\/_astro\/\*/);
  assert.match(read(headers), /Cache-Control: public, max-age=31536000, immutable/);
});
