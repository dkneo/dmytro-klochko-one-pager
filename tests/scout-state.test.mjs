import assert from "node:assert/strict";
import test from "node:test";

import {
  BACKUP_FORMAT,
  FIELDS,
  STATUSES,
  emptyState,
  loadState,
  mergeRows,
  normalizeRow,
  parseBackup,
  removeRow,
  restoreRow,
  serializeBackup,
  toCsv,
} from "../public/scripts/scout-state.js";

test("empty scout state has one explicit, versioned schema", () => {
  assert.deepEqual(emptyState(), {
    version: 1,
    days: {},
    quiz: {},
    drill: {},
    rows: [],
  });
  assert.deepEqual(FIELDS, [
    "handle", "platform", "niche", "rate", "contact",
    "status", "touch", "action", "date",
  ]);
  assert.ok(STATUSES.includes("closed"));
});

test("loading invalid or unknown storage falls back without pretending it worked", () => {
  assert.deepEqual(loadState("{broken"), {
    state: emptyState(),
    issue: "invalid-json",
  });
  assert.deepEqual(loadState(JSON.stringify({ version: 99, rows: [] })), {
    state: emptyState(),
    issue: "unsupported-version",
  });
});

test("legacy scout state migrates and normalizes rows", () => {
  const loaded = loadState(JSON.stringify({
    days: { d1: true },
    rows: [{ handle: 12, status: "unknown", extra: "drop me" }],
  }), { idFactory: () => "row-1" });

  assert.equal(loaded.issue, "migrated");
  assert.equal(loaded.state.version, 1);
  assert.deepEqual(loaded.state.days, { d1: true });
  assert.deepEqual(loaded.state.rows, [{
    id: "row-1",
    handle: "12",
    platform: "",
    niche: "",
    rate: "",
    contact: "",
    status: "found",
    touch: "",
    action: "",
    date: "",
    example: false,
  }]);
});

test("row normalization keeps fields bounded and demo rows explicit", () => {
  const row = normalizeRow({
    id: "kept-id",
    handle: `  @taso${"x".repeat(300)}  `,
    status: "replied",
    example: true,
  });

  assert.equal(row.id, "kept-id");
  assert.equal(row.handle.length, 200);
  assert.equal(row.handle.startsWith("@taso"), true);
  assert.equal(row.status, "replied");
  assert.equal(row.example, true);
});

test("CSV export quotes commas, quotes and newlines", () => {
  const csv = toCsv([{ id: "1", handle: "@a", niche: "cozy, honest", action: "say \"hi\"\nthen wait" }]);

  assert.equal(csv.split("\n", 1)[0], FIELDS.join(","));
  assert.match(csv, /"cozy, honest"/);
  assert.match(csv, /"say ""hi""\nthen wait"/);
  assert.doesNotMatch(csv, /\bid\b/);
});

test("JSON backup round-trips with a named format and timestamp", () => {
  const state = { ...emptyState(), rows: [normalizeRow({ id: "one", handle: "@one" })] };
  const json = serializeBackup(state, "2026-08-20T12:00:00.000Z");
  const raw = JSON.parse(json);

  assert.equal(raw.format, BACKUP_FORMAT);
  assert.equal(raw.exportedAt, "2026-08-20T12:00:00.000Z");
  assert.deepEqual(parseBackup(json), { state, issue: null });
  assert.deepEqual(parseBackup('{"format":"something-else","state":{}}'), {
    state: null,
    issue: "wrong-format",
  });
});

test("merge updates matching identities and keeps unrelated creators", () => {
  const current = [
    normalizeRow({ id: "a", handle: "@same", platform: "Instagram", status: "found" }),
    normalizeRow({ id: "b", handle: "@keep", platform: "TikTok" }),
  ];
  const incoming = [
    normalizeRow({ id: "new-id", handle: " @SAME ", platform: "instagram", status: "replied" }),
    normalizeRow({ id: "c", handle: "@new", platform: "Fiverr" }),
  ];

  const merged = mergeRows(current, incoming, "merge");
  assert.deepEqual(merged.map((row) => row.id), ["a", "b", "c"]);
  assert.equal(merged[0].status, "replied");
  assert.equal(merged[0].handle, "@SAME");
  assert.deepEqual(mergeRows(current, incoming, "replace"), incoming);
});

test("delete returns enough information for one-click undo", () => {
  const rows = [
    normalizeRow({ id: "a", handle: "@a" }),
    normalizeRow({ id: "b", handle: "@b" }),
    normalizeRow({ id: "c", handle: "@c" }),
  ];
  const removed = removeRow(rows, "b");

  assert.deepEqual(removed.rows.map((row) => row.id), ["a", "c"]);
  assert.equal(removed.index, 1);
  assert.equal(removed.removed.handle, "@b");
  assert.deepEqual(restoreRow(removed.rows, removed), rows);
});

