import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");

// The reading room is where the goal's "throw links in, swipe, summarise,
// make notes" lives, now that Discover is pictures only by design. These
// pin the four things that room must always have.
test("the reading room has the composer, the read card, his line, and what stayed", () => {
  const html = read("dist/eidos/reads/index.html");
  const src = read("src/pages/eidos/reads.astro");
  assert.match(html, /<form class="in-throw" id="throw"[\s\S]*<input type="url" id="url"/, "no way to throw a link");
  assert.match(src, /fetch\("\/api\/eidos\/bookmark", \{ method: "POST"/, "a thrown link is not saved");
  assert.match(html, /class="in-read" id="read"[\s\S]*id="r-site"[\s\S]*id="r-title"[\s\S]*id="r-desc"/, "no read card");
  assert.match(html, /<input type="text" id="say"/, "no line in his words");
  assert.match(src, /say: line \|\| ""/, "the verdict does not carry the line");
  assert.match(src, /fetch\("\/api\/eidos\/bookmarks"\)/, "his own links never join the queue");
  assert.match(src, /fetch\("\/api\/eidos\/summary"/, "a thrown link is never summarised");
  assert.match(html, /read &amp; learned[\s\S]*what stayed\./, "no read and learned shelf");
  assert.match(html, /data-kept-read=|the first kept read lands here/, "the shelf neither lists nor promises");
  // the queue carries the harvest's reads, substacks included
  const payload = JSON.parse(html.match(/<script type="application\/json" id="in-data">([\s\S]*?)<\/script>/)?.[1] || "[]");
  assert.ok(payload.length >= 10, `only ${payload.length} reads in the queue`);
  assert.ok(payload.every((c) => c.type === "bookmark" && c.url), "a non-link entered the reading room");
  assert.ok(payload.some((c) => /substack\.com/.test(c.url)), "no substack in the queue");
});

test("the reading room stays secondary while discover still points at it", () => {
  const moodboard = read("dist/eidos/index.html");
  const nav = moodboard.match(/<nav class="ep-nav"[\s\S]*?<\/nav>/)?.[0] || "";
  assert.doesNotMatch(nav, /href="\/eidos\/reads"/, "the reading room displaced a primary visual-product door");
  assert.match(read("dist/eidos/inbox/index.html"), /href="\/eidos\/reads"[^>]*>the reading room</, "discover does not point at the reading room");
  // and discover itself stays pictures only
  assert.doesNotMatch(read("dist/eidos/inbox/index.html"), /id="throw"|id="say"/, "intake leaked back into discover");
});

test("the reading room answers the keyboard like discover does", () => {
  const src = read("src/pages/eidos/reads.astro");
  assert.match(src, /const KEYS = \{[\s\S]*ArrowRight: \(\) => keep\("keyboard"\), l: \(\) => keep\("keyboard"\),[\s\S]*"\/": \(\) => \$\("url"\)\.focus\(\),[\s\S]*"\?": toggleKeys,/);
  // M01: the keyboard path has no flight and no wait; a cancelled pointer never commits
  assert.match(src, /const decisionDelay = \(origin\) => \(origin === "keyboard" \? 0 : 240\);/);
  assert.match(src, /if \(origin === "keyboard"\) \{ card\.style\.opacity = "0"; return; \}/);
  assert.match(src, /pass\(e\.detail === 0 \? "keyboard" : "button"\)/);
  assert.match(src, /card\.addEventListener\("pointercancel", onCancel\);/);
  assert.doesNotMatch(src, /card\.addEventListener\("pointercancel", onUp\)/);
  assert.match(src, /closest\("input,textarea,select"\)\) return;/);
  assert.match(src, /if \(e\.repeat && act !== undo\) return;/);
  assert.match(src, /e\.key === "Enter" && \(e\.metaKey \|\| e\.ctrlKey\)[\s\S]*keep\("keyboard"\)/, "⌘↵ does not keep from the line");
});

// ── the swipe knows how fast the hand moved (M02) ────────────────────────
test("both rooms judge a swipe by distance or velocity, re-grab from the live offset, and hold will-change only while dragging", () => {
  for (const f of ["src/pages/eidos/inbox.astro", "src/pages/eidos/reads.astro"]) {
    const src = read(f);
    assert.match(src, /const COMMIT_PX = 110, COMMIT_V = 0\.11;/, `${f}: thresholds`);
    assert.match(src, /const commit = Math\.abs\(dx\) > COMMIT_PX \|\| \(fast && Math\.abs\(dx\) > 24\);/, `${f}: velocity does not commit`);
    assert.match(src, /x0 = e\.clientX - live;/, `${f}: a re-grab jumps to zero`);
    assert.match(src, /Math\.min\(300, Math\.max\(160, 260 - Math\.abs\(vx\) \* 400\)\)/, `${f}: the flight ignores the hand`);
    assert.match(src, /card\.style\.willChange = "transform";/, `${f}: no layer for the gesture`);
    assert.match(src, /card\.style\.willChange = "";/, `${f}: the layer is never released`);
  }
  const studio = read("src/styles/pages/eidos-studio.css");
  assert.doesNotMatch(studio, /\.in-card \{[^}]*will-change: transform;/s, "a permanent compositor layer on the card");
  assert.match(studio, /\.in-edge \{[^}]*transition: transform 120ms var\(--ease-out\)/, "the stamp only fades");
});

// ── things appear from where they came (M09) ─────────────────────────────
test("the deal rises into place for the pointer and not for a key; the lightbox grows from its plate", () => {
  for (const f of ["src/pages/eidos/inbox.astro", "src/pages/eidos/reads.astro"]) {
    const src = read(f);
    assert.match(src, /function next\(origin = "pointer"\)/, `${f}: next does not know its origin`);
    assert.match(src, /if \(origin !== "keyboard" && !REDUCED\) \{[\s\S]*translateY\(10px\) scale\(0\.985\)/, `${f}: no deal entrance, or it runs on the keyboard`);
    assert.match(src, /getPropertyValue\("--ease-out"\)/, `${f}: the curve is not read from the token`);
    assert.doesNotMatch(src, /cubic-bezier\(/, `${f}: a literal curve`);
  }
  const product = read("src/styles/pages/eidos-product.css");
  assert.match(product, /\.ep-detail\[open\] \{ opacity: 1; transform: none;/, "the lightbox has no open state");
  assert.match(product, /@starting-style \{ \.ep-detail\[open\]/, "the lightbox has no entrance");
  assert.match(product, /transform-origin: var\(--from-x, 50%\) var\(--from-y, 50%\)/, "the lightbox grows from its centre, not the plate");
  assert.match(read("src/components/eidos/EidosMoodboard.astro"), /setProperty\("--from-x"/, "the click does not tell the lightbox where it came from");
});

// ── the rare moments get their budget (M10) ──────────────────────────────
test("the end of the deck unrolls, the gate rises, the record acknowledges; nothing flies across the page", () => {
  for (const f of ["src/pages/eidos/inbox.astro", "src/pages/eidos/reads.astro"]) {
    const src = read(f);
    assert.match(src, /noteLine\.animate\(\[\{ clipPath: "inset\(0 0 100% 0\)", opacity: 0 \}/, `${f}: the closing line appears by teleport`);
    assert.match(src, /behavior: REDUCED \? "instant" : "smooth"/, `${f}: the gate scroll is a jump`);
    assert.match(src, /\$\("gate"\)\.animate\(\[\{ opacity: 0, transform: "translateY\(12px\)" \}/, `${f}: the gate has no entrance`);
    assert.match(src, /fade\.finished\.then\(\(\) => \{ fade\.cancel\(\); gateIn\(\); \}\)/, `${f}: the workbench fade is not released`);
    assert.match(src, /li\.animate\(\[\{ opacity: 0, transform: "translateY\(-6px\)" \}/, `${f}: the new trail line teleports`);
    assert.match(src, /if \(sat !== lastSat && !REDUCED\) \$\("count"\)\.animate/, `${f}: the counter does not acknowledge`);
    assert.doesNotMatch(src, /in-ghost|hostname\).*animate/, `${f}: a flying hostname (boundary)`);
  }
});
