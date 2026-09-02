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

import { paintingNote, bookmarkNote } from "./lib/vault-note.mjs";

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

async function bringHome(c) {
  const thumb = c.src.startsWith(INBOX) ? fullSize(c) : null;
  if (c.src.startsWith("/") && !thumb) return c.src;    // already ours
  const out = join(KEPT_DIR, `${c.id}.webp`);
  const local = `/images/vault/${c.id}.webp`;
  if (existsSync(out)) return local;
  const url = (thumb || c.src).split("?")[0] + (thumb ? "?width=1600" : "");
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
const kept = Object.entries(verdicts).filter(([, v]) => v.verdict === "keep");
const born = [];
for (const [id, v] of kept) {
  const c = inbox.find((x) => x.id === id);
  if (!c) { born.push(`  ? ${id}: kept, but no longer in the inbox`); continue; }
  const dirFor = { object: "vault/objects", building: "vault/buildings" };
  const file = `${dirFor[c.type] || "vault/paintings"}/${id}.md`;
  if (existsSync(file)) { born.push(`  = ${id}: already a note`); continue; }
  const remote = !c.src.startsWith("/");
  born.push(`  + ${id} → ${c.who}, ${c.title}${remote ? " (bringing the picture home)" : ""}`);
  if (!apply) continue;

  mkdirSync(file.slice(0, file.lastIndexOf("/")), { recursive: true });
  let src;
  try {
    src = await bringHome(c);
  } catch (e) {
    born.push(`  ! ${id}: ${e.message} — note not written`);
    continue;
  }
  const weather = v.weather || c.weather;
  writeFileSync(file, paintingNote(c, {
    weather,
    src,
    added: new Date().toISOString().slice(0, 10),
  }));
}
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
  if (!v || v.verdict !== "keep") continue;
  const file = `vault/bookmarks/${id}.md`;
  if (existsSync(file)) { born.push(`  = ${id}: already a note`); continue; }
  born.push(`  + ${id} → ${b.site || "link"}, ${b.title || b.url}${b.summary ? "" : " (no summary yet)"}`);
  if (!apply) continue;
  mkdirSync("vault/bookmarks", { recursive: true });
  writeFileSync(file, bookmarkNote(b, {
    weather: v.weather || b.weather || "",
    added: new Date().toISOString().slice(0, 10),
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
