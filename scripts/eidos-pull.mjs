// Brings what he taught the map back into the vault, where it belongs.
//
// The map writes to KV because a web page cannot commit to git. This closes
// the loop the other way: read the answers, write them into the markdown, and
// let the next build move the marks. Nothing is applied silently — every
// change is printed, and the vault is git, so it is all reviewable.
//
//   node scripts/eidos-pull.mjs           show what is waiting
//   node scripts/eidos-pull.mjs --apply   write it into the notes
import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

import sharp from "sharp";

import { paintingNote, bookmarkNote, wordNote } from "./lib/vault-note.mjs";
import { confirmedCandidateWeather, planCandidateImports } from "../src/lib/eidos-candidates.mjs";

const NS = "d5e466fe143e4b8aadce72dd01da4507";
const UA = "dmklochko-site/1.0 (https://dmklochko.com; keeping a painting)";
const KEPT_DIR = "public/images/vault";

// The inbox holds most candidates as urls on Wikimedia's servers, on purpose:
// a picture nobody keeps should never cost a file in this repo. A keep
// reverses that. Every other note in the vault carries a local src, the map
// derives its thumbnails from local files, and vault-build refuses outright
// to ship a chord whose painting is not on disk — so the moment he keeps
// something, the picture comes home.
//
// An /images/inbox/ path is the one local src that is not the picture: the
// harvester saves a deck-sized copy so the sitting has something to show, and
// treating that as home shipped four paintings too small to make a 960px
// derivative. On a keep, an inbox src is re-fetched at full size from the
// Commons page the candidate cites.
const INBOX = "/images/inbox/";
function fullSize(c) {
  if (!c.source) return null;
  const page = decodeURIComponent(c.source);
  const file = page.match(/File:(.+)$/)?.[1];
  if (!file) return null;
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=1600`;
}

async function sourceImage(c) {
  const commons = c.src.startsWith(INBOX) ? fullSize(c) : null;
  if (commons) return commons;
  const metId = String(c.source || "").match(/metmuseum\.org\/art\/collection\/search\/(\d+)/)?.[1];
  if (!metId) return c.src;
  const metadata = await fetch(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${metId}`, {
    headers: { "user-agent": UA },
  });
  if (!metadata.ok) throw new Error(`${metadata.status} fetching Met record ${metId}`);
  const record = await metadata.json();
  return record.primaryImage || c.src;
}

