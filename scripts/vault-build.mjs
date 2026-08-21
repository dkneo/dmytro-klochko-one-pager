// The vault is the source of truth; this turns it into the one file the site
// reads. Runs before every build.
//
//   node scripts/vault-build.mjs
//
// A chord is a weather with at least one quote, one poem and one painting in
// it. Where a weather holds several of a slot, the lists are cycled, so five
// quotes and two paintings under one weather make five days rather than one.
// That is how the vault grows into the calendar without anyone rewriting it.

import { readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, basename } from "node:path";

const VAULT = "vault";
const OUT = "src/data/today.json";

// Enough YAML for the shapes we write: scalars, quoted scalars, and |- blocks.
// A real parser would be a dependency for four rules we control ourselves.
function frontmatter(text, file) {
  if (!text.startsWith("---")) throw new Error(`${file}: no frontmatter`);
  const end = text.indexOf("\n---", 3);
  if (end === -1) throw new Error(`${file}: unterminated frontmatter`);
  const head = text.slice(4, end).split("\n");
  const body = text.slice(end + 4).replace(/^\n+/, "").trimEnd();
  const out = {};
  for (let i = 0; i < head.length; i++) {
    const line = head[i];
    const m = /^([A-Za-z_][\w-]*):\s*(.*)$/.exec(line);
    if (!m) continue;
    const [, key, raw] = m;
    if (raw === "|-" || raw === "|") {
      const lines = [];
      while (i + 1 < head.length && /^\s{2,}/.test(head[i + 1])) lines.push(head[++i].slice(2));
      out[key] = lines.join("\n").trimEnd();
    } else if (raw.startsWith('"') && raw.endsWith('"')) {
      out[key] = raw.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, "\\");
    } else {
      out[key] = raw;
    }
  }
  return { data: out, body };
}

// The wikilink trail at the foot of each note is for Obsidian's graph, not for
// the page, so it comes off before the text is used.
const unplaced = [];
const strip = (body) => body.replace(/\n*^weather:.*$/m, "").trimEnd();

function load(kind) {
  const dir = join(VAULT, kind);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const { data, body } = frontmatter(readFileSync(join(dir, f), "utf8"), f);
      return { ...data, text: strip(body), file: basename(f, ".md") };
    });
}

const quotes = load("quotes");
const poems = load("poems");
const paintings = load("paintings");
const songs = load("songs");
const weathers = load("weathers");

const byWeather = (list) => {
  const m = new Map();
  for (const x of list) {
    // A note with no weather is not a mistake any more: /eidos keeps those on
    // its ring until he says how they feel. They cannot form a chord, so they
    // sit this build out and get counted at the end.
    if (!x.weather) { unplaced.push(x.file); continue; }
    if (!m.has(x.weather)) m.set(x.weather, []);
    m.get(x.weather).push(x);
  }
  return m;
};

const Q = byWeather(quotes), P = byWeather(poems), A = byWeather(paintings), S = byWeather(songs);
const names = [...new Set([...Q.keys(), ...P.keys(), ...A.keys()])].sort();

const chords = [];
const skipped = [];
for (const w of names) {
  const q = Q.get(w) || [], p = P.get(w) || [], a = A.get(w) || [], so = S.get(w) || [];
  if (!q.length || !p.length || !a.length) {
    skipped.push(`${w} (${q.length}q ${p.length}p ${a.length}a)`);
    continue;
  }
  const n = Math.max(q.length, p.length, a.length);
  for (let i = 0; i < n; i++) {
    const qi = q[i % q.length], pi = p[i % p.length], ai = a[i % a.length];
    // A song is optional: a weather without one still makes a day.
    const si = so.length ? so[i % so.length] : null;
    chords.push({
      id: `${w.replace(/\s+/g, "-")}-${i}`,
      weather: w,
      quote: {
        text: qi.text,
        english: qi.english || qi.text,
        who: qi.who,
        where: qi.where,
      },
      poem: {
        text: pi.text,
        ...(pi.roman ? { roman: pi.roman } : {}),
        ...(pi.english ? { english: pi.english } : {}),
        who: pi.who,
        where: pi.where,
        ...(pi.note ? { note: pi.note } : {}),
        ...(pi.translator ? { translator: pi.translator } : {}),
        // A poem can point at something longer about its poet.
        ...(pi.more ? { more: pi.more, moreLabel: pi.more_label || "read more" } : {}),
      },
      painting: {
        src: ai.src,
        who: ai.who,
        title: ai.title,
        year: ai.year,
        where: ai.collection,
        source: ai.source,
        licence: ai.licence,
        ...(ai.note ? { note: ai.note } : {}),
      },
      ...(si ? {
        song: {
          who: si.who,
          title: si.title,
          year: si.year,
          youtube: si.youtube,
          spotify: si.spotify,
          ...(si.note ? { note: si.note } : {}),
        },
      } : {}),
    });
  }
}

if (!chords.length) throw new Error("the vault produced no chords");

