import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

// The reading room, the door under the wall, the composer under the game.
// Each of these was a screenshot he sent back.

const root = path.resolve(import.meta.dirname, "..");
const read = (f) => fs.readFileSync(path.join(root, f), "utf8");

// the site's css is dream.css plus one file per page family (split 3 Sep 2026);
// a guard that reads only dream.css passes while a rule it cares about sits
// in pages/eidos.css
const allCss = () => [
  read("src/styles/dream.css"),
  ...fs.readdirSync(path.join(root, "src/styles/pages")).filter((f) => f.endsWith(".css")).map((f) => read(`src/styles/pages/${f}`)),
].join("\n");
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

test("the parked words keep english first and the original quieter", () => {
  const css = allCss();
  const base = css.match(/\.ep-word blockquote\s*\{[^}]*\}/)?.[0] ?? "";
  assert.match(base, /font-size:/, "set text has no deliberate reading size");
  const orig = css.match(/\.ep-word > p\s*\{[^}]*\}/)?.[0] ?? "";
  assert.match(orig, /color:\s*var\(--ep-quiet\)/, "the original tongue is not quieter");

  const html = read("dist/eidos/words/index.html");
  // for every translated quote, the english precedes the original in the DOM
  const lines = [...html.matchAll(/<article[^>]*data-word-piece[^>]*>([\s\S]*?)<\/article>/g)].map((m) => m[1]);
  const withOrig = lines.filter((line) => line.includes(" lang="));
  assert.ok(withOrig.length >= 5, `expected translated lines, found ${withOrig.length}`);
  for (const line of withOrig) {
    const english = line.slice(0, line.indexOf("<p lang=")).replace(/<[^>]+>/g, "").trim();
    assert.ok(english.length > 0, "a translated line opens with its original instead of its english");
  }
});

test("no punctuation mark is left to wrap alone", () => {
  // French spaces its ! ? ; : off the word. On a measure, that space became a
  // break and the mark fell alone to the next line. The build glues them.
  const html = read("dist/eidos/words/index.html");
  const room = html.slice(html.indexOf('class="ep-words-grid"'), html.indexOf('class="ep-footer"'));
  const loose = room.match(/[a-zà-ÿ] [!?;:»]/gi) || [];
  assert.deepEqual(loose, [], `a plain space before a mark: ${loose.join(" · ")}`);
});

test("the homepage folds the library into literally me", () => {
  const home = read("dist/index.html");
  assert.doesNotMatch(home, /id="eidos"/, "the eidos chapter is back on the homepage");
  const me = home.slice(home.indexOf('id="me"'), home.indexOf('id="contact"'));
  assert.match(me, /class="me-door" href="\/eidos"/, "no door to the library under the wall");
  assert.match(me, /class="wall"/, "the wall of people is gone");
});

test("the library opens as a product with a static-first character scene", () => {
  const html = read("dist/eidos/index.html");
  assert.match(html, /class="ep-hero"/, "no hero");
  assert.match(html, /hero-desktop-poster\.webp" width="1920" height="1080"/, "the desktop hero declares the wrong size");
  assert.match(html, /hero-mobile-poster\.webp/, "the mobile hero has no poster");
  assert.match(styles("dist/eidos/index.html"), /\.ep-action[^}]*min-height:\s*44px/, "hero actions lost their tap floor");
});

