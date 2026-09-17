import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = path.resolve(import.meta.dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const articleFor = (html, id) => {
  const start = html.indexOf(`data-id="${id}"`);
  assert.ok(start > 0, `${id} is missing from the names section`);
  const from = html.lastIndexOf("<article", start);
  const end = html.indexOf("</article>", start);
  return html.slice(from, end + "</article>".length);
};

test("link-only people expose a note and a door to the collection detail", () => {
  const source = read("src/components/eidos/EidosCollection.astro");
  const html = read("dist/eidos/index.html");
  const map = JSON.parse(read("src/data/map.json"));
  const nara = map.items.find((item) => item.id === "yoshitomo-nara");
  const card = articleFor(html, "yoshitomo-nara");

  assert.ok(nara, "yoshitomo-nara never reached the map");
  assert.equal(nara.type, "person");
  assert.ok(!nara.src, "nara unexpectedly has a hosted face");
  assert.match(nara.url, /^https:\/\/en\.wikipedia\.org\/wiki\/Yoshitomo_Nara/);
  assert.match(nara.note, /a child with a knife/);

  assert.match(card, /data-form="person"/);
  assert.match(card, /data-weather="unfiled"/);
  assert.match(card, /data-url="https:\/\/en\.wikipedia\.org\/wiki\/Yoshitomo_Nara"/);
  assert.match(card, /data-note="[^"]*a child with a knife[^"]*"/);
  assert.match(card, /<template data-record>/);
  assert.match(card, /class="ep-record-note"[^>]*>aomori, then düsseldorf/);
  assert.match(card, /href="https:\/\/en\.wikipedia\.org\/wiki\/Yoshitomo_Nara"[^>]*>open ↗/);
  assert.match(card, />unfiled</);
  assert.doesNotMatch(card, /<img\b/, "a link-only person shipped a face");

  assert.match(source, /template\[data-record\]/);
  assert.match(source, /record\.content\.cloneNode\(true\)/);
  assert.match(source, /item\.url \|\| item\.source/);
});

test("every link-only person on the names wall carries a door the detail can open", () => {
  const html = read("dist/eidos/index.html");
  const map = JSON.parse(read("src/data/map.json"));
  const names = map.items.filter((item) => item.type === "person" && !item.src);
  const cards = [...html.matchAll(/<article[^>]*data-form="person"[^>]*>/g)];

  assert.ok(names.length > 50, "the names wall is too thin to be the people room");
  assert.equal(cards.length, names.length, "a link-only person never reached the names wall");

  for (const item of names) {
    const card = articleFor(html, item.id);
    const door = item.url || item.source;
    assert.match(card, /data-note="/, `${item.id} dropped its note`);
    assert.match(card, /class="ep-record-note"/, `${item.id} has no note in the detail record`);
    if (door) {
      assert.match(card, new RegExp(`data-url="${door.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`));
      assert.match(card, /class="ep-record-door"/, `${item.id} has a url but no door in the detail record`);
    } else {
      assert.doesNotMatch(card, /class="ep-record-door"/, `${item.id} invented a door`);
    }
    assert.doesNotMatch(card, /<img\b/, `${item.id} shipped a face`);
  }
});