// Every painting a chord names has to exist, or the page ships a hole.
for (const c of chords) {
  if (!existsSync(join("public", c.painting.src))) {
    throw new Error(`${c.id}: missing painting ${c.painting.src}`);
  }
}

// No unattributed translation ships. A poem carrying an english line that is
// not its original must name who made that english: a translator and a volume
// where one exists, or the explicit admission that it is ours. This is a build
// failure rather than a note to self, because "we will remember to check" is
// how machine translation ends up on a page under someone's own name.
for (const p of poems) {
  const translated = p.english && p.english.trim() !== p.text.trim();
  if (translated && !p.translator) {
    throw new Error(
      `${p.file}: has an english translation with no translator. ` +
      `Name the translator and the volume, or say it is ours.`
    );
  }
}


// ── the sky gate ─────────────────────────────────────────────────────────────
//
// On /today the chord's painting is the sky behind the whole page, seen
// through the site's smoked glass (brightness 0.32 + the scrim). Paintings
// are not equally dark: Turner's sunrise through the same glass is still
// bright enough to sink the secondary ink below the 4.5:1 floor.
//
// So the build measures each painting the way the browser will composite it,
// and computes the smallest extra dim (an overlay the page applies per
// painting) that puts the worst pixel back over the floor. A painting that
// cannot get there even at 0.6 extra fails the build: better no sky than an
// unreadable page.
import sharp from "sharp";

const GLASS = 0.32;                       // body::before brightness
const SCRIM = { a: 0.24, r: 24, g: 28, b: 46 };
const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
const lum = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const INK_DIM = lum(0xa9, 0xae, 0xcb);    // --dim, the weakest ink in use
const SCRIM_L = lum(SCRIM.r, SCRIM.g, SCRIM.b);
const FLOOR = 4.6;                        // 4.5 plus margin for jpeg/webp drift

async function skyDim(file) {
  const { data, info } = await sharp(file)
    .resize(160, 160, { fit: "fill" })
    .raw().toBuffer({ resolveWithObject: true });
  const L = [];
  for (let i = 0; i < data.length; i += info.channels) {
    // the browser's pipeline: brightness() scales channels, then the scrim
    // composites over the result. computed per pixel, worst-case kept.
    const r = data[i] * GLASS, g = data[i + 1] * GLASS, b = data[i + 2] * GLASS;
    L.push(lum(
      r * (1 - SCRIM.a) + SCRIM.r * SCRIM.a,
      g * (1 - SCRIM.a) + SCRIM.g * SCRIM.a,
      b * (1 - SCRIM.a) + SCRIM.b * SCRIM.a,
    ));
  }
  L.sort((a, b) => a - b);
  const p99 = L[Math.floor(0.99 * (L.length - 1))];
  // extra dim multiplies the composited pixel toward black
  for (let extra = 0; extra <= 0.61; extra += 0.02) {
    const worst = p99 * (1 - extra);
    if ((INK_DIM + 0.05) / (worst + 0.05) >= FLOOR) return { extra: +extra.toFixed(2), p99: +p99.toFixed(4) };
  }
  return null;
}

for (const c of chords) {
  const gate = await skyDim(join("public", c.painting.src));
  if (!gate) {
    throw new Error(`${c.id}: ${c.painting.src} stays too bright for the sky even at maximum dim. ` +
      `The page would be unreadable over it; darken the image or drop it from /today.`);
  }
  c.painting.skyDim = gate.extra;
}

// ── per-day payloads ─────────────────────────────────────────────────────────
//
// /today used to inline all chords (121kb of html for one visible day). Now
// the page ships a manifest and fetches the day it needs.
import { mkdirSync } from "node:fs";
mkdirSync("public/today-data", { recursive: true });
for (const c of chords) {
  writeFileSync(join("public/today-data", c.id + ".json"), JSON.stringify(c));
}
writeFileSync("public/today-data/manifest.json", JSON.stringify({
  built: "vault",
  weathers: weathers.map((w) => ({ name: w.name, note: w.text })),
  days: chords.map((c) => ({
    id: c.id,
    weather: c.weather,
    who: c.painting.who,
    title: c.painting.title,
    thumb: "/images/thumbs" + c.painting.src.replace("/images", "").replace(/\.[^.]+$/, ".webp"),
    skyDim: c.painting.skyDim,
    src: c.painting.src,
  })),
}));

writeFileSync(OUT, JSON.stringify({
  _doc: "Generated from vault/ by scripts/vault-build.mjs. Do not edit by hand: edit the markdown and rebuild.",
  built: "vault",
  weathers: weathers.map((w) => ({ name: w.name, note: w.text })),
  chords,
}, null, 2) + "\n");

console.log(
  `vault → ${chords.length} chords from ${quotes.length} quotes, ${poems.length} poems, ` +
  `${paintings.length} paintings, ${songs.length} songs across ${names.length} weathers` +
  (unplaced.length ? `, ${unplaced.length} unplaced and waiting on the ring` : "")
);
if (skipped.length) console.log("  incomplete, not shipped:", skipped.join(", "));
