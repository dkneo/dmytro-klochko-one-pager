// The share image for /eidos, drawn from the vault at build time.
//
// A static card lied within a day: it said 65 things while the library held
// 98. This one is composed from map.json and palettes.json — the same numbers
// the portrait on the page computes — so the card and the page can never
// disagree. Rasterised with sharp; system serif, because librsvg cannot load
// the site's woff2 and a card is read at a glance, not set.
//
//   node scripts/og-eidos-build.mjs        writes public/og-eidos.png
import { readFileSync, writeFileSync } from "node:fs";
import sharp from "sharp";

const W = 1200, H = 628;
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const lower = (s) => String(s).toLowerCase();
const list = (xs) => xs.length <= 1 ? xs.join("") : xs.slice(0, -1).join(", ") + " and " + xs[xs.length - 1];

export function compose(map, palettes) {
  const HANGS = new Set(["painting", "object", "building", "poster", "print", "photograph"]);
  const shelved = map.items.filter((i) => i.type !== "link");
  const isHim = (who) => /^dmytro klochko$/i.test((who || "").trim());
  const weathers = map.weathers.slice().sort((a, b) => a.x - b.x).map((w) => ({
    name: w.name, n: shelved.filter((i) => i.weather === w.name).length,
    stops: (palettes.palettes.find((p) => p.weather === w.name) || { stops: ["#888"] }).stops,
  }));
  const total = shelved.length;
  const art = shelved.filter((i) => HANGS.has(i.type));
  const own = art.filter((i) => isHim(i.who));
  const makers = new Map();
  for (const i of shelved) if (i.who && !isHim(i.who)) makers.set(i.who, (makers.get(i.who) || 0) + 1);
  const recurring = [...makers].filter(([, n]) => n > 1).sort((a, b) => b[1] - a[1]).map(([w]) => w);
  const painters = recurring.filter((w) => art.some((i) => i.who === w)).slice(0, 3);
  const writers = recurring.filter((w) => !art.some((i) => i.who === w)).slice(0, 3);
  const tongues = new Set(shelved.map((i) => i.lang).filter(Boolean)).size;
  const byFull = weathers.slice().sort((a, b) => b.n - a.n);

  const line1 = `${total} real things i love, filed under eight weathers i made up.`;
  const line2 = `${byFull[0].name} is the fullest room, ${byFull[byFull.length - 1].name} the thinnest.`;
  const line3 = own.length
    ? `${own.length} of the ${art.length} pictures are mine; the rest lean to ${list(painters.map(lower))}.`
    : `${art.length} pictures, leaning to ${list(painters.map(lower))}.`;
  const line4 = writers.length
    ? `the words keep coming back to ${list(writers.map(lower))}, in ${tongues} languages.`
    : `the words come in ${tongues} languages.`;
  const wrap = (t, n = 66) => { const out = []; let cur = ""; for (const w of t.split(" ")) { if ((cur + " " + w).trim().length > n) { out.push(cur.trim()); cur = w; } else cur += " " + w; } if (cur.trim()) out.push(cur.trim()); return out; };
  const lines = [line1, line2, line3, line4].flatMap((l) => wrap(l)).slice(0, 7);

  // the strip: eight bars, each as wide as it is full, wearing its own paint
  const filed = weathers.reduce((s, w) => s + w.n, 0) || 1;
  const stripX = 72, stripW = W - 144, stripY = 430, stripH = 26, gap = 6;
  let x = stripX;
  const defs = [], bars = [], labels = [];
  weathers.forEach((w, k) => {
    const bw = Math.max(10, (stripW - gap * (weathers.length - 1)) * (w.n / filed));
    defs.push(`<linearGradient id="g${k}" x1="0" x2="1">${w.stops.map((c, i) => `<stop offset="${(i / Math.max(1, w.stops.length - 1)).toFixed(2)}" stop-color="${c}"/>`).join("")}</linearGradient>`);
    bars.push(`<rect x="${x.toFixed(1)}" y="${stripY}" width="${bw.toFixed(1)}" height="${stripH}" rx="3" fill="url(#g${k})"/>`);
    const label = `${w.name} ${w.n}`;
    if (bw > label.length * 7.6) labels.push(`<text x="${(x + 2).toFixed(1)}" y="${stripY + stripH + 22}" font-family="Menlo, Consolas, monospace" font-size="12" letter-spacing="1" fill="#9aa0b4">${esc(label)}</text>`);
    x += bw + gap;
  });
  const shown = [];
  const half = Math.ceil(weathers.length / 2);
  const row = (ws) => esc(ws.map((w) => `${w.name} ${w.n}`).join("   ·   "));
  const legend = `<text x="72" y="${stripY + stripH + 24}" font-family="Menlo, Consolas, monospace" font-size="12" letter-spacing="1" fill="#9aa0b4">${row(weathers.slice(0, half))}</text>
  <text x="72" y="${stripY + stripH + 46}" font-family="Menlo, Consolas, monospace" font-size="12" letter-spacing="1" fill="#9aa0b4">${row(weathers.slice(half))}</text>`;

  const counts = [["things", total], ["makers", makers.size + (own.length ? 1 : 0)], ["languages", tongues], ["weathers", weathers.length]];
  const countsSvg = counts.map(([k, v], i) =>
    `<text x="${72 + i * 150}" y="566" font-family="Menlo, Consolas, monospace" font-size="12" letter-spacing="2" fill="#7f8699">${k.toUpperCase()}</text>` +
    `<text x="${72 + i * 150}" y="598" font-family="Georgia, 'Times New Roman', serif" font-size="30" fill="#ece6d9">${v}</text>`).join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>${defs.join("")}
    <radialGradient id="glow" cx="0.85" cy="0.1" r="0.9"><stop offset="0" stop-color="#ff9bc0" stop-opacity="0.14"/><stop offset="1" stop-color="#ff9bc0" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="#131a2b"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  <text x="72" y="118" font-family="Georgia, 'Times New Roman', serif" font-style="italic" font-size="84" fill="#ece6d9">eidos</text>
  <text x="290" y="118" font-family="Menlo, Consolas, monospace" font-size="14" letter-spacing="3" fill="#ff9bc0">WHAT DMYTRO KLOCHKO LOVES</text>
  <g font-family="Georgia, 'Times New Roman', serif" font-size="26" fill="#d9d4c8">
    ${lines.map((l, i) => `<text x="72" y="${178 + i * 36}">${esc(l)}</text>`).join("\n    ")}
  </g>
  ${bars.join("")}
  ${shown.join("")}
  ${legend}
  ${countsSvg}
  <text x="${W - 72}" y="598" text-anchor="end" font-family="Menlo, Consolas, monospace" font-size="13" letter-spacing="2" fill="#7f8699">DMKLOCHKO.COM/EIDOS</text>
</svg>`;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const map = JSON.parse(readFileSync("src/data/map.json", "utf8"));
  const palettes = JSON.parse(readFileSync("src/data/palettes.json", "utf8"));
  const svg = compose(map, palettes);
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile("public/og-eidos.png");
  const m = await sharp("public/og-eidos.png").metadata();
  console.log(`og-eidos.png → ${m.width}x${m.height}, from ${map.items.filter((i) => i.type !== "link").length} shelved marks`);
}
