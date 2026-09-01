// The second well: the Metropolitan Museum's Open Access collection.
//
// Commons is broad and messy; the Met is deep, catalogued, and CC0 for
// everything it marks public domain. It is also where the objects live —
// the chairs, bowls, lamps and armour that "the plain thing" was always
// reaching for while the Commons searches kept returning bread and jugs.
//
// Rules, unchanged from the Commons harvester:
//   Public domain only. isPublicDomain is the museum's own flag; anything
//   without it is not ours to offer.
//   Never invent an attribution. The Met leaves artistDisplayName empty for
//   most objects, which is honest — an anonymous Shaker chair has no author
//   and the card says so by saying nothing.
//   Provenance always: every candidate carries its objectURL.
//
//   node scripts/candidates-met.mjs            look, print, change nothing
//   node scripts/candidates-met.mjs --apply    write them into inbox.json
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const apply = process.argv.includes("--apply");
const WANT = Number(process.env.WANT || 150);
const PER_QUERY = Number(process.env.PER_QUERY || 6);
const API = "https://collectionapi.metmuseum.org/public/collection/v1";
const UA = "dmklochko-taste-map/1.0 (https://dmklochko.com; contact via site)";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Single words, because the Met's search collapses to nothing on phrases.
// Aimed by his verdicts: he keeps weather, water, night light and one thing
// looked at properly; he passes food on tables.
const QUERIES = {
  "cold clarity": [
    ["snow"], ["frost"], ["winter"], ["ice"], ["moonlight"],
    ["celadon", "object"], ["stoneware", "object"], ["porcelain", "object"],
    ["screen", "object"], ["lacquer", "object"],
  ],
  "dissolution": [
    ["fog"], ["mist"], ["twilight"], ["rain"], ["dusk"],
    ["raku", "object"], ["shino", "object"], ["oribe", "object"],
    ["haze"], ["vapor"], ["smoke"], ["steam"],
    ["lacquer", "object"], ["weathered", "object"],
  ],
  "invincible summer": [
    ["summer"], ["harvest"], ["sunlight"], ["orchard"], ["wheat"],
    ["poppy"], ["bathers"], ["lotus"], ["meadow"], ["vineyard"],
    ["fan", "object"], ["kosode", "object"], ["screen", "object"],
  ],
  "nerve": [
    ["storm"], ["shipwreck"], ["volcano"], ["wave"], ["reef"],
    ["armor", "object"], ["helmet", "object"], ["tsuba", "object"],
    ["kabuto", "object"],
  ],
  "the dark and the lamp": [
    ["nocturne"], ["night"], ["candle"], ["moon"], ["ember"], ["shadow"],
    ["candlestick", "object"], ["lantern", "object"], ["lamp", "object"],
    ["torch", "object"], ["censer", "object"],
  ],
  "the plain thing": [
    ["bowl", "object"], ["chair", "object"], ["teapot", "object"], ["vessel", "object"],
    ["basket", "object"], ["shaker", "object"], ["bench", "object"], ["jar", "object"],
    ["kettle", "object"], ["box", "object"], ["stool", "object"],
    ["tenmoku", "object"], ["bizen", "object"],
  ],
  "vastness": [
    ["mountain"], ["sea"], ["moon"], ["waterfall"], ["horizon"],
    ["desert"], ["canyon"], ["glacier"], ["fuji"],
    ["prairie"], ["iceberg"], ["stars"], ["mesa"],
    ["astrolabe", "object"], ["celestial", "object"],
  ],
  "weight and grace": [
    ["dancer"], ["swan"], ["acrobat"], ["crane"], ["horse"], ["ballet"],
    ["leap"], ["flight"],
    ["netsuke", "object"], ["drapery"], ["kimono", "object"], ["inro", "object"],
    ["obi", "object"], ["silk", "object"],
  ],
};

// The Met's API is free and unmetered by key, which means the only thing
// protecting it is callers behaving. A first run at 90ms took four queries
// before every request came back 403. Slow, and back off when told to.
const SEARCH_SLEEP = Number(process.env.SEARCH_SLEEP || 900);
const OBJ_SLEEP = Number(process.env.OBJ_SLEEP || 260);

async function get(url, tries = 3) {
  for (let attempt = 0; attempt < tries; attempt++) {
    const r = await fetch(url, { headers: { "user-agent": UA } });
    if (r.ok) return r.json();
    if (r.status !== 403 && r.status !== 429) throw new Error(`${r.status} ${url}`);
    const wait = [8000, 25000, 60000][attempt];
    console.log(`  … ${r.status}, waiting ${wait / 1000}s`);
    await sleep(wait);
  }
  throw new Error(`rate limited: ${url}`);
}

// ── what is already known, so nothing arrives twice ─────────────────────
const inboxPath = "public/inbox.json";
const inbox = existsSync(inboxPath) ? JSON.parse(readFileSync(inboxPath, "utf8")) : { candidates: [] };
const known = new Set();
for (const c of inbox.candidates) {
  known.add((c.source || "").toLowerCase());
  known.add((c.title || "").toLowerCase());
}
if (existsSync("vault")) {
  for (const dir of readdirSync("vault")) {
    const path = join("vault", dir);
    try {
      for (const f of readdirSync(path)) {
        if (!f.endsWith(".md")) continue;
        const t = readFileSync(join(path, f), "utf8");
        for (const k of ["source", "title"]) {
          const m = new RegExp(`^${k}:\\s*"?([^"\\n]+)"?`, "m").exec(t);
          if (m) known.add(m[1].trim().toLowerCase());
        }
      }
    } catch { /* not a directory */ }
  }
}

