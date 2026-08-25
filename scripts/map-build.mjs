// The taste map, compiled from the vault.
//
// Every mark on the map is a real note. Nothing here is generated art: the
// paintings appear as their own images, the poems and quotes as their own
// words. What the build adds is position, and position comes from the
// weathers, which are his.
//
// The two axes are read out of his own descriptions of the eight weathers,
// written down here so they can be argued with rather than hidden in a
// layout function:
//
//   x  temperature   "winter light, precision"      cold
//                    "heat held against the dark"   warm
//   y  attention     "one object, looked at"        near
//                    "the scale that puts you in    far
//                     your place"
//
// He can move any of these; they are data, not geometry.
import { readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const PLACE = {
  "cold clarity":         { x: -0.90, y: -0.40, why: "winter light and precision, aimed at something small" },
  "the plain thing":      { x: -0.10, y: -0.92, why: "one object, looked at until it stops being ordinary" },
  "the dark and the lamp":{ x:  0.14, y: -0.62, why: "one light on, company at a distance" },
  "nerve":                { x:  0.90, y: -0.12, why: "ambition with its nerve showing, and the cost of it" },
  "invincible summer":    { x:  0.78, y:  0.34, why: "heat held against the dark" },
  "weight and grace":     { x:  0.22, y:  0.20, why: "gravity, falling, and being held anyway" },
  "dissolution":          { x: -0.48, y:  0.52, why: "edges going, fog, the moment a shape stops being one" },
  "vastness":             { x: -0.30, y:  0.95, why: "the scale that puts you in your place" },
};

function frontmatter(text) {
  if (!text.startsWith("---")) return [{}, text];
  const end = text.indexOf("\n---", 3);
  const head = text.slice(4, end).split("\n");
  const body = text.slice(end + 4).trim();
  const o = {};
  for (let i = 0; i < head.length; i++) {
    const m = /^([A-Za-z_][\w-]*):\s*(.*)$/.exec(head[i]);
    if (!m) continue;
    if (m[2] === "|-" || m[2] === "|") {
      const ls = [];
      while (i + 1 < head.length && /^\s{2,}/.test(head[i + 1])) ls.push(head[++i].slice(2));
      o[m[1]] = ls.join("\n").trim();
    } else {
      o[m[1]] = m[2].replace(/^"|"$/g, "").trim();
    }
  }
  return [o, body];
}

// A stable scatter inside a weather, so a note keeps its place between builds
// and the map does not reshuffle itself every time he adds something.
function jitter(seed, i) {
  let h = 2166136261;
  for (const ch of seed) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
  const a = ((h >>> 0) % 1000) / 1000;
  const r = Math.min(0.185, 0.055 + 0.062 * Math.sqrt(i));
  const ang = i * 2.39996 + a * 0.9;          // golden angle, nudged per note
  return { dx: Math.cos(ang) * r, dy: Math.sin(ang) * r * 0.86 };
}

const items = [];
const perWeather = {};

for (const kind of ["paintings", "objects", "buildings", "poems", "songs", "quotes", "links", "people", "writing"]) {
  const dir = join("vault", kind);
  if (!existsSync(dir)) continue;
  const files = readdirSync(dir).filter((f) => f.endsWith(".md") && !f.startsWith("_"));
  files.forEach((file) => {
    const [fm, body] = frontmatter(readFileSync(join(dir, file), "utf8"));
    const weather = (fm.weather || "").trim();
    const seat = PLACE[weather];
    const i = (perWeather[weather] = (perWeather[weather] || 0) + 1) - 1;
    const j = jitter(file, i);

    // The line that stands for the work when it has no picture.
    let line = "";
    // Whole, not the first line. A haiku is three lines and this kept one of
    // them, so the library printed "even the horse" and threw the snow and
    // the morning road away. The vault only holds short poems by rule, and
    // the tooltip on the sketch clamps what it shows.
    if (fm.type === "poem") {
      line = (fm.english || body)
        .split("\n")
        .filter((l) => !/^\s*(weather:|who:|!\[\[)/.test(l))
        .join("\n")
        .trim();
    }
    else if (fm.type === "quote") line = body.split("\n").find((l) => l.trim() && !l.startsWith("weather:")) || "";
    else if (fm.type === "person") line = fm.name || "";
    else line = fm.title || "";

    // Notes with no weather are not hidden and not guessed at. They ride an
    // outer ring, visibly outside the map, which is the whole nudge: the ring
    // is a list of things he has taken in but never said how they felt.
    const ring = !seat;
    const ringAngle = ring ? items.filter((z) => z.unplaced).length : 0;

    items.push({
      id: file.replace(/\.md$/, ""),
      type: fm.type || kind.replace(/s$/, ""),
      who: fm.who || fm.name || "",
      title: fm.title || "",
      // Not truncated. A mark on the map was a dot with a tooltip, so 120
      // characters was harmless; the library reads these lines aloud, and a
      // quote cut mid-sentence is a misquote. The tooltip clamps in css.
      line: line.replace(/^["“]|["”]$/g, ""),
      year: fm.year || "",
      where: fm.where || "",
      weather,
      src: fm.src || "",
      url: fm.url || "",
      note: fm.note || "",
      added: fm.added || "",
      // where it sits, and how sure that is
      x: seat ? +(seat.x + j.dx).toFixed(4) : ringAngle,   // index for now
      y: seat ? +(seat.y + j.dy).toFixed(4) : ringAngle,   // resolved below
      ringIndex: ring ? ringAngle : -1,
      unplaced: ring,
    });
  });
}

// The ring can only be laid out once its size is known, so it happens here
// rather than per note: evenly spaced, so twenty nine sit as comfortably as
// three did.
const ringTotal = items.filter((i) => i.unplaced).length;
items.filter((i) => i.unplaced).forEach((it) => {
  const a = (it.ringIndex / ringTotal) * Math.PI * 2 - Math.PI / 2;
  it.x = +(Math.cos(a) * 1.06).toFixed(4);
  it.y = +(Math.sin(a) * 1.06).toFixed(4);
  delete it.ringIndex;
});
items.filter((i) => !i.unplaced).forEach((it) => delete it.ringIndex);

// Real relationships only: two works are joined when the same person made
// both, or when they share a weather. Nothing is joined by resemblance,
// because nothing here has measured resemblance yet.
const byWho = {};
for (const it of items) if (it.who) (byWho[it.who] ||= []).push(it.id);
// His own name is not a thread. Every mark here is his in some sense, so a
// line saying "you made both of these" carries no information and costs
// eleven strokes across the ring.
const threads = Object.entries(byWho)
  .filter(([who]) => !/^dmytro klochko$/i.test(who.trim()))
  .filter(([, ids]) => ids.length > 1)
  .map(([who, ids]) => ({ who, ids }));

const weathers = Object.entries(PLACE).map(([name, p]) => ({
  name, x: p.x, y: p.y, why: p.why,
  count: items.filter((i) => i.weather === name).length,
  forms: ["painting", "poem", "song", "quote"].map((f) => ({
    form: f, n: items.filter((i) => i.weather === name && i.type === f).length,
  })),
}));

const out = {
  built: process.env.MAP_DATE || new Date().toISOString().slice(0, 10),
  axes: {
    x: { from: "cold", to: "warm", read: "temperature, as his weather notes describe it" },
    y: { from: "one thing", to: "everything", read: "the scale the work asks you to look at" },
  },
  items,
  weathers,
  threads,
  unplaced: items.filter((i) => i.unplaced).length,
  forms: ["painting", "poem", "song", "quote", "link", "person", "writing"].map((f) => ({
    form: f, n: items.filter((i) => i.type === f).length,
  })),
  people: Object.entries(byWho)
    .map(([who, ids]) => ({ who, n: ids.length }))
    .sort((a, b) => b.n - a.n || a.who.localeCompare(b.who)),
  depth: {
    // Honest measure of how much of a map this is yet.
    notes: items.length,
    people: Object.keys(byWho).length,
    thinnest: weathers.slice().sort((a, b) => a.count - b.count)[0]?.name || "",
    oneDeep: weathers.filter((w) => w.forms.every((f) => f.n <= 1)).length,
  },
};

writeFileSync("src/data/map.json", JSON.stringify(out, null, 1));
// the worker answers questions from this copy, so it ships as an asset too
writeFileSync("public/map.json", JSON.stringify(out));
console.log(`map → ${items.length} marks, ${weathers.length} weathers, ${threads.length} threads, ${out.depth.people} people`);
