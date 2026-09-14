import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = path.resolve(import.meta.dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("constellations are repeated facts with inspectable evidence", async () => {
  const { buildConstellations } = await import("../src/lib/eidos-constellations.mjs");
  const works = [
    { id: "night-a", who: "A", title: "Night on the River", year: "1901", type: "painting", src: "/a" },
    { id: "night-b", who: "B", title: "Nocturne", year: "1911", type: "painting", src: "/b" },
    { id: "night-c", who: "C", title: "Moonlight", year: "1921", type: "print", src: "/c" },
    { id: "night-d", who: "D", title: "Twilight", year: "1931", type: "poster", src: "/d" },
    { id: "solo", who: "Only Once", title: "Still Life", year: "1941", type: "painting", src: "/e" },
  ];
  const result = buildConstellations(works);
  const night = result.motifs.find((group) => group.key === "night");

  assert.ok(night, "the repeated night titles were not noticed");
  assert.equal(night.count, 4);
  assert.deepEqual(night.evidence.map((work) => work.id), ["night-a", "night-b", "night-c", "night-d"]);
  assert.ok(!result.artists.some((group) => group.title === "Only Once"), "one work became a pattern");
  assert.ok([...result.motifs, ...result.artists, ...result.media].every((group) => group.evidence.length >= 3));
});

test("the portrait shows exact works behind every observation", () => {
  const html = read("dist/eidos/portrait/index.html");
  const source = read("src/pages/eidos/portrait.astro");

  assert.match(html, /what keeps returning\./);
  assert.match(html, /what is still forming\./);
  assert.match(html, /what to look at next\./);
  assert.match(html, /data-constellation/);
  assert.match(html, /data-constellation-controls/);
  assert.match(source, /\/api\/eidos\/constellations/);
  assert.match(source, /\/api\/eidos\/constellation/);
  assert.match(html, /href="\/eidos\/work\//);
  assert.match(source, /buildConstellations/);
  assert.doesNotMatch(html, /\d+%|points of|your (?:soul|personality) is/i);
});

test("portrait is a primary product door", () => {
  const header = read("src/components/eidos/EidosHeader.astro");
  assert.match(header, /href="\/eidos\/portrait"/);
  assert.match(header, /current === "portrait"/);
});
