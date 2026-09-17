import assert from "node:assert/strict";
import test from "node:test";

import { setDiscoveryStage } from "../src/lib/eidos-stage.mjs";

test("the discovery stage never leaves its backing sheet behind", () => {
  const card = { hidden: true };
  const backing = { hidden: true };
  const controls = { hidden: true };
  const note = { hidden: false };

  setDiscoveryStage({ card, backing, controls, note }, "artwork");
  assert.deepEqual(
    { card: card.hidden, backing: backing.hidden, controls: controls.hidden, note: note.hidden },
    { card: false, backing: false, controls: false, note: true },
  );

  setDiscoveryStage({ card, backing, controls, note }, "rest");
  assert.deepEqual(
    { card: card.hidden, backing: backing.hidden, controls: controls.hidden, note: note.hidden },
    { card: true, backing: true, controls: true, note: false },
  );
});
