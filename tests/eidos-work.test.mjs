import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = path.resolve(import.meta.dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("artwork records carry the factual source fields out of the vault", () => {
  const map = JSON.parse(read("src/data/map.json"));
  const storm = map.items.find((item) => item.id === "a-sea-storm");

  assert.equal(storm.medium, "Mezzotint with some etching");
  assert.equal(storm.source, "https://www.metmuseum.org/art/collection/search/811690");
  assert.equal(storm.licence, "cc0");
  assert.equal(storm.collection, "The Metropolitan Museum of Art");
  assert.equal(storm.collectionCity, "New York");
});

test("related works explain only relationships the collection can prove", async () => {
  const { relatedWorks } = await import("../src/lib/eidos-related.mjs");
  const anchor = {
    id: "anchor", type: "painting", who: "One Artist", weather: "cold clarity",
    medium: "Oil on canvas", year: "1902", collection: "Museum A",
  };
  const candidates = [
    { id: "same-maker", type: "painting", who: "One Artist", year: "1931" },
    { id: "same-weather", type: "print", who: "Other", weather: "cold clarity", year: "1888" },
    { id: "same-medium", type: "painting", who: "Third", medium: "Oil on linen", year: "1914" },
    { id: "same-room", type: "painting", who: "Fourth", collection: "Museum A", year: "1905" },
    { id: "unsupported", type: "poster", who: "Fifth", year: "2020" },
  ];
  const related = relatedWorks(anchor, candidates, 4);

  assert.deepEqual(related.map((entry) => entry.item.id), ["same-maker", "same-weather", "same-medium", "same-room"]);
  assert.deepEqual(related.map((entry) => entry.reason), [
    "another work by One Artist",
    "also filed under cold clarity",
    "another oil work",
    "made in the same period",
  ]);
  assert.ok(!related.some((entry) => entry.item.id === "unsupported"));
});

test("every visual work has a focused, full-image record", () => {
  const map = JSON.parse(read("src/data/map.json"));
  const works = map.items.filter((item) => ["painting", "print", "poster"].includes(item.type) && item.src && !item.id.startsWith("his-"));
  const sample = works.find((item) => item.id === "a-sea-storm");
  const html = read(`dist/eidos/work/${sample.id}/index.html`);

  assert.match(html, new RegExp(`src="${sample.src.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`));
  assert.match(html, /<h1>A Sea Storm<\/h1>/);
  assert.match(html, /Joseph Vernet/);
  assert.match(html, /Mezzotint with some etching/);
  assert.match(html, /The Metropolitan Museum of Art/);
  assert.match(html, /source record ↗/);
  assert.match(html, /why these are nearby/);
  assert.equal(
    fs.readdirSync(path.join(root, "dist/eidos/work"), { withFileTypes: true }).filter((entry) => entry.isDirectory()).length,
    works.length,
  );
});

test("the moodboard offers a plain path from a label to its artwork record", () => {
  const moodboard = read("src/components/eidos/EidosMoodboard.astro");
  assert.match(moodboard, /href=\{`\/eidos\/work\/\$\{item\.id\}`\}/);
  assert.match(moodboard, />open record<\/a>/);
});
