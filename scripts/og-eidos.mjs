// The library's share card. Composed from the same data as the page: the
// eight weathers as bars of their own paint, sized by how much each holds,
// and a row of plates. Nothing is drawn by hand; nothing is generated art.
//
//   node scripts/og-eidos.mjs      → public/og-eidos.png (1200x628)
import { readFileSync } from "node:fs";
import sharp from "sharp";

const map = JSON.parse(readFileSync("src/data/map.json", "utf8"));
const pal = JSON.parse(readFileSync("src/data/palettes.json", "utf8"));
const HANGS = new Set(["painting", "object", "building", "poster"]);
const shelved = map.items.filter((i) => i.type !== "link");
const W = 1200, H = 628, PAD = 64;

const weathers = map.weathers.slice().sort((a, b) => a.x - b.x).map((w) => ({
  n: shelved.filter((i) => i.weather === w.name).length,
  stops: (pal.palettes.find((p) => p.weather === w.name) || { stops: ["#444"] }).stops,
}));
const total = weathers.reduce((s, w) => s + Math.max(w.n, 1), 0);

// the strip, as an svg of gradient bars
const stripW = W - PAD * 2, stripY = 320, stripH = 22, gap = 4;
let x = PAD;
const bars = weathers.map((w, i) => {
  const bw = (stripW - gap * (weathers.length - 1)) * (Math.max(w.n, 1) / total);
  const stopsSvg = w.stops.map((c, k) => `<stop offset="${(k / (w.stops.length - 1)) * 100}%" stop-color="${c}"/>`).join("");
  const rect = `<rect x="${x.toFixed(1)}" y="${stripY}" width="${bw.toFixed(1)}" height="${stripH}" rx="2" fill="url(#g${i})"/>`;
  x += bw + gap;
  return { defs: `<linearGradient id="g${i}" x1="0" x2="1">${stopsSvg}</linearGradient>`, rect };
});

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
const text = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>${bars.map((b) => b.defs).join("")}</defs>
  <rect width="${W}" height="${H}" fill="#262b44"/>
  <text x="${PAD}" y="150" font-family="Zodiak, Newsreader, 'Iowan Old Style', Georgia, serif" font-size="120" font-style="italic" font-weight="300" fill="#ece6d9">eidos</text>
  <text x="${PAD}" y="215" font-family="Newsreader, 'Iowan Old Style', Georgia, serif" font-size="34" fill="#a9aecb">what dmytro klochko loves</text>
  <text x="${PAD}" y="262" font-family="ui-monospace, Menlo, monospace" font-size="17" letter-spacing="2" fill="#a9aecb">${esc(shelved.length)} REAL THINGS · EIGHT WEATHERS · EVERY ONE ATTRIBUTED</text>
  ${bars.map((b) => b.rect).join("")}
  <text x="${PAD}" y="${stripY + stripH + 30}" font-family="ui-monospace, Menlo, monospace" font-size="14" letter-spacing="2" fill="#7f86a8">COLD</text>
  <text x="${W - PAD}" y="${stripY + stripH + 30}" text-anchor="end" font-family="ui-monospace, Menlo, monospace" font-size="14" letter-spacing="2" fill="#7f86a8">WARM</text>
</svg>`;

// a row of plates along the bottom: his own first, then whoever recurs
const art = shelved.filter((i) => HANGS.has(i.type) && i.src);
const own = art.filter((i) => /^dmytro klochko$/i.test(i.who));
const others = art.filter((i) => !/^dmytro klochko$/i.test(i.who));
const picks = [...own.slice(0, 3), ...others.slice(0, 12)].slice(0, 12);
const plateFor = (src) => "public" + src.replace("/images/", "/images/plates/").replace(/\.[^.]+$/, ".webp");
const rowY = 404, rowH = 118;
let px = PAD;
const composites = [];
for (const p of picks) {
  try {
    const m = await sharp(plateFor(p.src)).metadata();
    const w = Math.round((m.width / m.height) * rowH);
    if (px + w > W - PAD) break;
    const buf = await sharp(plateFor(p.src)).resize({ height: rowH }).png().toBuffer();
    composites.push({ input: buf, left: px, top: rowY });
    px += w + 10;
  } catch {}
}

await sharp(Buffer.from(text)).png()
  .composite(composites)
  .png({ compressionLevel: 9 })
  .toFile("public/og-eidos.png");
const out = await sharp("public/og-eidos.png").metadata();
console.log(`og-eidos.png ${out.width}x${out.height}, ${composites.length} plates, ${weathers.length} weathers`);
