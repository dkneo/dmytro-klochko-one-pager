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

import { attribution, cleanField, year } from "./lib/attribution.mjs";

const apply = process.argv.includes("--apply");
const WANT = Number(process.env.WANT || 12);
const UA = "dmklochko-taste-map/1.0 (https://dmklochko.com; contact via site)";

// His words, turned into search terms. Deliberately literal: the point is to
// surface things he has not seen, not to guess what he would say.
// Four shots per weather rather than two. One search yields at most one
// candidate (the break below keeps the range wide), and most searches come
// back with nothing that passes the guards, so two terms left whole weathers
// empty: invincible summer had no candidate waiting at all.
// Each entry: a Commons search and the kind of thing it hunts. Paintings
// were first; objects and buildings joined when the library opened to
// design. For buildings, HABS/HAER survey photographs are the reliable
// public-domain vein — the US government cannot hold copyright.
const TERMS = {
  "cold clarity": [["icebound ship painting"], ["quiet interior window painting"], ["HABS meeting house interior", "building"], ["shoji screen", "object"], ["hoarfrost painting"], ["moonlight snow painting"], ["winter light interior painting"], ["snow morning painting"],
                            ["frost window painting"], ["nordic winter landscape painting"],
                            ["white porcelain Metropolitan Museum", "object"],
                            ["HABS interior stair hall", "building"]],
  "dissolution": [["steam locomotive fog painting"], ["marsh dawn painting"], ["HABS ruins", "building"], ["weathered wood bowl", "object"], ["twilight harbour painting"], ["nocturne sea painting"], ["fog painting"], ["mist landscape painting"],
                            ["rain seascape painting"], ["dusk river painting"],
                            ["raku tea bowl", "object"]],
  "invincible summer": [["haystacks painting"], ["bathers river painting"], ["sunlit wall painting"], ["HABS barn interior", "building"], ["heat haze painting"], ["swimmers river painting"], ["summer heat painting"], ["sunlight field painting"],
                            ["midday sun painting"], ["harvest summer landscape painting"],
                            ["HABS porch veranda", "building"]],
  "nerve": [["lifeboat rescue painting"], ["breaking waves rocks painting"], ["HAER dam spillway", "building"], ["climbing rope", "object"], ["volcano eruption painting"], ["rapids river painting"], ["storm sea painting"], ["climbing mountain painting"],
                            ["shipwreck painting"], ["avalanche painting"],
                            ["HAER bridge construction", "building"]],
  "the dark and the lamp": [["candle still life painting"], ["night watchman painting"], ["HABS lantern room", "building"], ["iron candlestick", "object"], ["lit window night painting"], ["reading by lamplight painting"], ["lamplight night interior painting"], ["candlelight painting"],
                            ["night study lamp painting"], ["nocturne interior painting"],
                            ["oil lamp Metropolitan Museum", "object"]],
  "the plain thing": [["wooden bowl painting"], ["egg still life painting"], ["shaker box", "object"], ["wooden bench", "object"], ["hand tool plane", "object"], ["single flower vase painting"], ["kettle hearth painting"], ["still life single object painting"], ["kitchen still life"],
                            ["bread still life painting"], ["earthenware jug painting"],
                            ["shaker furniture chair", "object"],
                            ["bauhaus teapot design", "object"],
                            ["dieter rams braun", "object"]],
  "vastness": [["arctic ice painting"], ["canyon painting"], ["star field painting"], ["HABS observatory", "building"], ["aurora painting"], ["desert dunes painting"], ["deep sea waves painting"], ["mountain vista painting"], ["night sky landscape painting"],
                            ["vast plain painting"], ["sea horizon painting"],
                            ["HABS lighthouse", "building"]],
  "weight and grace": [["ballet rehearsal painting"], ["horse leaping painting"], ["HABS suspension bridge cable", "building"], ["glider aircraft", "object"], ["diver painting"], ["swans painting"], ["dancer painting"], ["falling figure painting"],
                            ["acrobat painting"], ["figure in motion painting"],
                            ["HABS spiral staircase", "building"],
                            ["calder mobile", "object"]],
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

// Aim where paintings are scarce, not where marks are.
//
// A weather's mark count includes its quotes, poems and songs, so it says
// nothing about the thing this harvester actually brings back. The vault
// holds exactly one painting per weather, and /today casts a painting as the
// whole sky: nerve makes four days out of one Turner, and a reader gets the
// same sky four days running. So the order is paintings first, and among
// weathers equally thin, the one making the most days goes first — that is
// where the repetition is visible.
const map = JSON.parse(readFileSync("src/data/map.json", "utf8"));
const paintingsPer = {};
for (const f of readdirSync("vault/paintings")) {
  if (!f.endsWith(".md")) continue;
  const m = /^weather:\s*(.+)$/m.exec(readFileSync(join("vault/paintings", f), "utf8"));
  if (m) paintingsPer[m[1].trim()] = (paintingsPer[m[1].trim()] || 0) + 1;
}
const daysPer = {};
try {
  for (const c of JSON.parse(readFileSync("src/data/today.json", "utf8")).chords || []) {
    daysPer[c.weather] = (daysPer[c.weather] || 0) + 1;
  }
} catch {}
const order = map.weathers.slice().sort((a, b) =>
  (paintingsPer[a.name] || 0) - (paintingsPer[b.name] || 0) ||
  (daysPer[b.name] || 0) - (daysPer[a.name] || 0) ||
  a.count - b.count,
).map((w) => w.name);
console.log("aiming, thinnest in paintings first:");
for (const w of order) {
  console.log(`  ${w.padEnd(22)} ${paintingsPer[w] || 0} painting(s), ${daysPer[w] || 0} day(s)`);
}
console.log("");

const found = [];
for (const weather of order) {
  if (found.length >= WANT) break;
  for (const [term, kind = "painting"] of TERMS[weather] || []) {
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
      const title = ((v) => v.replace(/([a-z])([A-Z])/g, "$1 $2"))(  // "DarkCorridor"
        cleanField(md.ObjectName?.value || p.title.replace(/^File:|\.\w+$/g, ""))).slice(0, 80);
      const cats = (p.categories || []).map((c) => c.title.toLowerCase()).join(" ");
      let who = attribution(md.Artist?.value);
      // For an object or a building the Commons "artist" is very often the
      // camera, not the hand: the file sits in a "photographs by X" category
      // and X is credited as author. A chair by Daderot is a false claim,
      // and every claim here must be traceable — so when the credited name
      // is the photographer, the card carries the maker or nobody.
      if (kind !== "painting" && who) {
        const wl = who.toLowerCase();
        if (cats.includes(`by ${wl}`) || /^related names|^unknown|^anonymous unknown/i.test(who)) who = "";
      }
      if (/^related names/i.test(who)) who = "";

      // A painting search must return a painting; an object or building
      // search only has to return a photograph of a real thing. Satellite
      // shots and posters are bad candidates for anything.
      if (kind === "painting") {
        const painted = /painting|oil on|watercolou?r|tempera|panel|canvas/.test(cats + " " + cleanField(md.ObjectName?.value));
        if (!painted) continue;
      }
      if (/nasa|photograph|satellite/i.test(who + " " + cats)) continue;
      // A wartime poster is a fine object and a bad candidate; so is anything
      // whose title is a catalogue code ("INF3-328 Unity of Strength").
      if (/poster|propaganda|advertis|postcard/i.test(cats)) continue;
      if (/^[A-Z]{2,}[\d-]/.test(title)) continue;
      if (title.length < 3) continue;
      if (kind === "painting" && !who) continue;   // an unattributed painting is not ours to offer
      if (known.has(title.toLowerCase()) || known.has((ii.descriptionurl || "").toLowerCase())) continue;
      if ((ii.width || 0) < 1200) continue;  // sharpness is not negotiable here
      known.add(title.toLowerCase());
      found.push({
        // a fully CJK title slugs to nothing under [^\w], and an empty id
        // collides in the verdicts; the commons filename always has ascii
        id: (title.toLowerCase().replace(/[^\w]+/g, "-").replace(/^-|-$/g, "").slice(0, 48)
             || (ii.descriptionurl || "").split("File:").pop().toLowerCase()
                  .replace(/[^\w]+/g, "-").replace(/^-|-$/g, "").slice(0, 48)
             || "untitled-" + Math.abs([...(p.title || "x")].reduce((h, ch) => (h * 31 + ch.codePointAt(0)) | 0, 7)).toString(36)),
        type: kind, who, title,
        year: year(md.DateTimeOriginal?.value),
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
