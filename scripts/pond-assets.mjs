// The pond's material, fetched from Commons and prepared once.
//
// Nothing here is drawn by hand. The frog is Matsumoto Hoji's, about four
// brushstrokes of sumi ink from around 1814, and the mountain is Hokusai's
// Red Fuji. Both are public domain and both are credited on the page.
//
// The only processing is a cut-out: Hoji painted on a cream scroll, and the
// pond needs the frog on its own. Sumi ink on paper separates cleanly by
// luminance, so the alpha is just "how dark is this pixel", which keeps the
// brush edges soft instead of stamping a hard outline around them.
import sharp from "sharp";
import { writeFileSync, existsSync, mkdirSync } from "node:fs";

const UA = "dmklochko-site/1.0 (https://dmklochko.com; one pond page)";
const OUT = "public/images/pond";
mkdirSync(OUT, { recursive: true });

async function commonsUrl(title, width) {
  const u = new URL("https://commons.wikimedia.org/w/api.php");
  u.search = new URLSearchParams({
    action: "query", format: "json", titles: `File:${title}`,
    prop: "imageinfo", iiprop: "url|extmetadata", iiurlwidth: String(width),
  }).toString();
  const r = await fetch(u, { headers: { "user-agent": UA } });
  const p = Object.values((await r.json()).query.pages)[0];
  const ii = p.imageinfo?.[0];
  return { url: ii?.thumburl || ii?.url, page: ii?.descriptionurl };
}

async function grab(title, width) {
  const { url, page } = await commonsUrl(title, width);
  if (!url) throw new Error(`no url for ${title}`);
  const r = await fetch(url, { headers: { "user-agent": UA } });
  if (!r.ok) throw new Error(`${title}: ${r.status}`);
  return { buf: Buffer.from(await r.arrayBuffer()), page };
}

// ── the frog, cut from its paper ──────────────────────────────────────────
{
  const { buf, page } = await grab("Frog by Matsumoto Hoji.jpg", 760);
  const img = sharp(buf).ensureAlpha();
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const px = new Uint8ClampedArray(data);

  // Learn the paper from the corners, then let darkness alone decide opacity.
  // An earlier pass measured colour distance instead, which let stained and
  // shadowed paper through at partial alpha and gave the frog a dirty halo.
  // Sumi is very dark and paper is very light, so luminance separates them
  // cleanly while keeping the dry-brush edges soft.
  const lum = (i) => px[i] * 0.299 + px[i + 1] * 0.587 + px[i + 2] * 0.114;
  let paper = 0, n = 0;
  const corner = (x0, y0) => {
    for (let y = y0; y < y0 + 14; y++) for (let x = x0; x < x0 + 14; x++) {
      paper += lum((y * info.width + x) * info.channels); n++;
    }
  };
  corner(0, 0); corner(info.width - 15, 0); corner(0, info.height - 15); corner(info.width - 15, info.height - 15);
  paper /= n;

  // Crop to the ink itself, found by darkness rather than by the soft alpha:
  // the scroll is stained enough that a gentle threshold covers the whole
  // sheet. Hoji's signature and red seal sit inside this box and stay.
  let x0 = info.width, y0 = info.height, x1 = 0, y1 = 0;
  for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
    if (lum((y * info.width + x) * info.channels) < 110) {
      if (x < x0) x0 = x; if (x > x1) x1 = x;
      if (y < y0) y0 = y; if (y > y1) y1 = y;
    }
  }
  const pad = 10;
  x0 = Math.max(0, x0 - pad); y0 = Math.max(0, y0 - pad);
  x1 = Math.min(info.width - 1, x1 + pad); y1 = Math.min(info.height - 1, y1 + pad);

  for (let i = 0; i < px.length; i += info.channels) {
    const a = (paper - lum(i) - 30) / 95;
    px[i + 3] = Math.round(Math.max(0, Math.min(1, a)) * 255);
  }

  await sharp(Buffer.from(px), { raw: { width: info.width, height: info.height, channels: info.channels } })
    .extract({ left: x0, top: y0, width: x1 - x0 + 1, height: y1 - y0 + 1 })
    .resize({ width: 560, withoutEnlargement: true })
    .webp({ quality: 92, alphaQuality: 100 })
    .toFile(`${OUT}/frog.webp`);
  console.log(`  frog   ink ${x1 - x0 + 1}x${y1 - y0 + 1}, paper lum ${paper.toFixed(0)} → frog.webp`);
  writeFileSync(`${OUT}/frog.source.txt`, page + "\n");
}

// ── the mountain ──────────────────────────────────────────────────────────
{
  const { buf, page } = await grab("Red Fuji southern wind clear morning.jpg", 2000);
  await sharp(buf).resize({ width: 1800 }).webp({ quality: 88 }).toFile(`${OUT}/fuji.webp`);
  const m = await sharp(buf).metadata();
  console.log(`  fuji   ${m.width}x${m.height} → fuji.webp`);
  writeFileSync(`${OUT}/fuji.source.txt`, page + "\n");
}