const inboxPer = {};
for (const c of inbox.candidates) {
  if (c.weather) inboxPer[c.weather] = (inboxPer[c.weather] || 0) + 1;
}
const weatherOrder = Object.keys(QUERIES).sort((a, b) =>
  (inboxPer[a] || 0) - (inboxPer[b] || 0),
);
console.log("aiming, thinnest inbox first:");
for (const w of weatherOrder) {
  console.log(`  ${w.padEnd(22)} inbox ${inboxPer[w] || 0}, ${QUERIES[w].length} queries`);
}
console.log("");

const OBJECT_CLASS = /ceramic|furniture|glass|metalwork|silver|wood|lacquer|textile|basket|jade|arms|armor|netsuke|vessel|jewelry|screen|costume/i;
const PAINT_CLASS = /painting|screen|scroll|print|drawing|watercolor/i;

const found = [];
outer:
for (const weather of weatherOrder) {
  const queries = QUERIES[weather];
  for (const [q, want = "painting"] of queries) {
    if (found.length >= WANT) break outer;
    let ids = [];
    try {
      const res = await get(`${API}/search?hasImages=true&isPublicDomain=true&q=${encodeURIComponent(q)}`);
      ids = res.objectIDs || [];
    } catch (e) {
      console.log(`  ! ${q}: ${e.message}`);
      continue;
    }
    await sleep(SEARCH_SLEEP);
    if (!ids.length) continue;

    // spread across the whole result set rather than taking the first few,
    // so a query for "bowl" does not return six of the same bowl
    const step = Math.max(1, Math.floor(ids.length / (PER_QUERY * 4)));
    let taken = 0;
    for (let i = 0; i < ids.length && taken < PER_QUERY; i += step) {
      if (found.length >= WANT) break outer;
      let o;
      try { o = await get(`${API}/objects/${ids[i]}`); } catch { continue; }
      await sleep(OBJ_SLEEP);                           // their servers, respected

      if (!o.isPublicDomain || !o.primaryImageSmall) continue;
      // Met titles sometimes wear catalogue italics (<i>Tsuba</i>). Those
      // tags break the sitting page's JSON payload and the tests that read it.
      const title = (o.title || "")
        .replace(/<[^>]+>/g, "")
        .replace(/[–—]/g, "-")
        .replace(/\s+/g, " ")
        .trim();
      if (!title || title.length < 3) continue;
      if (known.has(title.toLowerCase()) || known.has((o.objectURL || "").toLowerCase())) continue;

      // the kind has to match what the query went looking for
      const cls = `${o.classification || ""} ${o.medium || ""} ${o.department || ""}`;
      if (want === "object" && !OBJECT_CLASS.test(cls)) continue;
      if (want === "painting") {
        if (!PAINT_CLASS.test(cls)) continue;
        // a photograph of winter is not a painting of winter, and the search
        // happily returns both
        if (/photograph|daguerreotype|albumen|gelatin silver/i.test(cls)) continue;
      }

      // Relevance, not just kind. The Met's search reaches through catalogue
      // text, so "winter" returned a van Dyck of a man mounting a horse. The
      // word has to appear somewhere the object itself claims: its title, its
      // medium, or the tags the museum put on it.
      const tags = (o.tags || []).map((t) => t.term).join(" ");
      const claims = `${title} ${o.medium || ""} ${o.classification || ""} ${tags} ${o.objectName || ""}`.toLowerCase();
      if (!claims.includes(q.toLowerCase().split(" ")[0])) continue;

      // Court ornament is not austerity. His keeps are Shaker, raku,
      // Hammershøi — one thing looked at until it stops being ordinary —
      // and a gilt armorial tureen is the opposite of that even when it
      // technically answers the query.
      if (/armorial|ormolu|gilt bronze|chinoiserie|rococo|snuffbox|tureen|ewer with|encrusted/i.test(claims)) continue;

      known.add(title.toLowerCase());
      known.add((o.objectURL || "").toLowerCase());
      taken++;
      found.push({
        id: (title.toLowerCase().replace(/[^\w]+/g, "-").replace(/^-|-$/g, "").slice(0, 48)
             || `met-${o.objectID}`),
        type: want,
        who: (o.artistDisplayName || "").trim(),     // empty is honest for an object
        title: title.slice(0, 80),
        year: (o.objectDate || "").replace(/[–—]/g, "-").slice(0, 24),
        remote: o.primaryImageSmall,
        source: o.objectURL,
        licence: "cc0",
        weather,
        found: new Date().toISOString().slice(0, 10),
      });
    }
    console.log(`  ${weather.padEnd(22)} ${q.padEnd(14)} +${taken}`);
  }
}

console.log(`\n${found.length} new from the met:\n`);
for (const c of found) {
  console.log(`  ${c.weather.padEnd(22)} ${(c.who || "—").padEnd(26)} ${c.title.slice(0, 44)}`);
}

if (apply && found.length) {
  inbox.candidates.push(...found.map((c) => ({ ...c, src: c.remote })));
  writeFileSync(inboxPath, JSON.stringify(inbox, null, 1));
  console.log(`\ninbox is now ${inbox.candidates.length} deep. images stay remote until one is kept.`);
} else if (found.length) {
  console.log("\nnothing written. run with --apply.");
}
