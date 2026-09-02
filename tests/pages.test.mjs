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

test("the homepage introduces dmytro once while inner pages keep a way home", () => {
  const home = read("dist/index.html");
  const press = read("dist/press/index.html");

  assert.doesNotMatch(home, /class="masthead"/,
    "the homepage masthead repeats the name in the hero directly below it");
  assert.match(press, /class="masthead"[^>]*href="\/"/,
    "inner pages still need the masthead as their home link");
});

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

test("the inbox takes a link and judges what waits", () => {
  const html = read("dist/eidos/inbox/index.html");
  const css = bundledCss("dist/eidos/inbox/index.html");

  // every candidate rides along: pictures with a source and a licence, reads
  // with a url. Both are judged with the same two buttons.
  const data = JSON.parse(html.match(/id="in-data"[^>]*>([^<]*)</)[1]);
  assert.ok(data.length >= 20, `expected 20+ candidates, found ${data.length}`);
  for (const c of data) {
    assert.ok(c.id, `candidate without id: ${JSON.stringify(c)}`);
    if (c.src) {
      assert.ok(c.source, `${c.id} has no source url`);
      assert.ok(c.licence, `${c.id} has no licence`);
    } else {
      assert.match(c.url || "", /^https?:\/\//, `${c.id} is neither a picture nor a link`);
    }
  }
  assert.ok(data.some((c) => c.type === "poster"), "the posters reached the inbox");
  assert.ok(data.some((c) => c.type === "bookmark"), "the reads reached the inbox");

  // the composer: a url field and one verb. It answers focus, not hover —
  // a glow that follows the pointer is decoration; one that lights when the
  // caret lands says the field is live.
  assert.match(html, /<form class="in-throw" id="throw"/);
  assert.match(html, /<input type="url" name="url" id="url"/);
  assert.match(css, /\.in-throw(?:\[[^\]]*\])?:focus-within/);
  assert.doesNotMatch(css, /\.in-throw(?:\[[^\]]*\])?:hover\s*\{[^}]*box-shadow/);

  // two buttons, and the door posts back here
  assert.match(html, /id="keep"/);
  assert.match(html, /id="pass"/);
  assert.match(html, /name="next" value="\/eidos\/inbox"/);
  assert.ok(!html.includes('id="after"'), "one question, not two");

  // the card flies to 120vw, so the stage clips sideways; a finger can still
  // scroll the page past the deck
  assert.match(css, /overflow-x:\s*clip/);
  assert.match(css, /touch-action:\s*pan-y/);

  // no radius invented here either
  // Astro moved this page's styles out to their own bundle — <link
  // href="/_astro/inbox.*.css"> — so a scan of inline <style> found nothing
  // and passed on an empty list. The page's own sheet is the one to read,
  // and the test insists it exists so it can never pass on air again.
  const ownSheet = html.match(/href="(\/_astro\/inbox\.[^"]+\.css)"/)?.[1];
  assert.ok(ownSheet, "the inbox has no stylesheet of its own to check");
  const own = read(path.join("dist", ownSheet));
  assert.match(own, /in-throw/, "the sheet found is not the inbox's");
  const literals = [...own.matchAll(/border-radius:\s*([^;}]+)/g)].map((m) => m[1].trim())
    .filter((v) => !/var\(|999px|50%|inherit|^0$/.test(v));
  assert.deepEqual(literals, [], `the inbox invents radii: ${literals.join(", ")}`);
});

test("the orbit reads one stable mapper without duplicating its payload onto home", async () => {
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

  // The dedicated page owns the geometry. Home no longer ships a second,
  // smaller copy that asks the same content to explain itself twice.
  //
  // The orbit chooses its input — it shows taste, so the craft links stay on
  // /learning — but it must still get its geometry from this one mapper and
  // never grow a second copy of the maths. So the comparison feeds the
  // mapper what the page feeds it, and any drift in the mapper still fails.
  const orbit = JSON.parse(read("dist/eidos/orbit/index.html").match(/id="eo-data"[^>]*>([^<]*)</)[1]);
  const taste = toMarks({ ...map, items: map.items.filter((it) => it.type !== "link") });
  assert.deepEqual(orbit.marks, taste.marks);
  assert.ok(!orbit.marks.some((m) => m.t === "link"), "craft links belong on /learning");
  assert.doesNotMatch(read("dist/index.html"), /id="me-orbit-data"/);

  // the thumbnails they point at have to exist
  for (const m of marks.filter((x) => x.thumb).slice(0, 8)) {
    assert.ok(exists(path.join("public", m.thumb)), `missing derivative ${m.thumb}`);
  }
});

