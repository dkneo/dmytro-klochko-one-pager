import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

// The reading room, the door under the wall, the composer under the game.
// Each of these was a screenshot he sent back.

const root = path.resolve(import.meta.dirname, "..");
const read = (f) => fs.readFileSync(path.join(root, f), "utf8");
// Astro inlines a page's css and js when small and bundles them into /_astro
// when not, so a guard that reads only one place passes while guarding air.
const styles = (page) => {
  const html = read(page);
  const linked = [...html.matchAll(/href="(\/_astro\/[^"]+\.css)"/g)].map((m) => read(path.join("dist", m[1])));
  const inline = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]);
  return [...linked, ...inline].join("\n");
};
const scripts = (page) => {
  const html = read(page);
  const linked = [...html.matchAll(/src="(\/_astro\/[^"]+\.js)"/g)].map((m) => read(path.join("dist", m[1])));
  const inline = [...html.matchAll(/<script(?![^>]*type="application\/json")[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  return [...linked, ...inline].join("\n");
};

test("the reading room speaks in one voice: upright, prose size, english first", () => {
  const css = read("src/styles/dream.css");
  const base = css.match(/\.lib-line \{[^}]*\}/)[0];
  assert.match(base, /font-style:\s*normal/, "set text is italic at the base");
  assert.match(base, /font-size:\s*var\(--t-prose\)/, "set text is not at the prose size");
  const orig = css.match(/\.lib-orig \{[^}]*\}/)[0];
  assert.match(orig, /font-style:\s*italic/, "the original tongue is the one italic, and it is missing");

  const html = read("dist/eidos/index.html");
  // for every translated quote, the english precedes the original in the DOM
  const lines = [...html.matchAll(/<span class="lib-line"[^>]*>([\s\S]*?)<\/button>/g)].map((m) => m[1]);
  const withOrig = lines.filter((l) => l.includes('class="lib-orig"'));
  assert.ok(withOrig.length >= 5, `expected translated lines, found ${withOrig.length}`);
  for (const l of withOrig) {
    const english = l.slice(0, l.indexOf('<span class="lib-orig"')).replace(/<[^>]+>/g, "").trim();
    assert.ok(english.length > 0, "a translated line opens with its original instead of its english");
  }
});

test("no punctuation mark is left to wrap alone", () => {
  // French spaces its ! ? ; : off the word. On a measure, that space became a
  // break and the mark fell alone to the next line. The build glues them.
  const html = read("dist/eidos/index.html");
  const room = html.slice(html.indexOf('id="words"'), html.indexOf('id="read"'));
  const loose = room.match(/[a-zà-ÿ] [!?;:»]/gi) || [];
  assert.deepEqual(loose, [], `a plain space before a mark: ${loose.join(" · ")}`);
  assert.match(room, / [!?;:»]/, "the glue itself is missing — no narrow no-break space in the room");
});

test("the homepage folds the library into literally me", () => {
  const home = read("dist/index.html");
  assert.doesNotMatch(home, /id="eidos"/, "the eidos chapter is back on the homepage");
  const me = home.slice(home.indexOf('id="me"'), home.indexOf('id="contact"'));
  assert.match(me, /class="me-door" href="\/eidos"/, "no door to the library under the wall");
  assert.match(me, /class="wall"/, "the wall of people is gone");
});

test("the library opens on a small portrait and a pill that fits", () => {
  const html = read("dist/eidos/index.html");
  assert.match(html, /class="lib-portrait"/, "no hero");
  assert.match(html, /hi-2\.webp" width="560" height="499"/, "the hero declares the wrong size");
  assert.match(html, /class="lib-toc-door"[^>]*>inbox <b[^>]*>\d+<\/b>/, "the door says more than fits");
  // the library's css crossed the inline threshold and is bundled now
  assert.match(styles("dist/eidos/index.html"), /\.lib-toc-door(\[[^\]]*\])?\{[^}]*white-space:nowrap/, "the pill can still wrap out of its border");
});

test("the composer sits under the game and is lit from behind on focus", () => {
  const html = read("dist/eidos/inbox/index.html");
  const deck = html.indexOf('id="stage"'), form = html.indexOf('id="throw"');
  assert.ok(deck > 0 && form > deck, "the composer is above the deck");
  const css = styles("dist/eidos/inbox/index.html");
  assert.match(css, /\.in-throw[^{]*:before\{[^}]*conic-gradient/, "no light behind the composer");
  assert.match(css, /\.in-throw(\[[^\]]*\])?:focus-within(\[[^\]]*\])?:before\{[^}]*opacity/, "the light does not answer focus");
  assert.doesNotMatch(css, /\.in-throw(\[[^\]]*\])?:hover/, "the light must answer focus, never hover");
});

test("the deck is dealt so no two neighbours are alike", () => {
  // the bundle renames locals, so the deal is read where it is written
  const src = read("src/pages/eidos/inbox.astro");
  assert.match(src, /c\.type !== prev\.type/, "the deal does not separate kinds");
  assert.match(src, /host\(c\) !== host\(prev\)/, "the deal does not separate museums");
  assert.match(src, /era\(c\.year\) !== era\(prev\.year\)/, "the deal does not alternate eras");
  // and the built page still ships a deck script at all
  assert.ok(scripts("dist/eidos/inbox/index.html").length > 500, "the inbox ships no script");
});
