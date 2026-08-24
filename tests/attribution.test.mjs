import assert from "node:assert/strict";
import test from "node:test";

import { attribution, cleanField } from "../scripts/lib/attribution.mjs";

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
