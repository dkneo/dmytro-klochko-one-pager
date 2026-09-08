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
      // a card with no picture is a link — or a word: a poem, quote or song
      // carrying its text or its title, which the deck learned to show
      const isWord = ["poem", "quote", "song"].includes(c.type) && !!(c.line || c.title);
      if (!isWord) assert.match(c.url || "", /^https?:\/\//, `${c.id} is neither a picture, a link nor a word`);
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

test("the atlas owns the geometry without duplicating its payload onto home", async () => {
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
  // The duplicate 3D orbit is retired. Keeping its old static payload would
  // still make every build ship Three.js for a route the worker redirects.
  assert.ok(!exists("dist/eidos/orbit/index.html"), "the retired orbit still ships a page and its 3D bundle");
  assert.doesNotMatch(read("dist/index.html"), /id="me-orbit-data"/);

  // the thumbnails they point at have to exist
  for (const m of marks.filter((x) => x.thumb).slice(0, 8)) {
    assert.ok(exists(path.join("public", m.thumb)), `missing derivative ${m.thumb}`);
  }
});

test("the product collection carries every shelved mark without becoming a filing manual", () => {
  const html = read("dist/eidos/index.html");
  const map = JSON.parse(read("src/data/map.json"));
  const shelved = map.items.filter((it) => it.type !== "link").length;
  const pieces = [...html.matchAll(/data-piece data-form="([^"]+)"/g)];
  assert.equal(pieces.length, shelved, `product shows ${pieces.length} of ${shelved} shelved marks`);
  assert.equal(new Set([...html.matchAll(/data-piece[^>]+data-id="([^"]+)"/g)].map((match) => match[1])).size, shelved, "a mark appears twice");
  assert.ok(pieces.some((match) => ["painting", "photograph", "building", "object"].includes(match[1])), "no visual work survived");
  assert.ok(pieces.some((match) => ["poem", "quote", "song", "writing"].includes(match[1])), "no words survived");

  const dd = (name) => Number(html.match(new RegExp(`<dt[^>]*>${name}<\\/dt>\\s*<dd[^>]*>(\\d+)<\\/dd>`))?.[1]);
  assert.equal(dd("things kept"), shelved, "the record counts what is not there");
  assert.match(html, /class="ep-piece-open ep-piece-words"/, "words have no reading surface");
  assert.match(html, /translated for this page, not a published version/, "a house translation is labelled as one");
  assert.ok(!html.includes("api/eidos/verdict"), "the library itself never writes");
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
    // The footer says what only it can know and stops: type, ship date, name,
    // the way up. It does not repeat the header's links.
    const foot = html.match(/<footer class="site-footer">([\s\S]*?)<\/footer>/)?.[1] ?? "";
    assert.match(foot, /class="colophon"/, `${page} footer has no colophon`);
    assert.match(foot, /shipped \d{1,2} (jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec) 20\d\d/, `${page} footer is undated`);
    assert.doesNotMatch(foot, /href="\/(learning|press)"/, `${page} footer repeats the header`);
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

// ── a wrong address gets a page, not a blank ─────────────────────────────
test("the 404 is a page in the site's voice with doors out", () => {
  const html = read("dist/404.html");
  assert.match(html, /<title>nothing here · dmytro klochko<\/title>/);
  assert.match(html, /<meta name="robots" content="noindex, follow"/, "the 404 is indexable");
  for (const door of ['href="/"', 'href="/press"', 'href="/learning"', 'href="/eidos"']) {
    assert.ok(html.includes(door), `the 404 has no door ${door}`);
  }
});

test("every route carries the four security headers; nothing forbids framing the embed", () => {
  const headers = read("public/_headers");
  const all = headers.match(/^\/\*\n([\s\S]*?)\n\n/m)?.[1] ?? "";
  for (const h of ["X-Content-Type-Options: nosniff", "Referrer-Policy: strict-origin-when-cross-origin", "Permissions-Policy:", "Strict-Transport-Security: max-age="]) {
    assert.ok(all.includes(h), `/* lacks ${h}`);
  }
  assert.doesNotMatch(headers, /X-Frame-Options|frame-ancestors/, "the embed could not be framed");
});
