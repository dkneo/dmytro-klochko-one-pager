import assert from "node:assert/strict";
import test from "node:test";

import { fetchMetRecord, mergeArtworkFrontmatter, metArtworkRecord, parseCentimetres } from "../src/lib/eidos-museum.mjs";

test("Met dimensions become real centimetres instead of display guesses", () => {
  assert.deepEqual(
    parseCentimetres("11 5/8 x 14 in. (29.5 x 35.6 cm)"),
    { heightCm: 29.5, widthCm: 35.6 },
  );
  assert.deepEqual(
    parseCentimetres("Sheet: 15 in. (38.2 cm)"),
    {},
    "one number cannot establish both artwork axes",
  );
});

test("a Met API record becomes a sourced collection record", () => {
  assert.deepEqual(metArtworkRecord({
    objectID: 12298,
    objectURL: "https://www.metmuseum.org/art/collection/search/12298",
    repository: "Metropolitan Museum of Art, New York, NY",
    medium: "Watercolor and graphite on white wove paper",
    dimensions: "11 5/8 x 14 in. (29.5 x 35.6 cm)",
    GalleryNumber: "774",
  }, "2026-09-14"), {
    collection: "The Metropolitan Museum of Art",
    collectionCity: "New York",
    collectionUrl: "https://www.metmuseum.org/art/collection/search/12298",
    medium: "Watercolor and graphite on white wove paper",
    heightCm: 29.5,
    widthCm: 35.6,
    displayStatus: "on view · gallery 774",
    statusChecked: "2026-09-14",
  });
});

test("a blank gallery field never claims a work is on view", () => {
  const record = metArtworkRecord({
    objectID: 1,
    objectURL: "https://www.metmuseum.org/art/collection/search/1",
    repository: "Metropolitan Museum of Art, New York, NY",
    medium: "Oil on canvas",
    dimensions: "10 x 20 in. (25.4 x 50.8 cm)",
    GalleryNumber: "",
  }, "2026-09-14");

  assert.equal(record.displayStatus, undefined);
  assert.equal(record.statusChecked, undefined);
});

test("museum facts enter frontmatter without rewriting an existing claim", () => {
  const before = `---
type: painting
title: Snow
collection: "Existing Museum"
---

the body stays byte for byte.`;
  const after = mergeArtworkFrontmatter(before, {
    collection: "The Metropolitan Museum of Art",
    collectionCity: "New York",
    medium: "Watercolor and graphite on paper",
    heightCm: 29.5,
    widthCm: 35.6,
  });

  assert.match(after, /^collection: "Existing Museum"$/m);
  assert.doesNotMatch(after, /collection: "The Metropolitan/);
  assert.match(after, /^collection_city: "New York"$/m);
  assert.match(after, /^medium: "Watercolor and graphite on paper"$/m);
  assert.match(after, /^height_cm: 29\.5$/m);
  assert.match(after, /^width_cm: 35\.6$/m);
  assert.match(after, /\n---\n\nthe body stays byte for byte\.$/);
});

test("a temporary museum throttle retries once instead of dropping the record", async () => {
  let calls = 0;
  const waits = [];
  const record = await fetchMetRecord("45321", {
    fetcher: async () => {
      calls += 1;
      if (calls === 1) return { ok: false, status: 403 };
      return { ok: true, status: 200, json: async () => ({ objectID: 45321 }) };
    },
    pause: async (milliseconds) => waits.push(milliseconds),
  });

  assert.equal(calls, 2);
  assert.deepEqual(waits, [750]);
  assert.equal(record.objectID, 45321);
});