test("the studio says what is temporarily held without exposing non-visual intake", () => {
  const html = read("dist/eidos/inbox/index.html");
  assert.match(html, /visuals only for now/);
  assert.match(html, /words and links are safely held/);
  assert.doesNotMatch(html, /id="throw"|id="url"|read and add/);
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

test("every read candidate in the inbox says who, where and why", () => {
  // the substacks and newsletters he was asked to be offered arrive as cards
  // to swipe, never as keeps: only he keeps
  const inbox = JSON.parse(read("public/inbox.json"));
  const reads = inbox.candidates.filter((c) => c.type === "bookmark");
  assert.ok(reads.length >= 10, `expected a shelf of reads to judge, found ${reads.length}`);
  for (const r of reads) {
    assert.match(r.url, /^https:\/\//, `${r.id} has no url`);
    assert.ok(r.who && r.site && r.line, `${r.id} is missing who, site or a line saying why`);
    assert.ok(r.weather, `${r.id} has no weather to be filed under`);
  }
  // a read is a candidate until judged; nothing here is in the vault yet
  const kept = fs.readdirSync(path.join(root, "vault/bookmarks")).filter((f) => f.endsWith(".md"));
  for (const r of reads) assert.ok(!kept.includes(`${r.id}.md`), `${r.id} was kept without a swipe`);
});

test("a poem, a quote or a song in the deck carries what a card and a note need", () => {
  // words arrive as cards to judge, never as notes — the twenty-four canon
  // words from the cursor branch came in this way, so a keep files them and a
  // pass drops them, and nothing enters the vault without a swipe
  const inbox = JSON.parse(read("public/inbox.json"));
  const words = inbox.candidates.filter((c) => ["poem", "quote", "song"].includes(c.type));
  assert.ok(words.length >= 20, `expected the canon words to be on offer, found ${words.length}`);
  for (const w of words) {
    assert.ok(!w.src, `${w.id} is a word with a picture`);
    assert.ok(w.who, `${w.id} has no maker`);
    assert.ok(w.line || w.title, `${w.id} has neither words nor a title`);
    assert.match(w.note_md || "", /^---\ntype: (poem|quote|song)\n/, `${w.id} did not bring its note`);
    assert.match(w.note_md, /added: \{\{added\}\}/, `${w.id}'s note has a fixed date`);
    assert.doesNotMatch(w.note_md, /^weather: /m, `${w.id} arrived with a weather nobody chose`);
  }
  const shelved = [...fs.readdirSync(path.join(root, "vault/poems")), ...fs.readdirSync(path.join(root, "vault/quotes")), ...fs.readdirSync(path.join(root, "vault/songs"))];
  for (const w of words) assert.ok(!shelved.includes(`${w.id}.md`), `${w.id} is in the vault without a swipe`);
});

test("a card never wears the last card's picture, and a missing one can be asked for again", () => {
  // Felsenhuhn, a 1910 Wiener Werkstätte object, showed under a Chinese
  // landscape scroll: the caption changed at once and the picture only when it
  // had decoded, so a slow or failed image left the previous painting on the
  // new card. And a failure used to skip the card silently.
  const src = read("src/pages/eidos/inbox.astro");
  const clear = src.indexOf('art.removeAttribute("src")'), set = src.indexOf("art.src = c.src");
  assert.ok(clear > 0 && clear < set, "the old picture must be cleared before the new src is set");
  assert.doesNotMatch(src, /so it is skipped/, "a picture that did not arrive must be said, not skipped");
  const html = read("dist/eidos/inbox/index.html");
  assert.match(html, /id="art-retry"/, "no way to ask for the picture again");
  assert.match(html, /id="art-miss"[^>]*hidden/, "the miss panel must start hidden");
});

test("the visual studio does not ask for commentary before a verdict", () => {
  const html = read("dist/eidos/inbox/index.html");
  const src = read("src/pages/eidos/inbox.astro");
  assert.doesNotMatch(html, /field note|id="say"|what held you here/);
  assert.doesNotMatch(src, /draftKey|localStorage|say\.value/);
  assert.match(src, /send\(cand, "keep", cand\.weather\)/);
  assert.match(src, /send\(cand, "pass", ""\)/);
});

// ── the keys ─────────────────────────────────────────────────────────────
test("the inbox answers the keyboard the way keyboard-first tools do", () => {
  const html = read("dist/eidos/inbox/index.html");
  const src = read("src/pages/eidos/inbox.astro");
  // every button says its key, in the markup and to assistive tech
  assert.match(html, /id="pass"[^>]*aria-keyshortcuts="ArrowLeft h"/, "pass has no key");
  assert.match(html, /id="keep"[^>]*aria-keyshortcuts="ArrowRight l"/, "keep has no key");
  assert.match(html, /id="undo"[^>]*aria-keyshortcuts="u z Meta\+z"[\s\S]*?<kbd[^>]*>u<\/kbd>/, "undo does not show its key");
  // the sheet behind ? is a native dialog
  assert.match(html, /<dialog class="in-keys" id="keys"/, "no shortcuts sheet");
  assert.match(html, /<form method="dialog"[^>]*>/, "the sheet has no native close");
  // one map, and the three rules
  assert.match(src, /const KEYS = \{[\s\S]*ArrowRight: keep, l: keep,[\s\S]*ArrowLeft: pass, h: pass,[\s\S]*"\?": toggleKeys,/, "the key map is incomplete");
  assert.match(src, /closest\("input,textarea,select"\)\) return;/, "letters fire inside fields");
  assert.match(src, /if \(e\.repeat && act !== undo\) return;/, "a held arrow fires twice");
  assert.match(src, /if \(e\.metaKey \|\| e\.ctrlKey \|\| e\.altKey\) return;/, "browser chords are swallowed");
  assert.match(src, /e\.key\.toLowerCase\(\) === "z"\) \{ e\.preventDefault\(\); undo\(\)/, "⌘z does not undo");
});
