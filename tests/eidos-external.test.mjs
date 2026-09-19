import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");

// Eidos as an external product: findable, shareable, honest to a screen
// reader, and stable as it loads.
test("eidos product pages are indexable; only the private rooms hide", () => {
  for (const p of ["dist/eidos/index.html", "dist/eidos/map/index.html", "dist/eidos/words/index.html", "dist/eidos/portrait/index.html"]) {
    assert.doesNotMatch(read(p), /name="robots" content="noindex/, `${p} hides from search`);
    assert.match(read(p), /property="og:site_name" content="eidos"/, `${p} has no site name for shares`);
  }
  for (const p of ["dist/eidos/inbox/index.html", "dist/eidos/reads/index.html"]) assert.match(read(p), /name="robots" content="noindex, follow"/, `${p} is a private room and must stay unlisted`);
  const headers = read("public/_headers");
  assert.doesNotMatch(headers, /^\/eidos\/\*\n  X-Robots-Tag: noindex/m, "the header rule still hides every eidos page");
  for (const r of ["/eidos/inbox/*", "/eidos/reads/*"]) assert.ok(headers.includes(`${r}\n  X-Robots-Tag: noindex, follow`), `${r} lost its header`);
  assert.doesNotMatch(read("scripts/sitemap-build.mjs"), /"\/eidos\/",\n/, "the sitemap still skips the eidos home");
});

test("a work page carries a VisualArtwork record, sized related plates and a true picture", () => {
  const dir = path.join(root, "dist/eidos/work");
  const pages = fs.readdirSync(dir).slice(0, 40).map((d) => read(`dist/eidos/work/${d}/index.html`));
  assert.ok(pages.length >= 20);
  for (const html of pages) {
    const ld = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    assert.ok(ld, "no JSON-LD");
    const data = JSON.parse(ld[1]);
    assert.equal(data["@type"], "VisualArtwork");
    assert.ok(data.name && data.image && data.url && data.isPartOf?.name === "eidos", "the record is incomplete");
    const imgs = [...html.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]);
    for (const tag of imgs) assert.match(tag, /\bwidth="\d+"/, `an unsized picture: ${tag.slice(0, 80)}`);
  }
});

test("the words page speaks real language tags and the map has one main landmark", () => {
  const words = read("dist/eidos/words/index.html");
  for (const m of words.matchAll(/<p lang="([^"]+)"/g)) assert.match(m[1], /^[a-z]{2,3}(-[A-Za-z]{2,4})?$/, `lang="${m[1]}" is a word, not a tag`);
  assert.equal((read("dist/eidos/map/index.html").match(/<main\b/g) || []).length, 1, "the map nests a second <main>");
});

test("paper text on the olive tiles clears 4.5:1", () => {
  const css = read("src/styles/pages/eidos-product.css");
  const hex = (name) => css.match(new RegExp(`--${name}: (#[0-9a-f]{6})`))[1];
  const L = (h) => { const c = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
  const ratio = (a, b) => (Math.max(L(a), L(b)) + 0.05) / (Math.min(L(a), L(b)) + 0.05);
  assert.ok(ratio(hex("ep-paper-light"), hex("ep-olive")) >= 4.5, `olive tiles read ${ratio(hex("ep-paper-light"), hex("ep-olive")).toFixed(2)}:1`);
});

test("on a phone no eidos label is set under twelve pixels", () => {
  for (const f of ["eidos-product", "eidos-studio", "eidos-work", "eidos-places"]) {
    const css = read(`src/styles/pages/${f}.css`);
    assert.match(css, /@media \(max-width: 680px\) \{\n  [^{]+\{ font-size: 0\.75rem; \}\n\}/, `${f}: no phone legibility floor`);
  }
  assert.match(read("dist/eidos/index.html"), /hero-mobile-poster-720\.avif 720w/, "the phone hero has no 720 candidate");
});