test("the library shelves every mark, in two rooms and a shelf", () => {
  const html = read("dist/eidos/index.html");
  const map = JSON.parse(read("src/data/map.json"));

  // Pictures hang, words are read, what he has read is its own shelf, and
  // nothing is silently dropped: every shelved mark is exactly one of them.
  // Links are the deliberate exception — craft articles, kept on /learning.
  const cards = [...html.matchAll(/class="lib-card lib-card--(\w+)"/g)].length;
  const said = [...html.matchAll(/class="lib-said lib-said--(\w+)"/g)].length;
  const kept = [...html.matchAll(/class="lib-bm"/g)].length;
  const shelved = map.items.filter((it) => it.type !== "link").length;
  assert.equal(cards + said + kept, shelved,
    `library shows ${cards} hung + ${said} read + ${kept} kept of ${shelved} shelved marks`);
  assert.ok(cards > 0 && said > 0, "a library needs both a hall and a reading room");

  // The page must not overstate itself: every number is counted from what
  // it shows. The portrait's paragraph and its counts both say the total.
  const dd = (name) => Number(html.match(new RegExp(`<dt[^>]*>${name}<\\/dt>\\s*<dd[^>]*>(\\d+)<\\/dd>`))?.[1]);
  const claimed = dd("things");
  assert.equal(claimed, shelved, "the portrait counts what is not there");
  const lede = Number(html.match(/(\d+) real things i love/)[1]);
  assert.equal(lede, shelved, "the paragraph counts what is not there");
  const unfiledDd = dd("unfiled");
  const unfiledSays = html.match(/(\d+) things that have never been told/);
  if (unfiledSays) assert.equal(unfiledDd, Number(unfiledSays[1]), "the ring disagrees with itself");
  assert.ok(!/lib-card--link|lib-said--link/.test(html), "craft links belong on /learning");

  // the rooms, in order, and the weathers inside them cold to warm
  const at = (id) => html.indexOf(`id="${id}"`);
  assert.ok(at("pictures") > 0 && at("words") > at("pictures") && at("read") > at("words"),
    "pictures, then words, then read");
  const weathersInOrder = map.weathers.slice().sort((a, b) => a.x - b.x).map((w) => w.name.replace(/\W+/g, "-"));
  const runs = [...html.matchAll(/class="lib-run" id="w-([\w-]+)"/g)].map((m) => m[1]);
  assert.ok(runs.length >= 6, `expected most weathers to hang pictures, found ${runs.length}`);
  assert.deepEqual(runs, weathersInOrder.filter((w) => runs.includes(w)), "the hall runs cold to warm");

  // a poem shows its own language above the english and names its translator
  assert.match(html, /class="lib-orig"/, "no poem shows its original");
  assert.match(html, /translated for this page, not a published version/, "a house translation is labelled as one");

  // each weather label carries its paint chips from the real palette
  const pal = JSON.parse(read("src/data/palettes.json"));
  for (const w of map.weathers) {
    const p = pal.palettes.find((x) => x.weather === w.name);
    if (p && runs.includes(w.name.replace(/\W+/g, "-"))) assert.ok(html.includes(`background:${p.stops[0]}`), `${w.name} lost its paint chips`);
  }

  // reading is public, teaching stays behind doors
  assert.ok(html.includes("/eidos/inbox"), "the door to the inbox is named");
  assert.ok(!html.includes("api/eidos/verdict"), "the library itself never writes");
  // and it shares as itself
  assert.match(html, /property="og:image" content="[^"]*og-eidos\.png/);
  assert.match(html, /property="og:title" content="eidos/);
});

test("the sitemap lists the public pages and only those", () => {
  const xml = read("dist/sitemap.xml");
  for (const url of ["/learning/", "/learning/terminal", "/press/"]) {
    assert.ok(xml.includes(url), `sitemap missing ${url}`);
  }
  for (const gated of ["/names", "/ask", "/scout", "/curate",
                       "/eidos/sit", "/eidos/map", "/eidos/orbit", "/eidos/deck",
                       "/today/", "/hokku/", "/pond/", "/eidos/", "/taste/",
                       "/writing/", "/basho", "/dance/", "/vault/", "/map/"]) {
    assert.ok(!xml.includes(gated), `sitemap leaks ${gated}`);
  }
});

test("every hidden room tells search engines to leave it unlisted", () => {
  for (const room of ["eidos", "hokku", "pond", "today"]) {
    const html = read(`dist/${room}/index.html`);
    assert.match(
      html,
      /<meta name="robots" content="noindex, follow">/,
      `/${room} is absent from the sitemap but still indexable`,
    );
  }
});

test("the footer's return link always lands on a real target", () => {
  for (const page of ["dist/index.html", "dist/learning/index.html", "dist/press/index.html"]) {
    const html = read(page);
    assert.match(html, /class="to-top" href="#main"/, `${page} returns to a missing fragment`);
    assert.match(html, /<main id="main"/);
  }
});

test("the foyer tells readers which public room they are in", () => {
  const learning = read("dist/learning/index.html");
  const press = read("dist/press/index.html");

  assert.match(learning, /class="crumb">\/ learning</);
  assert.match(learning, /href="\/learning" aria-current="page"/);
  assert.match(press, /class="crumb">\/ press</);
  assert.match(press, /href="\/press" aria-current="page"/);
});

// Astro moves page CSS/JS into hashed bundle files; resolve them from the page.
// Astro inlines a page's styles once they are small enough, so a helper that
// only follows <link href> silently returns nothing and every assertion built
// on it passes while guarding air. Read both.
function bundledCss(page) {
  const html = read(page);
  const linked = [...html.matchAll(/href="(\/_astro\/[^"]+\.css)"/g)]
    .map((m) => read(path.join("dist", m[1])));
  const inline = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]);
  const css = [...linked, ...inline].join("\n");
  assert.ok(css.length > 0, `no css found for ${page}`);
  return css;
}
function bundled(page, html) {
  return [...html.matchAll(/src="(\/_astro\/[^"]+\.js)"/g)]
    .map((m) => read(path.join("dist", m[1])))
    .join("\n");
}
