// The share card, rebuilt from the page rather than drawn beside it: the same
// scene as the site, the same smoked glass, the same Zodiak sentence. Run it whenever
// the hero's voice changes so the most twitter-visible surface never lags the
// site. The previous card was made by hand and drifted two art directions.
//
//   node scripts/og-card.mjs
//
// Renders public/og.png at 1200x628 via headless Chrome, then quantizes.

import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const W = 1200;
const H = 628;

const b64 = (p, mime) => `data:${mime};base64,${readFileSync(p).toString("base64")}`;

const font = b64("public/fonts/zodiak-300.woff2", "font/woff2");
const mark = b64("public/images/marks/replika.png", "image/png");
// The scene is 2560px wide; the card only needs 1200, and the smaller the
// data URI the faster Chrome parses it.
const sceneBuf = await sharp("public/images/scenes/fire.webp")
  .resize(1600, null, { kernel: "lanczos3" })
  .jpeg({ quality: 92 })
  .toBuffer();
const scene = `data:image/jpeg;base64,${sceneBuf.toString("base64")}`;

const html = `<!doctype html><meta charset="utf-8"><style>
  @font-face { font-family: Zodiak; src: url(${font}) format("woff2"); font-weight: 300 }
  * { margin: 0; box-sizing: border-box }
  html, body { width: ${W}px; height: ${H}px; overflow: hidden }
  body { position: relative; background: #262b44 }

  /* His painting, full bleed, framed so the campfire keeps the lower right. */
  .scene {
    position: absolute; inset: 0;
    background: url(${scene}) center 46% / cover no-repeat;
  }

  /* The smoked glass, in the gradient form the site falls back to where
     backdrop-filter is unsupported — headless capture is one such place.
     It dims toward the ground colour and feathers off before the swimmer. */
  .glass {
    position: absolute; inset: 0;
    /* Uniform, like the site's full-viewport glass ... */
    background: rgb(20 24 40 / 26%);
  }

  .glass::after {
    content: ""; position: absolute; inset: 0;
    /* ... with one more breath of dusk under the sentence. */
    background: linear-gradient(102deg,
      rgb(16 20 34 / 34%) 0 34%, rgb(16 20 34 / 14%) 56%, transparent 72%);
  }

  .copy {
    position: absolute; left: 70px; top: 104px; width: 700px;
    font-family: Zodiak, Georgia, serif; font-weight: 300;
    color: #ece6d9; font-size: 54px; line-height: 1.22; letter-spacing: -0.012em;
  }

  .mark {
    display: inline-block; width: 0.92em; height: 0.92em; vertical-align: -0.12em;
    background: #ff9bc0;
    -webkit-mask: url(${mark}) center / contain no-repeat;
  }

  .url {
    position: absolute; left: 70px; bottom: 74px;
    font-family: ui-monospace, "SF Mono", Menlo, monospace;
    font-size: 20px; letter-spacing: 0.18em; text-transform: uppercase;
    color: rgb(236 230 217 / 62%);
  }

  /* Four petals, the site's own weather, so the card moves like the page. */
  .p { position: absolute; width: 13px; height: 13px; border-radius: 100% 6% 100% 6%;
       background: radial-gradient(circle at 30% 30%, #ffd3df, #ff9bc0); opacity: .5 }
</style>
<div class="scene"></div>
<div class="glass"></div>
<b class="p" style="left:214px;top:132px;rotate:18deg"></b>
<b class="p" style="left:812px;top:210px;rotate:-24deg;opacity:.38"></b>
<b class="p" style="left:470px;top:470px;rotate:9deg;opacity:.42"></b>
<b class="p" style="left:1010px;top:520px;rotate:-12deg;opacity:.34"></b>
<p class="copy">hi! i&rsquo;m dmytro klochko, ceo at <span class="mark"></span>replika, jaywalker at the intersection of art and technology.</p>
<p class="url">dmklochko.com</p>`;

const dir = mkdtempSync(join(tmpdir(), "og-"));
const page = join(dir, "card.html");
writeFileSync(page, html);

execFileSync(CHROME, [
  "--headless",
  "--disable-gpu",
  "--hide-scrollbars",
  "--force-device-scale-factor=2",
  `--window-size=${W},${H}`,
  `--screenshot=${join(dir, "shot.png")}`,
  `file://${page}`,
], { stdio: "inherit" });

// Rendered at 2x for crisp type, then down to 1200x628 and quantized: og
// images are fetched by every crawler, so the bytes matter.
await sharp(join(dir, "shot.png"))
  .resize(W, H, { kernel: "lanczos3" })
  .png({ palette: true, colours: 256, effort: 10 })
  .toFile("public/og.png");

const { size } = await sharp("public/og.png").metadata().then(async () => ({
  size: (await import("node:fs")).statSync("public/og.png").size,
}));
console.log(`public/og.png ${W}x${H} ${(size / 1024).toFixed(0)}KB`);
