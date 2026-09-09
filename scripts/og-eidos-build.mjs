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
  const visuals = map.items.filter((item) => item.type !== "link" && item.src);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <title>a beautiful, endless moodboard of things i love.</title>
  <defs>
    <pattern id="paper" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M4 8h1M31 17h1M17 39h1M44 31h1" stroke="#746757" stroke-opacity=".11" stroke-width=".7"/>
      <path d="M8 27c8-2 15-2 24 0M22 6c4 7 5 14 3 20" fill="none" stroke="#9b8b75" stroke-opacity=".04" stroke-width=".8"/>
    </pattern>
    <clipPath id="art"><rect x="586" y="54" width="554" height="480" rx="2"/></clipPath>
  </defs>
  <rect width="${W}" height="${H}" fill="#f2e2c9"/>
  <rect width="${W}" height="${H}" fill="url(#paper)"/>
  <circle cx="1104" cy="62" r="136" fill="none" stroke="#a8425d" stroke-width="2.5" opacity=".7"/>

  <text x="60" y="78" font-family="Menlo, Consolas, monospace" font-size="14" letter-spacing="3" fill="#a8425d">EIDOS · A LIVING MOODBOARD</text>
  <text class="og-headline" x="60" y="158" textLength="284" lengthAdjust="spacingAndGlyphs" font-family="Georgia, 'Times New Roman', serif" font-style="italic" font-size="52" fill="#292723">a beautiful,</text>
  <text class="og-headline" x="60" y="225" textLength="402" lengthAdjust="spacingAndGlyphs" font-family="Georgia, 'Times New Roman', serif" font-style="italic" font-size="52" fill="#292723">endless moodboard</text>
  <text class="og-headline" x="60" y="292" textLength="346" lengthAdjust="spacingAndGlyphs" font-family="Georgia, 'Times New Roman', serif" font-style="italic" font-size="52" fill="#292723">of things i love.</text>

  <text x="60" y="405" font-family="Menlo, Consolas, monospace" font-size="15" letter-spacing="1" fill="#5d5449">${visuals.length} visual things · real · credited</text>
  <text x="60" y="449" font-family="Georgia, 'Times New Roman', serif" font-size="20" fill="#5d5449">paintings, photographs, people and objects.</text>
  <path d="M60 524h452" stroke="#a8425d" stroke-width="3"/>
  <circle cx="176" cy="524" r="8" fill="#ff9bc0"/>
  <circle cx="354" cy="524" r="8" fill="#ff5f24"/>
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
