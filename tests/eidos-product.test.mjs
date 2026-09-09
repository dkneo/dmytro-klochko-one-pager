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

test("the built profile opens as Eidos the product, not an archive manual", () => {
  const html = read("dist/eidos/index.html");

  assert.match(html, /class="eidos-product"/);
  assert.match(html, /class="ep-header"/);
  assert.match(html, />portrait</);
  assert.match(html, />collection</);
  assert.match(html, />atlas</);
  assert.match(html, /what i love, and what it says about me\./);
  assert.match(html, /enter my collection/);
  assert.doesNotMatch(html.slice(0, html.indexOf("</section>")), /the greek for the form/);
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
  assert.match(html, /class="in-note-panel"/);
  assert.doesNotMatch(html, /class="in-ground"/, "the old blurred artwork wallpaper survived");
});

test("the studio keeps drafts and a visible five-verdict session trail", () => {
  const source = read("src/pages/eidos/inbox.astro");
  const html = read("dist/eidos/inbox/index.html");

  assert.match(source, /localStorage/);
  assert.match(source, /eidos:draft:/);
  assert.match(html, /id="draft-status"/);
  assert.match(html, /id="session-trail"/);
  assert.match(source, /slice\(-5\)/);
});

test("save and pass feedback use the approved non-blocking character clips", () => {
  const html = read("dist/eidos/inbox/index.html");

  assert.match(html, /save-to-profile\.webm/);
  assert.match(html, /pass-card\.webm/);
  assert.match(html, /open-next-card\.webm/);
  assert.match(html, /data-studio-feedback/);
  assert.match(html, /id="in-link-loader"/);
  assert.match(html, /loader-circle\.webm/);
});

test("the atlas is the product's one map and keeps private tools secondary", () => {
  const html = read("dist/eidos/map/index.html");
  assert.match(html, /data-eidos-product/);
  assert.match(html, /class="eidos-atlas"/);
  assert.match(html, /aria-current="page"[^>]*>atlas</);
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

test("the mobile workbench removes desktop-only hints and preserves generous controls", () => {
  const studio = read("src/styles/pages/eidos-studio.css");
  const atlas = read("src/styles/pages/eidos-atlas.css");
  const product = read("src/styles/pages/eidos-product.css");

  assert.match(studio, /@media \(max-width: 680px\)[\s\S]*?\.in-say-hint \{\s*display: none;/);
  assert.match(atlas, /@media \(max-width: 700px\)[\s\S]*?\.em-chip \{\s*min-height: 44px;/);
  assert.match(product, /\.ep-makers li \{[^}]*display: inline-flex;[^}]*gap:/);
});

test("the portrait tablet keeps the product map instead of collapsing to an exit", () => {
  const css = read("src/styles/pages/eidos-product.css");
  const tablet = css.split("@media (max-width: 980px)")[1].split("@media (max-width: 680px)")[0];
  assert.match(tablet, /grid-template-rows: 3\.75rem 2\.75rem;/);
  assert.match(tablet, /\.ep-nav \{[\s\S]*?display: flex;/);
  assert.doesNotMatch(tablet, /\.ep-nav \{\s*display: none;/);
});
