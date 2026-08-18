// Keeps the queue on /eidos full.
//
// Three suggestions a day empties eleven candidates in under a week, so this
// goes and finds more. It aims at whichever weathers are thinnest, because a
// map improves faster where it is emptiest.
//
// Wikimedia Commons only, and only public domain. Every candidate carries its
// source url and licence before it is ever offered, so nothing can end up in
// the vault without provenance. Search terms come from his own weather
// descriptions, not from a taste model: the machine proposes, he disposes.
//
//   node scripts/candidates.mjs            look, print, change nothing
//   node scripts/candidates.mjs --apply    write them into inbox.json
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const apply = process.argv.includes("--apply");
const WANT = Number(process.env.WANT || 12);
const UA = "dmklochko-taste-map/1.0 (https://dmklochko.com; contact via site)";

// His words, turned into search terms. Deliberately literal: the point is to
// surface things he has not seen, not to guess what he would say.
const TERMS = {
  "cold clarity":          ["winter light interior painting", "snow morning painting"],
  "dissolution":           ["fog painting", "mist landscape painting"],
  "invincible summer":     ["summer heat painting", "sunlight field painting"],
  "nerve":                 ["storm sea painting", "climbing mountain painting"],
  "the dark and the lamp": ["lamplight night interior painting", "candlelight painting"],
  "the plain thing":       ["still life single object painting", "kitchen still life"],
  "vastness":              ["mountain vista painting", "night sky landscape painting"],
  "weight and grace":      ["dancer painting", "falling figure painting"],
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function commons(term, n) {
  const u = new URL("https://commons.wikimedia.org/w/api.php");
  u.search = new URLSearchParams({
    action: "query", format: "json", origin: "*",
    generator: "search", gsrnamespace: "6", gsrsearch: `${term} filetype:bitmap`,
    gsrlimit: String(n), prop: "imageinfo|categories",
    iiprop: "url|extmetadata|size", iiurlwidth: "1400",
    cllimit: "50",
  }).toString();
  const r = await fetch(u, { headers: { "user-agent": UA } });
  if (!r.ok) throw new Error(`commons ${r.status}`);
  const d = await r.json();
  return Object.values(d?.query?.pages || {});
}

// what is already known, so nothing is offered twice
const known = new Set();
for (const dir of readdirSync("vault")) {
  for (const f of readdirSync(join("vault", dir))) {
    if (!f.endsWith(".md")) continue;
    const t = readFileSync(join("vault", dir, f), "utf8");
    for (const k of ["source", "title"]) {
      const m = new RegExp(`^${k}:\\s*"?([^"\n]+)"?`, "m").exec(t);
      if (m) known.add(m[1].trim().toLowerCase());
    }
  }
}
const inboxPath = "public/inbox.json";
const inbox = existsSync(inboxPath) ? JSON.parse(readFileSync(inboxPath, "utf8")) : { candidates: [] };
for (const c of inbox.candidates) { known.add((c.source || "").toLowerCase()); known.add((c.title || "").toLowerCase()); }

// thinnest weathers first
const map = JSON.parse(readFileSync("src/data/map.json", "utf8"));
const order = map.weathers.slice().sort((a, b) => a.count - b.count).map((w) => w.name);

const found = [];
for (const weather of order) {
  if (found.length >= WANT) break;
  for (const term of TERMS[weather] || []) {
    if (found.length >= WANT) break;
    let pages = [];
    try { pages = await commons(term, 8); } catch (e) { console.log(`  ! ${term}: ${e.message}`); continue; }
    await sleep(1300);                       // their rate limit, respected
    for (const p of pages) {
      const ii = p.imageinfo?.[0]; if (!ii) continue;
      const md = ii.extmetadata || {};
      const licence = (md.LicenseShortName?.value || "").replace(/<[^>]+>/g, "");
      // public domain only. anything else is not ours to publish.
      if (!/public domain|^pd|cc0/i.test(licence)) continue;
      // Commons packs structured-data markers into these fields. Everything
      // from the first "label QS:" or "title QS:" on is machine noise.
      const clean = (v) => (v || "")
        .replace(/<[^>]+>/g, " ")
        .split(/(?:label|title) QS:/)[0]
        .replace(/^\s*[A-Z][a-z]+:\s*/, "")      // "French: ..."
        .replace(/&[a-z]+;/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      const title = ((v) => v.replace(/([a-z])([A-Z])/g, "$1 $2"))(  // "DarkCorridor"
        clean(md.ObjectName?.value || p.title.replace(/^File:|\.\w+$/g, ""))).slice(0, 80);
      // Commons often lists an attribution chain; the first name is the one
      // worth showing. Never cut mid-word: a card he judges at a glance
      // should not look broken.
      const trim = (v, n) => v.length <= n ? v : v.slice(0, v.lastIndexOf(" ", n) > 12 ? v.lastIndexOf(" ", n) : n).trim();
      const who = trim(clean(md.Artist?.value).split(/\s*[/;]\s*/)[0]
        .replace(/^(attributed to|manner of|circle of|after)\s+/i, "")
        .replace(/\bAnonymous ?Unknown author\b/i, "anonymous"), 48);

      // It must actually be a painting. A satellite photograph is a fine
      // picture and a bad candidate, and his attention is the scarce thing.
      const cats = (p.categories || []).map((c) => c.title.toLowerCase()).join(" ");
      const painted = /painting|oil on|watercolou?r|tempera|panel|canvas/.test(cats + " " + clean(md.ObjectName?.value));
      if (!painted) continue;
      if (/nasa|photograph|satellite/i.test(who + " " + cats)) continue;
      if (title.length < 3) continue;
      if (!who || known.has(title.toLowerCase()) || known.has((ii.descriptionurl || "").toLowerCase())) continue;
      if ((ii.width || 0) < 1200) continue;  // sharpness is not negotiable here
      known.add(title.toLowerCase());
      found.push({
        id: title.toLowerCase().replace(/[^\w]+/g, "-").replace(/^-|-$/g, "").slice(0, 48),
        type: "painting", who, title,
        year: (md.DateTimeOriginal?.value || "").replace(/<[^>]+>/g, "").slice(0, 20),
        remote: ii.thumburl || ii.url,
        source: ii.descriptionurl, licence: licence.toLowerCase(),
        weather, found: new Date().toISOString().slice(0, 10),
      });
      break;                                  // one per search, for range
    }
  }
}

console.log(`${found.length} new candidates, aimed at the thinnest weathers first:\n`);
for (const c of found) console.log(`  ${c.weather.padEnd(22)} ${c.who} — ${c.title}`);

if (apply && found.length) {
  // Images are not downloaded here: that is a separate, reviewable step, and
  // a candidate nobody keeps should never have cost a file in the repo.
  inbox.candidates.push(...found.map((c) => ({ ...c, src: c.remote })));
  writeFileSync(inboxPath, JSON.stringify(inbox, null, 1));
  console.log(`\ninbox is now ${inbox.candidates.length} deep. images stay remote until one is kept.`);
} else if (found.length) {
  console.log("\nnothing written. run with --apply.");
}
