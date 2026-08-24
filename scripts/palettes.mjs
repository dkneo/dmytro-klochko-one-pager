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
import { readFileSync, writeFileSync } from "node:fs";
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

const today = JSON.parse(readFileSync("src/data/today.json", "utf8"));
const seen = new Map();
for (const c of today.chords) {
  if (!seen.has(c.painting.src)) {
    seen.set(c.painting.src, { weather: c.weather, who: c.painting.who, title: c.painting.title });
  }
}

const out = [];
for (const [src, meta] of seen) {
  const stops = await palette("public" + src);
  out.push({ ...meta, src, stops });
  console.log(`${meta.weather.padEnd(22)} ${stops.join(" ")}  ${meta.who}`);
}

if (apply) {
  writeFileSync("src/data/palettes.json", JSON.stringify({ built: "palettes.mjs", palettes: out }, null, 1));
  console.log(`\nwrote src/data/palettes.json — ${out.length} palettes, five stops each`);
} else {
  console.log("\nnothing written. run with --apply.");
}
