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

  // Two buttons and nothing else. A weather-confirmation step used to sit
  // between the keep and the next card; it turned a half-second judgement
  // into a form and it is not coming back.
  assert.match(html, /id="keep"/);
  assert.match(html, /id="pass"/);
  assert.ok(!html.includes('id="after"'), "the sitting asks one question, not two");
  assert.ok(!/data-w="/.test(html), "no weather picker in the sitting");

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
  assert.ok(
    !new RegExp(`${scoped(".sit-after")}\\{[^}]*position:\\s*absolute`).test(css),
    "the question must sit under its card in the flow, not float below a void",
  );
  assert.ok(
    !new RegExp(`${scoped(".sit-stage")}\\{[^}]*min-height`).test(css),
    "the stage must not reserve height it may not fill",
  );
  // the guard must be able to fail: prove it sees the rules at all
  assert.match(css, new RegExp(`${scoped(".sit-stage")}\\{`));
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

test("the library shelves every mark, signed and filtered", () => {
  const html = read("dist/eidos/index.html");
  const map = JSON.parse(read("src/data/map.json"));

  // Art hangs, words are read, and nothing is silently dropped: every mark
  // is either a card on a wall or a line in a column. Links are the one
  // deliberate exception — they are craft articles, and /learning keeps them.
  const cards = [...html.matchAll(/class="lib-card lib-card--(\w+)"/g)].length;
  const said = [...html.matchAll(/class="lib-said lib-said--(\w+)"/g)].length;
  const shelved = map.items.filter((it) => it.type !== "link").length;
  assert.equal(cards + said, shelved,
    `library shows ${cards} hung + ${said} read of ${shelved} shelved marks`);
  assert.ok(cards > 0 && said > 0, "a room needs both a wall and a column");

  // The page must not overstate itself. It quoted the whole vault's count
  // while shelving eleven fewer marks, so the library claimed sixty-five
  // things and showed fifty-four. Every number is counted from the page.
  const claimed = Number(html.match(/<dt>things<\/dt><dd>(\d+)<\/dd>/)[1]);
  assert.equal(claimed, cards + said, "the header counts what is not there");
  const lede = Number(html.match(/love — (\d+) real things/)[1]);
  assert.equal(lede, cards + said, "the lede counts what is not there");
  const onRing = Number(html.match(/<dt>on the ring<\/dt><dd>(\d+)<\/dd>/)[1]);
  const ringSays = Number(html.match(/(\d+) things that have never been told/)[1]);
  assert.equal(onRing, ringSays, "the ring disagrees with itself");
  assert.ok(!/lib-card--link|lib-said--link/.test(html), "craft links belong on /learning");
  assert.match(html, /craft links are kept on/, "and the library says where they went");

  // eight rooms cold to warm, and the ring for the unfiled
  const rooms = [...html.matchAll(/class="lib-room[^"]*" id="([^"]+)"/g)].map((m) => m[1]);
  assert.equal(rooms.length, map.weathers.length + 1);
  assert.equal(rooms.at(-1), "the-ring", "the ring closes the library");

  // each room header carries its paint chips from the real palette
  const pal = JSON.parse(read("src/data/palettes.json"));
  for (const w of map.weathers) {
    const p = pal.palettes.find((x) => x.weather === w.name);
    if (p) assert.ok(html.includes(`background:${p.stops[0]}`), `${w.name} lost its paint chips`);
  }

  // reading is public, teaching stays behind doors
  assert.ok(html.includes("/eidos/sit"), "the door to the sitting is named");
  assert.ok(!html.includes("api/eidos/verdict"), "the library itself never writes");
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
