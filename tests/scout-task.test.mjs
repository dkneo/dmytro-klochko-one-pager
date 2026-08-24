import assert from "node:assert/strict";
import test from "node:test";

import { buildBlankCsv, scoreExample } from "../public/scripts/scout-task.js";

test("the weekly sheet contains thirty numbered rows and the required fields", () => {
  const lines = buildBlankCsv(30).trimEnd().split("\n");
  const headers = lines[0].split(",");

  assert.equal(lines.length, 31);
  assert.deepEqual(headers, [
    "number",
    "creator or example",
    "direct link",
    "source channel",
    "hook or concept",
    "target audience",
    "why it could work for Replika",
    "hook clarity (0-2)",
    "Replika fit (0-2)",
    "creator naturalness (0-2)",
    "production usability (0-2)",
    "distinctiveness (0-2)",
    "total score (0-10)",
    "shortlist",
    "review notes",
  ]);
  assert.equal(lines[1].split(",").length, headers.length);
  assert.equal(lines[1].split(",")[0], "1");
  assert.equal(lines[30].split(",")[0], "30");
});

test("the shortlist rubric separates strong examples from weak ones", () => {
  assert.deepEqual(scoreExample([2, 2, 2, 2, 1]), { score: 9, verdict: "shortlist" });
  assert.deepEqual(scoreExample([2, 1, 1, 1, 1]), { score: 6, verdict: "discuss" });
  assert.deepEqual(scoreExample([1, 1, 0, 1, 0]), { score: 3, verdict: "do not shortlist" });
});
