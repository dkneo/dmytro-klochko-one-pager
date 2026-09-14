import assert from "node:assert/strict";
import test from "node:test";

test("a discovery sitting is finite, diverse, duplicate-safe, and explained", async () => {
  const { planDiscoverySession } = await import("../src/lib/eidos-session.mjs");
  const archive = [
    { id: "kept-deep", type: "painting", who: "Deep Artist", title: "Earlier", year: "1910", weather: "cold clarity" },
    { id: "kept-warm", type: "painting", who: "Warm Artist", title: "Earlier warmth", year: "1930", weather: "invincible summer" },
    { id: "kept-modern", type: "print", who: "Modern Artist", title: "Present", year: "1925", weather: "cold clarity" },
  ];
  const candidates = [
    { id: "judged", type: "painting", who: "Gone", title: "Already seen", year: "1880" },
    { id: "deep", type: "painting", who: "Deep Artist", title: "Another view", year: "1920" },
    { id: "bridge", type: "painting", who: "New Bridge", title: "A bridge", year: "1888", weather: "cold clarity" },
    { id: "stretch", type: "painting", who: "Early Artist", title: "An early thing", year: "1612" },
    { id: "contrast", type: "painting", who: "Late Artist", title: "A late thing", year: "2018" },
    { id: "one", type: "painting", who: "One", title: "One", year: "1840" },
    { id: "two", type: "painting", who: "Two", title: "Two", year: "1850" },
    { id: "three", type: "painting", who: "Three", title: "Three", year: "1860" },
    { id: "four", type: "painting", who: "Four", title: "Four", year: "1870" },
    { id: "five", type: "painting", who: "Five", title: "Five", year: "1890" },
    { id: "six", type: "painting", who: "Six", title: "Six", year: "1950" },
    { id: "wave-a", type: "print", who: "Katsushika Hokusai", title: "Under the Wave off Kanagawa", year: "1831" },
    { id: "wave-b", type: "print", who: "Katsushika Hokusai", title: "Under the Wave off Kanagawa, also known as The Great Wave", year: "1831" },
  ];

  const plan = planDiscoverySession({ candidates, judged: new Set(["judged"]), archive, limit: 10 });
  assert.equal(plan.cards.length, 10);
  assert.ok(plan.remaining.length > 0);
  assert.ok(plan.cards.every((card, index) => card.sessionPosition === index + 1));
  assert.ok(plan.cards.every((card) => card.reason && card.role));
  assert.ok(!plan.cards.some((card) => card.id === "judged"));
  assert.ok(!plan.cards.some((card, index) => card.who === plan.cards[index - 1]?.who));
  assert.equal(plan.cards.filter((card) => /Wave off Kanagawa/.test(card.title)).length, 1);
  assert.ok(plan.cards.some((card) => card.role === "deepen" && /Deep Artist/.test(card.reason)));
  assert.ok(plan.cards.some((card) => card.role === "bridge" && /cold clarity search/.test(card.reason)));
  assert.ok(plan.cards.some((card) => card.role === "stretch" && /1600s/.test(card.reason)));
  assert.ok(plan.cards.some((card) => card.role === "contrast" && /change of period/.test(card.reason)));
});

test("search buckets stay provenance, not inferred preference", async () => {
  const { planDiscoverySession } = await import("../src/lib/eidos-session.mjs");
  const plan = planDiscoverySession({
    candidates: [{ id: "new", type: "painting", who: "Someone New", title: "New", year: "1901", weather: "vastness" }],
    archive: [{ id: "kept", type: "painting", who: "Other", title: "Kept", year: "1900", weather: "vastness" }],
    limit: 1,
  });
  assert.match(plan.cards[0].reason, /search/);
  assert.doesNotMatch(plan.cards[0].reason, /you (?:love|like|prefer)|your vastness/);
});
