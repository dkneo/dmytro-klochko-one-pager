// Brings what he taught the map back into the vault, where it belongs.
//
// The map writes to KV because a web page cannot commit to git. This closes
// the loop the other way: read the answers, write them into the markdown, and
// let the next build move the marks. Nothing is applied silently — every
// change is printed, and the vault is git, so it is all reviewable.
//
//   node scripts/eidos-pull.mjs           show what is waiting
//   node scripts/eidos-pull.mjs --apply   write it into the notes
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

const NS = "d5e466fe143e4b8aadce72dd01da4507";
const apply = process.argv.includes("--apply");

function kv(key) {
  try {
    const out = execFileSync("npx", ["wrangler", "kv", "key", "get", `--namespace-id=${NS}`, key, "--remote"],
      { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
    return JSON.parse(out.trim());
  } catch { return null; }
}

const placed = kv("eidos:placed") || {};
const verdicts = kv("eidos:verdicts") || {};
const pairs = kv("eidos:pairs") || [];

// find the note a mark id belongs to
const files = {};
for (const dir of readdirSync("vault")) {
  const d = join("vault", dir);
  for (const f of readdirSync(d)) if (f.endsWith(".md")) files[f.replace(/\.md$/, "")] = join(d, f);
}

const changes = [];
for (const [id, v] of Object.entries(placed)) {
  const path = files[id];
  if (!path) { changes.push(`  ? ${id}: no note by that name`); continue; }
  const text = readFileSync(path, "utf8");
  if (/^weather:/m.test(text)) { changes.push(`  = ${id}: already has a weather, left alone`); continue; }
  changes.push(`  + ${id} → ${v.weather}`);
  if (apply) {
    // slot it in after the type line, where every other note carries it
    const next = text.replace(/^(type:.*)$/m, `$1\nweather: ${v.weather}`);
    writeFileSync(path, next);
  }
}

// Kept candidates become real notes. The candidate file already carries the
// attribution and licence, so nothing has to be looked up or guessed; the
// proposed weather is only used because he saw it on the card and kept it
// anyway, which is an answer.
const inbox = JSON.parse(readFileSync("public/inbox.json", "utf8")).candidates || [];
const kept = Object.entries(verdicts).filter(([, v]) => v.verdict === "keep");
const born = [];
for (const [id, v] of kept) {
  const c = inbox.find((x) => x.id === id);
  if (!c) { born.push(`  ? ${id}: kept, but no longer in the inbox`); continue; }
  const file = `vault/paintings/${id}.md`;
  if (existsSync(file)) { born.push(`  = ${id}: already a note`); continue; }
  born.push(`  + ${id} → ${c.who}, ${c.title}`);
  if (apply) {
    writeFileSync(file, [
      "---", "type: painting", `who: ${c.who}`, `title: ${c.title}`,
      c.year ? `year: ${c.year}` : "", `src: ${c.src}`,
      c.source ? `source: "${c.source}"` : "", c.licence ? `licence: ${c.licence}` : "",
      (v.weather || c.weather) ? `weather: ${v.weather || c.weather}` : "",
      `added: ${new Date().toISOString().slice(0, 10)}`,
      "---", "", "kept from the queue on /eidos.", "",
    ].filter(Boolean).join("\n"));
  }
}
const passed = Object.values(verdicts).filter((v) => v.verdict === "pass").length;
console.log(`\ncandidates judged: ${Object.keys(verdicts).length} (${kept.length} kept, ${passed} passed)`);
console.log(born.join("\n") || "  nothing new");

// The pairs do not edit notes yet: a single answer is not evidence. They
// accumulate until there are enough to rank a weather by, which is a
// different job and should not be guessed at now.
const byWeather = {};
for (const p of pairs) (byWeather[p.weather] ||= []).push(p.winner);

console.log(`placements waiting: ${Object.keys(placed).length}`);
console.log(changes.join("\n") || "  none");
console.log(`\npair answers: ${pairs.length}` +
  (pairs.length ? "\n" + Object.entries(byWeather).map(([w, ws]) => `  ${w}: ${ws.length}`).join("\n") : ""));
if (!apply && changes.some((c) => c.startsWith("  +"))) console.log("\nnothing written. run with --apply to file them.");
