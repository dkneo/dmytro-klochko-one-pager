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
    if (!x.weather) throw new Error(`${x.file}: no weather`);
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

writeFileSync(OUT, JSON.stringify({
  _doc: "Generated from vault/ by scripts/vault-build.mjs. Do not edit by hand: edit the markdown and rebuild.",
  built: "vault",
  weathers: weathers.map((w) => ({ name: w.name, note: w.text })),
  chords,
}, null, 2) + "\n");

console.log(
  `vault → ${chords.length} chords from ${quotes.length} quotes, ${poems.length} poems, ` +
  `${paintings.length} paintings, ${songs.length} songs across ${names.length} weathers`
);
if (skipped.length) console.log("  incomplete, not shipped:", skipped.join(", "));
