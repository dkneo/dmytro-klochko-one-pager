import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

// A translation with a stanza break is a block scalar with a blank line in
// it. Both build readers used to end the block at that blank line, so
// Rilke's Herbsttag shipped as its first stanza under a translator's label —
// three lines presented as the poem. Every poem's english must reach the
// map and the day's payload whole.

const root = path.resolve(import.meta.dirname, "..");
const read = (f) => fs.readFileSync(path.join(root, f), "utf8");
const verse = (s) => String(s || "").split("\n").filter((l) => l.trim()).length;

function englishOf(note) {
  const head = note.slice(4, note.indexOf("\n---", 3)).split("\n");
  const i = head.findIndex((l) => /^english:\s*\|-?\s*$/.test(l));
  if (i < 0) return null;
  const lines = [];
  for (let j = i + 1; j < head.length; j++) {
    if (/^\s{2,}/.test(head[j])) { lines.push(head[j].slice(2)); continue; }
    if (head[j].trim() === "") {
      let k = j + 1; while (k < head.length && head[k].trim() === "") k++;
      if (k < head.length && /^\s{2,}/.test(head[k])) { lines.push(""); continue; }
    }
    break;
  }
  return lines.join("\n");
}

test("a poem's translation reaches the map whole, stanza breaks and all", () => {
  const map = JSON.parse(read("src/data/map.json"));
  const dir = path.join(root, "vault/poems");
  let stanzaBreaks = 0;
  for (const f of fs.readdirSync(dir).filter((f) => f.endsWith(".md"))) {
    const english = englishOf(read(path.join("vault/poems", f)));
    if (english == null) continue;
    if (/\n\s*\n/.test(english)) stanzaBreaks++;
    const item = map.items.find((i) => i.id === f.replace(/\.md$/, ""));
    assert.ok(item, `${f} is not on the map`);
    assert.equal(verse(item.line), verse(english), `${f}: the map carries ${verse(item.line)} lines of a ${verse(english)}-line translation`);
  }
  assert.ok(stanzaBreaks >= 1, "the guard needs at least one poem with a stanza break to mean anything");
});

test("a poem's translation reaches the day's payload whole", () => {
  const dir = path.join(root, "public/today-data");
  const notes = Object.fromEntries(
    fs.readdirSync(path.join(root, "vault/poems")).filter((f) => f.endsWith(".md"))
      .map((f) => [read(path.join("vault/poems", f)), englishOf(read(path.join("vault/poems", f)))])
      .filter(([, e]) => e != null)
      .map(([note, e]) => [note.match(/^who:\s*(.+)$/m)?.[1].trim(), e]),
  );
  let checked = 0;
  for (const f of fs.readdirSync(dir).filter((f) => f.endsWith(".json") && f !== "manifest.json")) {
    const day = JSON.parse(read(path.join("public/today-data", f)));
    const e = notes[day.poem?.who];
    if (!e || !day.poem.english) continue;
    // the day may cast a different poem by the same author; only compare when the first line agrees
    if (day.poem.english.split("\n")[0].trim() !== e.split("\n")[0].trim()) continue;
    assert.equal(verse(day.poem.english), verse(e), `${f}: ${day.poem.who}'s translation is cut short`);
    checked++;
  }
  assert.ok(checked >= 1, "no day carried a translated poem to check");
});