async function bringHome(c) {
  const remote = await sourceImage(c);
  if (c.src.startsWith("/") && remote === c.src) return c.src;    // already ours
  const out = join(KEPT_DIR, `${c.id}.webp`);
  const local = `/images/vault/${c.id}.webp`;
  if (existsSync(out)) return local;
  const url = remote;
  const r = await fetch(url, { headers: { "user-agent": UA } });
  if (!r.ok) throw new Error(`${r.status} fetching ${url}`);
  mkdirSync(KEPT_DIR, { recursive: true });
  await sharp(Buffer.from(await r.arrayBuffer()))
    .resize({ width: 1600, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(out);
  return local;
}
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
const kept = Object.entries(verdicts).filter(([, v]) => v.verdict === "keep" || v.verdict === "favorite");
const map = JSON.parse(readFileSync("src/data/map.json", "utf8"));
const primaryTypes = ["painting", "print", "poster"];
const importPlan = planCandidateImports({
  candidates: inbox,
  verdicts,
  existing: (map.items || []).filter((item) => primaryTypes.includes(item.type)),
  allowedTypes: primaryTypes,
});
const born = [];
for (const c of importPlan.ready) {
  const id = c.id;
  const decisions = c.verdictIds.map((verdictId) => verdicts[verdictId]).filter(Boolean);
  const v = decisions.find((decision) => decision.verdict === "favorite")
    || decisions.find((decision) => decision.say)
    || decisions[0]
    || {};
  const dirFor = { poster: "vault/posters", print: "vault/prints" };
  const file = `${dirFor[c.type] || "vault/paintings"}/${id}.md`;
  if (existsSync(file)) { born.push(`  = ${id}: already a note`); continue; }
  const remote = !(c.src || "").startsWith("/");
  const editions = c.verdictIds.length > 1 ? ` (${c.verdictIds.length} judged editions → one work)` : "";
  born.push(`  + ${id} → ${c.who}, ${c.title}${editions}${remote ? " (bringing the picture home)" : ""}`);
  if (!apply) continue;

  mkdirSync(file.slice(0, file.lastIndexOf("/")), { recursive: true });
  let src;
  try {
    src = await bringHome(c);
  } catch (e) {
    born.push(`  ! ${id}: ${e.message} — note not written`);
    continue;
  }
  // The current studio writes the harvester's search bucket into every
  // verdict automatically. A keep says "this stays"; it does not confirm a
  // taste category. Only a separately recorded category choice may place it.
  const weather = confirmedCandidateWeather(v);
  writeFileSync(file, paintingNote(c, {
    weather,
    src,
    added: new Date().toISOString().slice(0, 10),
    say: v.say,
    favorite: c.favorite,
  }));
}

for (const item of importPlan.represented) {
  born.push(`  = ${item.verdictIds.join(", ")}: already represented by ${item.existingId}`);
}
for (const item of importPlan.blocked) {
  born.push(`  ! ${item.verdictIds.join(", ")}: held for ${item.missing.join(", ")}`);
}
for (const item of importPlan.held) {
  if (["poem", "quote", "song"].includes(item.type)) continue;
  born.push(`  · ${item.verdictIds.join(", ")}: verdict preserved outside the paintings room`);
}

// Words keep their existing route into the reading room. They are deliberately
// excluded from the primary visual-art import plan, not discarded.
for (const c of inbox.filter((candidate) => ["poem", "quote", "song"].includes(candidate.type))) {
  const v = verdicts[c.id];
  if (!v || (v.verdict !== "keep" && v.verdict !== "favorite")) continue;
  const file = `vault/${c.type === "poem" ? "poems" : c.type === "quote" ? "quotes" : "songs"}/${c.id}.md`;
  if (existsSync(file)) { born.push(`  = ${c.id}: already a note`); continue; }
  born.push(`  + ${c.id} → ${c.who}, ${c.type}`);
  if (!apply) continue;
  mkdirSync(file.slice(0, file.lastIndexOf("/")), { recursive: true });
  writeFileSync(file, wordNote(c, {
    weather: v.weather || c.weather || "",
    added: new Date().toISOString().slice(0, 10),
    say: v.say,
  }));
}

const missingCandidates = kept.filter(([id]) => !inbox.some((candidate) => candidate.id === id));
for (const [id] of missingCandidates) born.push(`  ? ${id}: kept, but no longer in the inbox`);
if (apply && born.some((b) => b.startsWith("  +"))) {
  console.log("\n  run `node scripts/image-build.mjs --apply` next: the new");
  console.log("  paintings need their thumbnails before the map can show them.");
}
// ── the inbox: links he threw in and then kept ────────────────────────
// A bookmark lives in KV from the moment he pastes it; a keep is what turns
// it into a note. The verdict store is shared with the candidates, keyed by
// the bookmark's id, so one swipe surface judges both.
const bookmarks = kv("eidos:bookmarks") || {};
for (const [id, b] of Object.entries(bookmarks)) {
  const v = verdicts[id];
  if (!v || (v.verdict !== "keep" && v.verdict !== "favorite")) continue;
  const file = `vault/bookmarks/${id}.md`;
  if (existsSync(file)) { born.push(`  = ${id}: already a note`); continue; }
  born.push(`  + ${id} → ${b.site || "link"}, ${b.title || b.url}${b.summary ? "" : " (no summary yet)"}`);
  if (!apply) continue;
  mkdirSync("vault/bookmarks", { recursive: true });
  writeFileSync(file, bookmarkNote(b, {
    weather: v.weather || b.weather || "",
    added: new Date().toISOString().slice(0, 10),
    say: v.say,
  }));
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
