import assert from "node:assert/strict";
import test from "node:test";

import { attribution, cleanField, year } from "../scripts/lib/attribution.mjs";

// Every case here is a string Wikimedia Commons actually returned while the
// harvester was running. They are the reason the module exists.

test("an attribution keeps the name and drops the catalogue", () => {
  const cases = [
    ["Peter DeWint (1784 - 1849) – Attributed to (British) Born in Stone", "Peter DeWint"],
    ["Charles Landseer (1799 - 1879) – Painter (British) Born in London", "Charles Landseer"],
    ["Painting by Odilon Redon", "Odilon Redon"],
    ["Anonymous Unknown author", "anonymous"],
    ["Jan Vermeer, painter", "Jan Vermeer"],
    ["Hokusai / Katsushika", "Hokusai"],
  ];
  for (const [raw, want] of cases) {
    assert.equal(attribution(raw), want, `from ${JSON.stringify(raw)}`);
  }
});

test("a name that is only a name survives untouched", () => {
  // The dangerous edge: hyphens inside real names, and painters with one.
  for (const name of [
    "Carlos Baca-Flor",
    "Henri de Toulouse-Lautrec",
    "Olga Wisinger-Florian",
    "John Constable",
    "Rembrandt",
    "Katsushika Hokusai",
  ]) {
    assert.equal(attribution(name), name);
  }
});

test("nothing in, nothing out", () => {
  for (const empty of [undefined, null, "", "   "]) {
    assert.equal(attribution(empty), "");
  }
});

test("a placeholder and a catalogue role are not makers", () => {
  // both hung on the deck tonight, credited as if they had painted something
  assert.equal(attribution("No machine-readable author provided. Foo~commonswiki assumed (based on copyright claims)."), "anonymous");
  assert.equal(attribution("Thallheimer, Arnold Related Names"), "Thallheimer, Arnold");
  assert.equal(attribution("Thallheimer, Arnold Related"), "Thallheimer, Arnold");
});

test("a long attribution is cut at a word, never mid-name", () => {
  const long = "Bartolomeo Suardi called Bramantino and his very long workshop attribution";
  const got = attribution(long);
  assert.ok(got.length <= 48);
  assert.ok(!long.slice(got.length).startsWith("x"), "cut mid-word");
  assert.equal(got, got.trim());
});

test("cleanField strips markup and structured-data noise", () => {
  assert.equal(cleanField('<a href="#">Georg Flegel</a>'), "Georg Flegel");
  assert.equal(cleanField("Still Life label QS:P1476,en"), "Still Life");
  assert.equal(cleanField("French: Nature morte"), "Nature morte");
});

test("a date is the year, not the machine-readable half beside it", () => {
  // Commons writes the date twice in one field, once for people and once for
  // Wikidata. Trimming the raw field to length left thirteen paintings on the
  // library wall dated "1868date QS:P571,+18".
  for (const [raw, want] of [
    ["1868<br>date QS:P571,+1868-00-00T00:00:00Z/9", "1868"],
    ["circa 1850\ndate QS:P571,+1850-00-00T00:00:00Z/9", "c. 1850"],
    ["18th century date QS:P571,+1750", "18th century"],
    ["Autumn 1915 date QS:P", "Autumn 1915"],
    ["1868–69", "1868–69"],   // a real range survives whole
    ["1920 ", "1920"],
    ["ca. 1900", "c. 1900"],   // one abbreviation on the wall, not two
    ["", ""],
  ]) assert.equal(year(raw), want, `from ${JSON.stringify(raw)}`);
});
