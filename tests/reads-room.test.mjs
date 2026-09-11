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

test("the reading room is a door in the eidos nav, and discover points at it", () => {
  assert.match(read("dist/eidos/index.html"), /href="\/eidos\/reads"[^>]*>reads</, "no door in the nav");
  assert.match(read("dist/eidos/inbox/index.html"), /href="\/eidos\/reads"[^>]*>the reading room</, "discover does not point at the reading room");
  // and discover itself stays pictures only
  assert.doesNotMatch(read("dist/eidos/inbox/index.html"), /id="throw"|id="say"/, "intake leaked back into discover");
});

test("the reading room answers the keyboard like discover does", () => {
  const src = read("src/pages/eidos/reads.astro");
  assert.match(src, /const KEYS = \{[\s\S]*ArrowRight: keep, l: keep,[\s\S]*"\/": \(\) => \$\("url"\)\.focus\(\),[\s\S]*"\?": toggleKeys,/);
  assert.match(src, /closest\("input,textarea,select"\)\) return;/);
  assert.match(src, /if \(e\.repeat && act !== undo\) return;/);
  assert.match(src, /e\.key === "Enter" && \(e\.metaKey \|\| e\.ctrlKey\)[\s\S]*keep\(\)/, "⌘↵ does not keep from the line");
});
