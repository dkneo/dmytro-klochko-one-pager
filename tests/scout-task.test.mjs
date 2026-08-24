import assert from "node:assert/strict";
import test from "node:test";

import { buildBlankCsv, scoreExample } from "../public/scripts/scout-task.js";

test("the weekly sheet contains thirty numbered rows and the required fields", () => {
  const lines = buildBlankCsv(30).trimEnd().split("\n");

  assert.equal(lines.length, 31);
  assert.equal(lines[0], "number,creator or example,direct link,hook or concept,target audience,why it could work for Replika,source channel,score,shortlist");
  assert.equal(lines[1], "1,,,,,,,,");
  assert.equal(lines[30], "30,,,,,,,,");
});

test("the shortlist rubric separates strong examples from weak ones", () => {
  assert.deepEqual(scoreExample([2, 2, 2, 2, 1]), { score: 9, verdict: "shortlist" });
  assert.deepEqual(scoreExample([2, 1, 1, 1, 1]), { score: 6, verdict: "discuss" });
  assert.deepEqual(scoreExample([1, 1, 0, 1, 0]), { score: 3, verdict: "do not shortlist" });
});
