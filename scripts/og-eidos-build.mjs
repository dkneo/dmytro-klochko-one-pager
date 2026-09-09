// The share image for /eidos, composed from the live vault and the product art.
//
//   node scripts/og-eidos-build.mjs        writes public/og-eidos.png
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const W = 1200, H = 628;
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const hero = (await sharp(path.join(root, "public/images/eidos/product/hero-desktop-poster.webp"))
  .jpeg({ quality: 90, chromaSubsampling: "4:4:4" })
  .toBuffer()).toString("base64");
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

export function compose(map, palettes) {
  const shelved = map.items.filter((item) => item.type !== "link");
  const weathers = map.weathers
    .slice()
    .sort((a, b) => a.x - b.x)
    .map((weather) => ({
      ...weather,
      count: shelved.filter((item) => item.weather === weather.name).length,
      stops: palettes.palettes.find((palette) => palette.weather === weather.name)?.stops || ["#a8425d"],
    }));
  const languages = new Set(shelved.map((item) => item.lang).filter(Boolean)).size;

  const definitions = weathers.map((weather, index) =>
    `<linearGradient id="g${index}" x1="0" x2="1">${weather.stops.map((colour, stop) =>
      `<stop offset="${stop / Math.max(1, weather.stops.length - 1)}" stop-color="${colour}"/>`).join("")}</linearGradient>`
  ).join("");

  const totalFiled = weathers.reduce((sum, weather) => sum + weather.count, 0) || 1;
  const available = 452;
  const gap = 5;
  let x = 60;
  const bars = weathers.map((weather, index) => {
    const width = Math.max(9, (available - gap * (weathers.length - 1)) * weather.count / totalFiled);
    const bar = `<rect x="${x.toFixed(1)}" y="524" width="${width.toFixed(1)}" height="13" rx="6.5" fill="url(#g${index})"/>`;
    x += width + gap;
    return bar;
  }).join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <title>what i love, and what it says about me.</title>
  <defs>
    ${definitions}
    <pattern id="paper" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M4 8h1M31 17h1M17 39h1M44 31h1" stroke="#746757" stroke-opacity=".11" stroke-width=".7"/>
      <path d="M8 27c8-2 15-2 24 0M22 6c4 7 5 14 3 20" fill="none" stroke="#9b8b75" stroke-opacity=".04" stroke-width=".8"/>
    </pattern>
    <clipPath id="art"><rect x="586" y="54" width="554" height="480" rx="2"/></clipPath>
  </defs>
  <rect width="${W}" height="${H}" fill="#f2e2c9"/>
  <rect width="${W}" height="${H}" fill="url(#paper)"/>
  <circle cx="1104" cy="62" r="136" fill="none" stroke="#a8425d" stroke-width="2.5" opacity=".7"/>

  <text x="60" y="78" font-family="Menlo, Consolas, monospace" font-size="14" letter-spacing="3" fill="#a8425d">A LIVING PORTRAIT, MADE FROM CHOICES</text>
  <text x="60" y="158" font-family="Georgia, 'Times New Roman', serif" font-style="italic" font-size="64" fill="#292723">what i love,</text>
  <text x="60" y="228" font-family="Georgia, 'Times New Roman', serif" font-style="italic" font-size="64" fill="#292723">and what it says</text>
  <text x="60" y="298" font-family="Georgia, 'Times New Roman', serif" font-style="italic" font-size="64" fill="#292723">about me.</text>

  <text x="60" y="405" font-family="Menlo, Consolas, monospace" font-size="15" letter-spacing="1" fill="#5d5449">${shelved.length} real things · ${languages} languages · ${weathers.length} weathers</text>
  <text x="60" y="449" font-family="Georgia, 'Times New Roman', serif" font-size="20" fill="#5d5449">a public taste, still changing.</text>
  ${bars}
  <text x="60" y="575" font-family="Menlo, Consolas, monospace" font-size="13" letter-spacing="2" fill="#a8425d">DMKLOCHKO.COM/EIDOS</text>

  <g clip-path="url(#art)">
    <image href="data:image/jpeg;base64,${hero}" x="586" y="54" width="554" height="480" preserveAspectRatio="xMidYMid meet"/>
  </g>
  <path d="M586 558h554" stroke="#a8425d" stroke-opacity=".4"/>
  <text x="586" y="585" font-family="Menlo, Consolas, monospace" font-size="13" letter-spacing="2" fill="#5d5449">faun notices · gryphon remembers</text>
</svg>`;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const map = JSON.parse(readFileSync(path.join(root, "src/data/map.json"), "utf8"));
  const palettes = JSON.parse(readFileSync(path.join(root, "src/data/palettes.json"), "utf8"));
  const svg = compose(map, palettes);
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(path.join(root, "public/og-eidos.png"));
  const metadata = await sharp(path.join(root, "public/og-eidos.png")).metadata();
  console.log(`og-eidos.png → ${metadata.width}x${metadata.height}, from ${map.items.filter((item) => item.type !== "link").length} shelved marks`);
}
