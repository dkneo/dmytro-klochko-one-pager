import assert from "node:assert/strict";
import test from "node:test";

const ledger = await import("../src/lib/eidos-candidates.mjs");

test("one canonical import preserves every verdict id across duplicate editions", () => {
  assert.equal(typeof ledger.planCandidateImports, "function");

  const candidates = [
    {
      id: "wave-print-a",
      type: "print",
      who: "Katsushika Hokusai",
      title: "Under the Wave off Kanagawa",
      src: "https://upload.wikimedia.org/wave-a.jpg",
      source: "https://commons.wikimedia.org/wiki/File:Wave_A.jpg",
    },
    {
      id: "wave-print-b",
      type: "print",
      who: "Katsushika Hokusai",
      title: "The Great Wave off Kanagawa",
      src: "https://upload.wikimedia.org/wave-b.jpg",
      source: "https://commons.wikimedia.org/wiki/File:Wave_B.jpg",
    },
    {
      id: "wave-print-c",
      type: "print",
      who: "Katsushika Hokusai",
      title: "Kanagawa oki nami ura, also known as The Great Wave",
      src: "https://upload.wikimedia.org/wave-c.jpg",
      source: "https://commons.wikimedia.org/wiki/File:Wave_C.jpg",
    },
  ];
  const verdicts = {
    "wave-print-a": { verdict: "keep" },
    "wave-print-b": { verdict: "favorite" },
    "wave-print-c": { verdict: "keep" },
  };

  const plan = ledger.planCandidateImports({ candidates, verdicts, existing: [] });

  assert.equal(plan.ready.length, 1);
  assert.deepEqual(plan.ready[0].verdictIds.sort(), ["wave-print-a", "wave-print-b", "wave-print-c"]);
  assert.equal(plan.ready[0].favorite, true);
  assert.equal(plan.represented.length, 0);
  assert.equal(plan.blocked.length, 0);
});

test("a kept edition already represented in the vault is not imported twice", () => {
  assert.equal(typeof ledger.planCandidateImports, "function");

  const candidates = [{
    id: "another-wave-file",
    type: "print",
    who: "Katsushika Hokusai",
    title: "The Great Wave off Kanagawa",
    src: "https://upload.wikimedia.org/another-wave.jpg",
    source: "https://commons.wikimedia.org/wiki/File:Another_Wave.jpg",
  }];
  const existing = [{
    id: "great-wave",
    type: "print",
    who: "Katsushika Hokusai",
    title: "Under the Wave off Kanagawa",
  }];

  const plan = ledger.planCandidateImports({
    candidates,
    verdicts: { "another-wave-file": { verdict: "keep" } },
    existing,
  });

  assert.equal(plan.ready.length, 0);
  assert.deepEqual(plan.represented.map((item) => item.existingId), ["great-wave"]);
  assert.deepEqual(plan.represented[0].verdictIds, ["another-wave-file"]);
});

test("an unattributed keep is blocked and a pass is ignored", () => {
  assert.equal(typeof ledger.planCandidateImports, "function");

  const candidates = [
    {
      id: "uncredited-tapestry",
      type: "painting",
      who: "",
      title: "Fragment of a Tapestry",
      src: "https://upload.wikimedia.org/tapestry.jpg",
      source: "https://commons.wikimedia.org/wiki/File:Tapestry.jpg",
    },
    {
      id: "passed-work",
      type: "painting",
      who: "Named Painter",
      title: "Passed Work",
      src: "https://upload.wikimedia.org/passed.jpg",
      source: "https://commons.wikimedia.org/wiki/File:Passed.jpg",
    },
  ];

  const plan = ledger.planCandidateImports({
    candidates,
    verdicts: {
      "uncredited-tapestry": { verdict: "keep" },
      "passed-work": { verdict: "pass" },
    },
    existing: [],
  });

  assert.equal(plan.ready.length, 0);
  assert.deepEqual(plan.blocked.map((item) => item.id), ["uncredited-tapestry"]);
  assert.deepEqual(plan.blocked[0].missing, ["maker"]);
});

test("kept media outside the visual-art room stays held without losing its verdict", () => {
  const plan = ledger.planCandidateImports({
    candidates: [{
      id: "bronze-vessel",
      type: "object",
      who: "Unknown maker",
      title: "Bronze Vessel",
      src: "https://upload.wikimedia.org/vessel.jpg",
      source: "https://commons.wikimedia.org/wiki/File:Vessel.jpg",
    }],
    verdicts: { "bronze-vessel": { verdict: "keep" } },
    existing: [],
    allowedTypes: ["painting", "print", "poster"],
  });

  assert.equal(plan.ready.length, 0);
  assert.equal(plan.blocked.length, 0);
  assert.deepEqual(plan.held[0].verdictIds, ["bronze-vessel"]);
  assert.equal(plan.held[0].reason, "outside-primary-collection");
});

test("an existing note id wins even when museum metadata changed its title", () => {
  const plan = ledger.planCandidateImports({
    candidates: [{
      id: "moon-over-river",
      type: "painting",
      who: "Example Painter",
      title: "Moon over the River, revised catalogue title",
      src: "https://upload.wikimedia.org/moon.jpg",
      source: "https://commons.wikimedia.org/wiki/File:Moon.jpg",
    }],
    verdicts: { "moon-over-river": { verdict: "keep" } },
    existing: [{
      id: "moon-over-river",
      type: "painting",
      who: "Example Painter",
      title: "Moon over the River",
    }],
  });

  assert.equal(plan.ready.length, 0);
  assert.equal(plan.represented[0].existingId, "moon-over-river");
});

test("a harvester search bucket is not mistaken for a chosen taste category", () => {
  assert.equal(ledger.confirmedCandidateWeather({ weather: "nerve" }), "");
  assert.equal(
    ledger.confirmedCandidateWeather({ weather: "nerve", weatherChosen: true }),
    "nerve",
  );
});
