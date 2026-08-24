// Palettes, sampled from real paint.
//
// The poem instrument never invents a colour. Its whole range comes from the
// eight paintings that carry the weathers on /today, so a reading can look
// like Turner's storm or Hammershøi's winter and can never look like a
// default gradient. Five stops per painting, ordered dark to light, found by
// k-means over the pixels rather than picked by eye.
//
//   node scripts/palettes.mjs            print them
//   node scripts/palettes.mjs --apply    write src/data/palettes.json
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const apply = process.argv.includes("--apply");
const K = 5;
const N = 96;               // sample grid; plenty for a palette, fast

const lum = (c) => 0.299 * c[0] + 0.587 * c[1] + 0.714 * c[2] / 1.4;
const dist2 = (a, b) => (a[0]-b[0])**2 + (a[1]-b[1])**2 + (a[2]-b[2])**2;
const hex = (c) => "#" + c.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");

async function palette(file) {
  const { data, info } = await sharp(file)
    .resize(N, N, { fit: "fill" }).removeAlpha().raw()
    .toBuffer({ resolveWithObject: true });
  const px = [];
  for (let i = 0; i < data.length; i += info.channels) {
    px.push([data[i], data[i + 1], data[i + 2]]);
  }
  // k-means++ style seeding, deterministic: spread the first centres by
  // distance so two runs on the same painting agree.
  const centres = [px[0]];
  while (centres.length < K) {
    let best = null, bestD = -1;
    for (const p of px) {
      const d = Math.min(...centres.map((c) => dist2(p, c)));
      if (d > bestD) { bestD = d; best = p; }
    }
    centres.push(best.slice());
  }
  for (let step = 0; step < 24; step++) {
    const sums = centres.map(() => [0, 0, 0, 0]);
    for (const p of px) {
      let bi = 0, bd = Infinity;
      for (let i = 0; i < centres.length; i++) {
        const d = dist2(p, centres[i]);
        if (d < bd) { bd = d; bi = i; }
      }
      sums[bi][0] += p[0]; sums[bi][1] += p[1]; sums[bi][2] += p[2]; sums[bi][3]++;
    }
    for (let i = 0; i < centres.length; i++) {
      if (sums[i][3]) centres[i] = [sums[i][0] / sums[i][3], sums[i][1] / sums[i][3], sums[i][2] / sums[i][3]];
    }
  }
  return centres.sort((a, b) => lum(a) - lum(b)).map(hex);
}

// How each painter's paint behaves, which is not the same as what colour it
// is. Turner has no edges and endless glaze; af Klint draws hard geometry;
// Hammershøi holds still; Monet is all broken stroke. The knobs stay the
// reading — this is only the hand holding the brush.
const MANNER = {
  "J. M. W. Turner":              { edge: 0.10, band: 0.05, grain: 0.30, glaze: 0.92, calm: 0.35 },
  "Claude Monet":                 { edge: 0.28, band: 0.10, grain: 0.80, glaze: 0.55, calm: 0.40 },
  "Vilhelm Hammershøi":           { edge: 0.45, band: 0.55, grain: 0.12, glaze: 0.25, calm: 0.92 },
  "Hilma af Klint":               { edge: 0.90, band: 0.88, grain: 0.15, glaze: 0.30, calm: 0.55 },
  "Caspar David Friedrich":       { edge: 0.22, band: 0.20, grain: 0.25, glaze: 0.70, calm: 0.75 },
  "James McNeill Whistler":       { edge: 0.15, band: 0.12, grain: 0.35, glaze: 0.60, calm: 0.88 },
  "Jean-Baptiste-Siméon Chardin": { edge: 0.55, band: 0.18, grain: 0.45, glaze: 0.22, calm: 0.80 },
  // his own: painterly, warm, unhurried
  "Dmytro Klochko":               { edge: 0.35, band: 0.22, grain: 0.55, glaze: 0.65, calm: 0.62 },
};
const DEFAULT_MANNER = { edge: 0.4, band: 0.3, grain: 0.4, glaze: 0.5, calm: 0.6 };

// Every painting in the vault, his own among them and first: the site's
// oldest rule is that his art is the art.
const seen = new Map();
for (const f of readdirSync("vault/paintings")) {
  if (!f.endsWith(".md")) continue;
  const text = readFileSync(join("vault/paintings", f), "utf8");
  const get = (k) => (new RegExp(`^${k}:\\s*(.+)$`, "m").exec(text) || [])[1]?.trim().replace(/^"|"$/g, "");
  const src = get("src");
  if (!src || !existsSync("public" + src) || seen.has(src)) continue;
  seen.set(src, { weather: get("weather") || "", who: get("who") || "", title: get("title") || "" });
}

const out = [];
for (const [src, meta] of seen) {
  const stops = await palette("public" + src);
  const manner = MANNER[meta.who] || DEFAULT_MANNER;
  out.push({ ...meta, src, stops, manner });
  const label = (meta.weather || meta.title).padEnd(22);
  console.log(`${label} ${stops.join(" ")}  ${meta.who}`);
}

if (apply) {
  writeFileSync("src/data/palettes.json", JSON.stringify({ built: "palettes.mjs", palettes: out }, null, 1));
  console.log(`\nwrote src/data/palettes.json — ${out.length} palettes, five stops each`);
} else {
  console.log("\nnothing written. run with --apply.");
}
