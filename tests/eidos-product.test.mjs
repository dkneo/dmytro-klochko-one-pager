import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = path.resolve(import.meta.dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("the product view keeps every public mark exactly once", async () => {
  const { buildProfile } = await import("../src/lib/eidos-view.mjs");
  const map = JSON.parse(read("src/data/map.json"));
  const palettes = JSON.parse(read("src/data/palettes.json"));
  const profile = buildProfile(map, palettes);
  const expected = map.items.filter((item) => item.type !== "link").map((item) => item.id).sort();
  const actual = profile.collection.map((item) => item.id).sort();

  assert.deepEqual(actual, expected);
  assert.equal(new Set(actual).size, actual.length, "a mark appears twice");
  assert.ok(!profile.collection.some((item) => item.type === "link"), "craft links leaked into the product collection");
});

test("the product view derives its weather and maker record from the vault", async () => {
  const { buildProfile } = await import("../src/lib/eidos-view.mjs");
  const map = JSON.parse(read("src/data/map.json"));
  const palettes = JSON.parse(read("src/data/palettes.json"));
  const profile = buildProfile(map, palettes);
  const ordered = map.weathers.slice().sort((a, b) => a.x - b.x).map((weather) => weather.name);

  assert.deepEqual(profile.weathers.map((weather) => weather.name), ordered);
  for (const weather of profile.weathers) {
    assert.ok(Array.isArray(weather.stops) && weather.stops.length >= 3, `${weather.name} has no real palette`);
    assert.equal(weather.count, profile.collection.filter((item) => item.weather === weather.name && !item.unplaced).length);
  }
  for (const maker of profile.recurringMakers) {
    assert.ok(maker.count > 1, `${maker.name} does not recur`);
    assert.equal(maker.count, profile.collection.filter((item) => item.who === maker.name).length);
  }
  assert.ok(
    !profile.recurringMakers.some((maker) => /dmytro klochko/i.test(maker.name)),
    "the portrait should describe Dmytro's taste, not list Dmytro as one of his own recurring makers",
  );
});

test("the editorial order avoids a monotonous run when alternatives exist", async () => {
  const { editorialOrder } = await import("../src/lib/eidos-view.mjs");
  const input = [
    { id: "a", type: "painting", who: "one" },
    { id: "b", type: "painting", who: "one" },
    { id: "c", type: "quote", who: "two" },
    { id: "d", type: "song", who: "three" },
  ];
  const ordered = editorialOrder(input);

  assert.deepEqual(ordered.map((item) => item.id).sort(), ["a", "b", "c", "d"]);
  assert.notEqual(ordered[0].type, ordered[1].type);
  assert.notEqual(ordered[0].who, ordered[1].who);
});

test("every product observation carries visible evidence", async () => {
  const { buildProfile } = await import("../src/lib/eidos-view.mjs");
  const map = JSON.parse(read("src/data/map.json"));
  const palettes = JSON.parse(read("src/data/palettes.json"));
  const profile = buildProfile(map, palettes);
  const ids = new Set(profile.collection.map((item) => item.id));

  assert.ok(profile.observations.length >= 2);
  for (const observation of profile.observations) {
    assert.ok(observation.text.length > 20);
    assert.ok(observation.evidence.length >= 2);
    for (const id of observation.evidence) assert.ok(ids.has(id), `${observation.key} cites missing ${id}`);
  }
});

test("the product opens as one visual moodboard with plain doors", () => {
  const html = read("dist/eidos/index.html");
  const map = JSON.parse(read("src/data/map.json"));
  const artworkTypes = new Set(["painting", "print", "poster"]);
  const visualCount = map.items.filter((item) => artworkTypes.has(item.type) && item.src && !item.id.startsWith("his-")).length;

  assert.match(html, /class="eidos-product"/);
  assert.match(html, /class="ep-header"/);
  assert.match(html, />moodboard</);
  assert.match(html, /href="\/eidos\/inbox"[^>]*>discover</);
  assert.match(html, /href="\/eidos\/places"[^>]*>map</);
  assert.doesNotMatch(html, /href="\/eidos\/deck"/, "the legacy experiment is still a competing product door");
  assert.match(html, /a beautiful, endless moodboard of things i love\./);
  assert.match(html, /paintings, prints and posters/);
  assert.doesNotMatch(html, /paintings, photographs, people and objects/);
  assert.match(html, /data-visual-moodboard/);
  assert.equal((html.match(/<figure class="ep-visual/g) || []).length, visualCount);
  assert.doesNotMatch(html, /data-kind="(?:person|object|building|photograph)"/);
  assert.doesNotMatch(html, /data-id="his-/);
  assert.doesNotMatch(html, /ep-reading-grid|ep-weather-list|ep-trace-grid/);
  assert.doesNotMatch(html, /\b(?:poem|quote|song|writing)s?\b[^<]*card/i);
  assert.doesNotMatch(html, /keep exploring|data-more|data-form-filter|data-weather-filter/);
  assert.doesNotMatch(html, /\b(?:01|02|03) ·/);
});

test("the Faun is the product mark and visibly guides discovery", () => {
  const header = read("src/components/eidos/EidosHeader.astro");
  const studio = read("src/pages/eidos/inbox.astro");
  const css = read("src/styles/pages/eidos-product.css") + read("src/styles/pages/eidos-studio.css");

  assert.match(header, /class="ep-faun-mark"[^>]*src="\/images\/eidos\/product\/faun-mark\.webp"/);
  assert.doesNotMatch(header, /<i aria-hidden="true"><\/i>/, "the half-moon still occupies the wordmark");
  assert.match(studio, /class="in-faun-guide"/);
  assert.match(studio, /src="\/images\/eidos\/product\/faun-mark\.webp"/);
  assert.match(css, /\.ep-faun-mark\s*\{/);
  assert.match(css, /\.in-faun-guide\s*\{/);
  assert.ok(fs.existsSync(path.join(root, "public/images/eidos/product/faun-mark.webp")), "the Faun crop is missing");
});

test("the moodboard is one readable chromatic salon", () => {
  const page = read("src/pages/eidos/index.astro");
  const moodboard = read("src/components/eidos/EidosMoodboard.astro");
  const html = read("dist/eidos/index.html");
  const figures = [...html.matchAll(/<figure class="ep-visual[\s\S]*?<\/figure>/g)].map((match) => match[0]);
  const keys = [...html.matchAll(/<figure[^>]*data-color-key="([0-9.]+)"/g)].map((match) => Number(match[1]));
  assert.match(page, /dominantColors/);
  assert.match(page, /<EidosMoodboard[^>]*colors=\{dominantColors\}/);
  assert.match(moodboard, /data-color-key=\{colors\[item\.id\]/);
  assert.ok(keys.length > 20, "the chromatic salon has too little art");
  assert.deepEqual(keys, keys.slice().sort((a, b) => a - b), "the default wall is not ordered by color");
  assert.equal(figures.length, keys.length, "the color wall lost an artwork");
  assert.ok(figures.every((figure) => figure.includes("<figcaption>")), "color order hid an artwork label");
  assert.doesNotMatch(moodboard, /data-mood-view|physical scale|sort by color|absolute favorites/);
  assert.doesNotMatch(moodboard, /aspect-ratio:\s*1|figcaption\s*\{\s*display:\s*none/);
});

test("generated website scenes never masquerade as Dmytro's paintings", () => {
  const paintingDir = path.join(root, "vault/paintings");
  const paintings = fs.readdirSync(paintingDir)
    .filter((file) => file.endsWith(".md"))
    .map((file) => read(path.join("vault/paintings", file)))
    .join("\n");
  assert.doesNotMatch(paintings, /made with Seedream|^title:\s*(?:dock|ember|estuary|fields|fire|fuji|lavender|nightcourt|snow|study|swim)$/m);
});

test("measured works keep their real scale and collection record", () => {
  const map = JSON.parse(read("src/data/map.json"));
  const measured = map.items.filter((item) => item.heightCm && item.widthCm);
  assert.ok(measured.length >= 6, "the scale room has too few verified works");
  for (const item of measured) {
    assert.ok(item.collection, `${item.id} has dimensions but no collection`);
    assert.ok(item.collectionUrl?.startsWith("https://"), `${item.id} has no museum source`);
    assert.ok(item.collectionCity, `${item.id} cannot join a city pilgrimage`);
  }
});

test("the moodboard keeps quiet museum labels without a scale mode", () => {
  const moodboard = read("src/components/eidos/EidosMoodboard.astro");
  const html = read("dist/eidos/index.html");
  assert.match(moodboard, /ep-visual-location/);
  assert.doesNotMatch(moodboard, /data-mood-view="scale"|data-scale-ruler|1 px = 1 cm/);
  assert.match(html, /href="\/eidos\/places"/);
});

test("the pilgrimage room groups collectable visits by city", () => {
  const html = read("dist/eidos/places/index.html");
  const map = JSON.parse(read("src/data/map.json"));
  const artworks = map.items.filter((item) => ["painting", "print", "poster"].includes(item.type) && item.src && !item.id.startsWith("his-"));
  const located = artworks.filter((item) => item.collectionCity && item.collection && item.collectionUrl);
  assert.match(html, /works i can meet in person\./);
  assert.match(html, /data-place-city/);
  assert.match(html, /data-place-work/);
  assert.doesNotMatch(html, /data-kind="(?:person|object|building|photograph)"/);
  assert.ok(located.length >= Math.ceil(artworks.length * 0.75), "most artworks still have no museum record");
  assert.match(html, /names the institution holding a work\. it is not a promise that the work is on view today/);
});

test("words remain intact on their own quiet page", () => {
  const html = read("dist/eidos/words/index.html");
  const map = JSON.parse(read("src/data/map.json"));
  const wordCount = map.items.filter((item) => item.type !== "link" && !item.src).length;

  assert.match(html, /the words are resting here\./);
  assert.equal((html.match(/data-word-piece/g) || []).length, wordCount);
  assert.doesNotMatch(html, /data-visual-piece/);
  assert.match(read("dist/eidos/index.html"), /href="\/eidos\/words"[^>]*>words, elsewhere</);
});

test("an opened artwork does not leave an inert nested opener in the detail view", () => {
  const source = read("src/components/eidos/EidosMoodboard.astro");
  assert.match(source, /clone\.querySelector\("\.ep-visual-open"\)\.disabled = true/);
});

test("the hero is static first and motion is an enhancement", () => {
  const html = read("dist/eidos/index.html");

  assert.match(html, /hero-desktop-poster\.webp/);
  assert.match(html, /hero-mobile-poster\.webp/);
  assert.match(html, /hero-ambient-desktop\.webm/);
  assert.match(html, /hero-ambient-desktop\.mp4/);
  assert.match(html, /hero-ambient-mobile\.webm/);
  assert.match(html, /hero-ambient-mobile\.mp4/);
  assert.match(html, /data-eidos-ambient/);
});

test("the private inbox is the working studio of the same product", () => {
  const html = read("dist/eidos/inbox/index.html");

  assert.match(html, /class="eidos-studio"/);
  assert.match(html, /class="ep-header/);
  assert.match(html, /class="in-workbench"/);
  assert.match(html, /class="in-rail"/);
  assert.match(html, /class="in-center"/);
  assert.doesNotMatch(html, /class="in-note-panel"/);
  assert.doesNotMatch(html, /class="in-ground"/, "the old blurred artwork wallpaper survived");
});

test("discover queues only distinct paintings, prints, and posters", async () => {
  const { groupCandidateEditions } = await import("../src/lib/eidos-candidates.mjs");
  const source = read("src/pages/eidos/inbox.astro");
  const html = read("dist/eidos/inbox/index.html");
  const inbox = JSON.parse(read("public/inbox.json"));
  const payload = JSON.parse(html.match(/<script type="application\/json" id="in-data">([\s\S]*?)<\/script>/)?.[1] || "[]");
  const allowed = new Set(["painting", "print", "poster"]);
  const expected = groupCandidateEditions(inbox.candidates.filter((candidate) => candidate.src && allowed.has(candidate.type || "painting"))).length;

  assert.equal(payload.length, expected);
  assert.ok(payload.length > 0, "the focused discovery queue is empty");
  assert.ok(payload.every((candidate) => allowed.has(candidate.type)), "a non-artwork entered Discover");
  assert.ok(payload.every((candidate) => candidate.verdictIds?.includes(candidate.id)), "an edition lost its verdict aliases");
  assert.doesNotMatch(source, /fetch\("\/api\/eidos\/bookmarks"\)/, "private bookmarks still join the visual queue");
  assert.doesNotMatch(html, /id="throw"|id="say"|class="in-read"/, "non-visual intake or annotation is still visible");
  assert.match(html, /paintings and posters only/);
  assert.match(html, /id="session-trail"/);
  assert.match(source, /slice\(-5\)/);
});

test("discover treats editions of one artwork as one decision", async () => {
  const { prepareCandidateQueue } = await import("../src/lib/eidos-candidates.mjs");
  const candidates = [
    { id: "commons-wave", who: "Katsushika Hokusai", title: "Under the Wave off Kanagawa", source: "https://commons.wikimedia.org/wiki/File:Tsunami_by_hokusai_19th_century.jpg" },
    { id: "met-wave", who: "Katsushika Hokusai", title: "Under the Wave off Kanagawa (Kanagawa oki nami ura), also known as The Great Wave", source: "https://www.metmuseum.org/art/collection/search/56353" },
    { id: "restored-wave", who: "", title: "The Great Wave off Kanagawa", source: "https://commons.wikimedia.org/wiki/File:Great_Wave_unrestored.jpg" },
    { id: "moon", who: "Paul Klee", title: "Moonrise", source: "https://example.com/moon" },
  ];

  assert.deepEqual(
    prepareCandidateQueue(candidates, new Set()).map((candidate) => candidate.id),
    ["commons-wave", "moon"],
    "alternate files and titles of the Wave survived as separate cards",
  );
  assert.deepEqual(
    prepareCandidateQueue(candidates, new Set(["met-wave"])).map((candidate) => candidate.id),
    ["moon"],
    "a judged edition did not retire the whole work",
  );
  assert.deepEqual(
    prepareCandidateQueue([
      { id: "poster-a", who: "Perlin, B", title: "Americans will always fight for liberty." },
      { id: "poster-b", who: "Bernard Perlin", title: "1778 - 1943 - Americans Will Always Fight for Liberty" },
      { id: "poster-c", who: "Office for Emergency Management", title: '"Americans will always fight for liberty" - DPLA - 68755b0b6884516bdae83b49bab12' },
    ], new Set()).map((candidate) => candidate.id),
    ["poster-a"],
    "catalogue dates and attribution variants split one distinctive work",
  );
});

test("discover introduces every available artist before repeating one", async () => {
  const { prepareCandidateQueue } = await import("../src/lib/eidos-candidates.mjs");
  const queue = prepareCandidateQueue([
    { id: "h1", who: "Hokusai", title: "one" },
    { id: "h2", who: "Hokusai", title: "two" },
    { id: "h3", who: "Hokusai", title: "three" },
    { id: "k1", who: "Kandinsky", title: "four" },
    { id: "m1", who: "Malevich", title: "five" },
    { id: "k2", who: "Kandinsky", title: "six" },
  ], new Set());

  assert.deepEqual(queue.slice(0, 3).map((candidate) => candidate.who), ["Hokusai", "Kandinsky", "Malevich"]);
  assert.deepEqual(queue.map((candidate) => candidate.id), ["h1", "k1", "m1", "h2", "k2", "h3"]);
});

test("the harvester stops feeding artists already overrepresented in the archive", async () => {
  const { canOfferArtist } = await import("../src/lib/eidos-candidates.mjs");
  const counts = new Map([["katsushika hokusai", 11], ["paul klee", 1]]);

  assert.equal(canOfferArtist({ who: "Katsushika Hokusai" }, counts), false);
  assert.equal(canOfferArtist({ who: "Paul Klee" }, counts), true);
  assert.equal(canOfferArtist({ who: "Wassily Kandinsky" }, counts), true);
  assert.equal(canOfferArtist({ who: "" }, counts), false, "anonymous results do not improve artist discovery");
});

test("the harvester deliberately looks beyond the nineteenth-century canon", () => {
  const harvester = read("scripts/candidates.mjs");
  for (const artist of ["Kandinsky", "Malevich", "Klee", "Mondrian", "Macke", "Delaunay", "Hartley", "Marc"]) {
    assert.match(harvester, new RegExp(artist), `${artist} is absent from the discovery searches`);
  }
});

test("the current harvester spends its searches on artworks the studio can show", () => {
  const harvester = read("scripts/candidates.mjs");
  assert.match(harvester, /const OFFERED_TYPES = new Set\(\["painting", "print", "poster"\]\)/);
  assert.match(harvester, /if \(!OFFERED_TYPES\.has\(kind\)\) continue/);
});

test("a Commons uploader is never presented as the painter", async () => {
  const { isCommonsUserCredit } = await import("../src/lib/eidos-candidates.mjs");
  assert.equal(isCommonsUserCredit('<a href="//commons.wikimedia.org/wiki/User:Pugilist">Pugilist</a>'), true);
  assert.equal(isCommonsUserCredit('<a href="https://en.wikipedia.org/wiki/Marsden_Hartley">Marsden Hartley</a>'), false);
});

test("the visual Studio has shelves, an absolute favorite, and a comparison ritual", () => {
  const source = read("src/pages/eidos/inbox.astro");
  assert.match(source, /data-queue-filter=\{shelf\.id\}/);
  for (const shelf of ["paintings", "prints"]) {
    assert.match(source, new RegExp(`id: "${shelf}"`), `missing ${shelf} shelf`);
  }
  for (const shelf of ["objects", "photography", "people"]) {
    assert.doesNotMatch(source, new RegExp(`id: "${shelf}"`), `obsolete ${shelf} shelf remains`);
  }
  assert.match(source, /id="favorite"[^>]*aria-keyshortcuts="f"/);
  assert.match(source, /absolute favorite<\/button>/);
  assert.match(source, /id="comparison"/);
  assert.match(source, /positiveThis\.length\s*>=\s*12/);
  assert.match(source, /fetch\("\/api\/eidos\/pair"/);
  assert.match(source, /weather:\s*"overall"/);
  assert.match(source, /send\(cand, "favorite", cand\.weather\)/);
});

test("the studio keeps reaction clips but loads a plate without a mascot overlay", () => {
  const html = read("dist/eidos/inbox/index.html");
  const css = read("src/styles/pages/eidos-studio.css");

  assert.match(html, /save-to-profile\.webm/);
  assert.match(html, /pass-card\.webm/);
  assert.match(html, /data-studio-feedback/);
  assert.doesNotMatch(html, /open-next-card|loader-circle/);
  assert.match(html, /data-plate-loader/);
  assert.match(css, /@keyframes plate-register/);
  assert.match(css, /prefers-reduced-motion: reduce[\s\S]*?\.in-plate-loader/);
});

test("the atlas is the product's one map and keeps private tools secondary", () => {
  const html = read("dist/eidos/map/index.html");
  assert.match(html, /data-eidos-product/);
  assert.match(html, /class="eidos-atlas"/);
  assert.doesNotMatch(html, /class="ep-nav"[\s\S]*?>atlas</, "the technical atlas returned to the primary product navigation");
  assert.match(html, /class="ea-map-frame"/);
  assert.match(html, /<details class="ea-private-tools"/);
  assert.match(html, /<summary>open the private instruments/);
  assert.doesNotMatch(html, /data-scene="nightcourt"/);
});

test("the public experiment belongs to the product and explains itself", () => {
  const html = read("dist/eidos/deck/index.html");
  assert.match(html, /data-eidos-product/);
  assert.match(html, /class="eidos-experiment"/);
  assert.match(html, /what does your eye keep\?/);
  assert.match(html, /76-card experiment/);
  assert.doesNotMatch(html, /the greek for the form of a thing/);
  assert.match(html, /data-deck-feedback/);
  assert.match(html, /swipe-keep-overlay\.(?:webm|mp4)/);
  assert.match(html, /swipe-pass-overlay\.(?:webm|mp4)/);
  assert.match(html, /classList\.add\("is-deck-active"\)/, "starting the deck does not make room for the card");
  assert.doesNotMatch(html, /—/, "the product voice slipped into em dashes");
});

test("the mobile product keeps its doors visible without loading two hero films", () => {
  const header = read("src/components/eidos/EidosHeader.astro");
  const hero = read("src/components/eidos/EidosHero.astro");
  const css = read("src/styles/pages/eidos-product.css");
  const tablet = css.split("@media (max-width: 980px)")[1].split("@media (max-width: 680px)")[0];

  assert.match(header, /ep-parent-mobile[^>]*>site</);
  assert.match(tablet, /\.ep-nav \{[\s\S]*?display: flex;/);
  assert.equal((hero.match(/class="ep-hero-video"/g) || []).length, 1);
  assert.match(hero, /media="\(max-width: 680px\)"[^>]*hero-ambient-mobile\.webm/);
});

test("the mobile workbench preserves generous controls", () => {
  const studio = read("src/styles/pages/eidos-studio.css");
  const atlas = read("src/styles/pages/eidos-atlas.css");
  const product = read("src/styles/pages/eidos-product.css");

  assert.match(studio, /@media \(max-width: 680px\)[\s\S]*?\.in-btn \{\s*min-height: 44px;/);
  assert.match(atlas, /@media \(max-width: 700px\)[\s\S]*?\.em-chip \{\s*min-height: 44px;/);
  assert.match(product, /\.ep-makers li \{[^}]*display: inline-flex;[^}]*gap:/);
});

test("the desktop studio gives the artwork most of the available viewport", () => {
  const studio = read("src/styles/pages/eidos-studio.css");
  const artRule = studio.match(/\.eidos-studio \.in-art \{([^}]*)\}/)?.[1] || "";
  const imageRule = studio.match(/body \.eidos-studio \.in-center \.in-art img \{([^}]*)\}/)?.[1] || "";
  assert.match(studio, /\.in-art \{[\s\S]*?min-height:\s*min\(68svh, 48rem\)/);
  assert.match(artRule, /min-height:\s*min\(68svh, 48rem\)/);
  assert.match(imageRule, /(?:^|;)\s*width:\s*auto/);
  assert.match(imageRule, /(?:^|;)\s*height:\s*min\(68svh, 48rem\)/);
  assert.match(studio, /\.in-stage\[data-orientation="portrait"\][^{]*\{[^}]*max-width:\s*54rem/);
});

test("the portrait tablet keeps the product map instead of collapsing to an exit", () => {
  const css = read("src/styles/pages/eidos-product.css");
  const tablet = css.split("@media (max-width: 980px)")[1].split("@media (max-width: 680px)")[0];
  assert.match(tablet, /grid-template-rows: 3\.75rem 2\.75rem;/);
  assert.match(tablet, /\.ep-nav \{[\s\S]*?display: flex;/);
  assert.doesNotMatch(tablet, /\.ep-nav \{\s*display: none;/);
});

test("frequent product gestures stay quick, interruptible and respectful", () => {
  const product = read("src/styles/pages/eidos-product.css");
  const studio = read("src/styles/pages/eidos-studio.css");
  const deck = read("src/pages/eidos/deck.astro");

  assert.match(product, /@media \(hover: hover\) and \(pointer: fine\)/, "pointer-only flourishes are not gated");
  assert.match(product, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(studio, /is-flying \{ transition: transform 2[0-9]{2}ms cubic-bezier/);
  assert.doesNotMatch(studio, /is-(?:flying|home)[^{]*\{[^}]*transition:[^;}]*(?:3[1-9][0-9]|[4-9][0-9]{2})ms/);
  assert.doesNotMatch(deck, /transform (?:3[1-9][0-9]|[4-9][0-9]{2})ms/);
});
