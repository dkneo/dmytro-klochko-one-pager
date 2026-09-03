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
import { readFileSync, writeFileSync, existsSync } from "node:fs";

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
  "cold clarity":          [["snow"], ["frost"], ["winter"], ["celadon", "object"], ["stoneware", "object"], ["stained glass", "print"], ["snow print", "print"]],
  "dissolution":           [["fog"], ["mist"], ["twilight"], ["raku", "object"], ["stoneware jar", "object"], ["rain print", "print"], ["photograph fog", "print"]],
  "invincible summer":     [["summer"], ["harvest"], ["sunlight"], ["orchard"], ["fan", "object"], ["poster", "print"], ["tapestry summer", "print"]],
  "nerve":                 [["storm"], ["shipwreck"], ["volcano"], ["armor", "object"], ["helmet", "object"], ["war poster", "print"], ["wave print", "print"]],
  "the dark and the lamp": [["nocturne"], ["candlestick", "object"], ["lantern", "object"], ["lamp", "object"], ["night"], ["stained glass lamp", "object"], ["night print", "print"]],
  "the plain thing":       [["bowl", "object"], ["chair", "object"], ["teapot", "object"], ["vessel", "object"],
                            ["basket", "object"], ["shaker", "object"], ["bench", "object"], ["jar", "object"]],
  "vastness":              [["mountain"], ["sea"], ["moon"], ["waterfall"], ["horizon"], ["landscape print", "print"], ["travel poster", "print"]],
  "weight and grace":      [["dancer"], ["swan"], ["acrobat"], ["netsuke", "object"], ["drapery"], ["dancer print", "print"], ["poster dancer", "print"]],
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

const OBJECT_CLASS = /ceramic|furniture|glass|metalwork|silver|wood|lacquer|textile|basket|jade|arms|armor|netsuke|vessel|jewelry/i;
const PAINT_CLASS = /painting|screen|scroll|drawing|watercolor/i;
// Posters, prints, stained glass and textiles: the kinds the deck was missing.
// A print is not a painting, so it stops being folded into one.
const PRINT_CLASS = /print|poster|woodcut|woodblock|lithograph|etching|stained glass|glass|textile|tapestry|photograph/i;

const found = [];
outer:
for (const [weather, queries] of Object.entries(QUERIES)) {
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
      const title = (o.title || "").trim();
      if (!title || title.length < 3) continue;
      if (known.has(title.toLowerCase()) || known.has((o.objectURL || "").toLowerCase())) continue;

      // the kind has to match what the query went looking for
      const cls = `${o.classification || ""} ${o.medium || ""} ${o.department || ""}`;
      if (want === "object" && !OBJECT_CLASS.test(cls)) continue;
      if (want === "print" && !PRINT_CLASS.test(cls)) continue;
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
        year: (o.objectDate || "").slice(0, 24),
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
