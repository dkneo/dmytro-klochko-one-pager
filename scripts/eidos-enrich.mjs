// Complete collection records for Met-sourced artworks already in the vault.
// Dry-run by default; the public museum API is the only authority used.
//
//   node scripts/eidos-enrich.mjs
//   node scripts/eidos-enrich.mjs --apply
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { fetchMetRecord, mergeArtworkFrontmatter, metArtworkRecord } from "../src/lib/eidos-museum.mjs";

const apply = process.argv.includes("--apply");
const checkedOn = new Date().toISOString().slice(0, 10);
const roots = ["vault/paintings", "vault/prints", "vault/posters"];
const waiting = [];

for (const root of roots) {
  for (const file of readdirSync(root).filter((name) => name.endsWith(".md"))) {
    const path = join(root, file);
    const markdown = readFileSync(path, "utf8");
    if (/^collection:/m.test(markdown)) continue;
    const id = markdown.match(/^source:\s*"?https:\/\/www\.metmuseum\.org\/art\/collection\/search\/(\d+)/m)?.[1];
    if (id) waiting.push({ id, path, markdown });
  }
}

async function load(item) {
  const record = await fetchMetRecord(item.id);
  if (String(record.objectID) !== item.id) throw new Error(`record id ${record.objectID} did not match ${item.id}`);
  if (record.isPublicDomain !== true) throw new Error("record is not marked public domain");
  return { ...item, record: metArtworkRecord(record, checkedOn) };
}

const results = [];
for (let index = 0; index < waiting.length; index += 6) {
  const batch = waiting.slice(index, index + 6);
  const settled = await Promise.allSettled(batch.map(load));
  for (let offset = 0; offset < settled.length; offset += 1) {
    const result = settled[offset];
    if (result.status === "fulfilled") results.push(result.value);
    else console.error(`  ! ${batch[offset].path}: ${result.reason?.message || result.reason}`);
  }
}

for (const item of results) {
  const next = mergeArtworkFrontmatter(item.markdown, item.record);
  console.log(`  + ${item.path} → ${item.record.collection}${item.record.displayStatus ? `, ${item.record.displayStatus}` : ""}`);
  if (apply) writeFileSync(item.path, next);
}

console.log(`\n${results.length}/${waiting.length} museum records ready${apply ? " and written" : ""}.`);
if (!apply && results.length) console.log("nothing written. run with --apply.");
