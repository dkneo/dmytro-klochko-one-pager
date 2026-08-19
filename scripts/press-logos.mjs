// Publisher wordmarks for the featured strip.
//
// All eight are hosted on Commons as public domain: a plain wordmark sits
// below the threshold of originality, so there is no copyright in them. The
// trademark still belongs to the publisher, and using it to say "this outlet
// covered me" is ordinary nominative use, the same as any "as seen in" strip.
//
// They arrive as SVG in whatever colour the publisher uses. The strip is one
// tone on a dark ground, so each is recoloured to a single cream and shipped
// as a small inline-able SVG rather than eight network requests.
import { writeFileSync, mkdirSync } from "node:fs";

const UA = "dmklochko-site/1.0 (https://dmklochko.com)";
const OUT = "public/images/press";
mkdirSync(OUT, { recursive: true });

const WANT = {
  cnn: "CNN.svg",
  time: "Time Magazine logo.svg",
  economist: "The Economist Logo.svg",
  ft: "Financial Times masthead.svg",   // the horizontal masthead: the
       // "corporate logo" file is a portrait lockup, wrong shape for a strip
  atlantic: "The Atlantic magazine logo.svg",
  nature: "Nature journal logo.svg",
  verge: "The Verge wordmark.svg",
  elpais: "El País logo.svg",
  abc: "ABC (Australia) logo.svg",
};

const out = {};
for (const [key, title] of Object.entries(WANT)) {
  const u = new URL("https://commons.wikimedia.org/w/api.php");
  u.search = new URLSearchParams({
    action: "query", format: "json", titles: `File:${title}`,
    prop: "imageinfo", iiprop: "url|extmetadata",
  }).toString();
  const meta = await fetch(u, { headers: { "user-agent": UA } }).then((r) => r.json());
  const page = Object.values(meta.query.pages)[0];
  const ii = page.imageinfo?.[0];
  if (!ii) { console.log(`  ${key}: not found`); continue; }

  let svg = await fetch(ii.url, { headers: { "user-agent": UA } }).then((r) => r.text());

  // Strip anything that could execute or phone home, then flatten to one
  // colour so the strip reads as a set rather than nine brand palettes.
  svg = svg.replace(/<\?xml[^>]*\?>/g, "")
           .replace(/<!DOCTYPE[^>]*>/g, "")
           .replace(/<script[\s\S]*?<\/script>/gi, "")
           .replace(/<metadata[\s\S]*?<\/metadata>/gi, "")
           .replace(/<!--[\s\S]*?-->/g, "")
           .replace(/\s(on\w+|xlink:href|href)="[^"]*"/gi, "")
           .replace(/fill="(?!none)[^"]*"/gi, 'fill="currentColor"')
           .replace(/style="[^"]*fill:\s*(?!none)[^;"]*;?/gi, 'style="fill:currentColor;')
           .replace(/\s+/g, " ")
           .trim();
  if (!/fill="currentColor"/.test(svg)) svg = svg.replace(/<svg /i, '<svg fill="currentColor" ');

  // Several of these ship width and height but no viewBox, so they cannot
  // scale: the browser renders them at their intrinsic size and ignores css
  // height. Give them the viewBox their own dimensions imply.
  if (!/viewBox=/i.test(svg)) {
    const w = /\swidth="([\d.]+)/i.exec(svg), h = /\sheight="([\d.]+)/i.exec(svg);
    if (w && h) svg = svg.replace(/<svg /i, `<svg viewBox="0 0 ${w[1]} ${h[1]}" `);
  }
  // Drop the fixed pixel dimensions so css alone decides the size.
  svg = svg.replace(/<svg([^>]*)/i, (m, a) => "<svg" + a.replace(/\s(width|height)="[^"]*"/gi, ""));
  svg = svg.replace(/<svg /i, '<svg aria-hidden="true" focusable="false" ');

  // Several of these are knockout designs: the wordmark is cut out of a
  // solid plate. Recolouring every fill turns the plate into a filled block
  // and the mark disappears inside it. Drop any straight edged shape that
  // covers the whole viewBox, which is always the plate and never the mark.
  {
    // Never strip shapes that live inside defs or a clipPath: they are not
    // drawn, they define where other things may be drawn. Removing one
    // leaves an empty clip, which hides the whole mark.
    const guarded = [];
    svg = svg.replace(/<(defs|clipPath|mask)\b[\s\S]*?<\/\1>/gi, (m) => {
      guarded.push(m); return `__GUARD${guarded.length - 1}__`;
    });

    const vbm = /viewBox="([\d.\s-]+)"/i.exec(svg);
    if (vbm) {
      const [, , vw, vh] = vbm[1].trim().split(/\s+/).map(Number);
      const covers = (w, h) => w >= vw * 0.94 && h >= vh * 0.94;

      svg = svg.replace(/<rect\b[^>]*\/?>/gi, (tag) => {
        const w = parseFloat((/\swidth="([\d.]+)/i.exec(tag) || [])[1]);
        const h = parseFloat((/\sheight="([\d.]+)/i.exec(tag) || [])[1]);
        return w && h && covers(w, h) ? "" : tag;
      });

      svg = svg.replace(/<path\b[^>]*\bd="([^"]+)"[^>]*\/?>/gi, (tag, d) => {
        // curves mean it is artwork; plates are drawn with straight moves only
        if (/[csqta]/i.test(d.replace(/[^a-z]/gi, ""))) return tag;
        const nums = (d.match(/-?[\d.]+/g) || []).map(Number);
        if (nums.length < 4) return tag;
        const xs = nums.filter((_, i) => i % 2 === 0), ys = nums.filter((_, i) => i % 2 === 1);
        const w = Math.max(...xs.map(Math.abs)), h = Math.max(...ys.map(Math.abs));
        return covers(w, h) ? "" : tag;
      });
    }
    svg = svg.replace(/__GUARD(\d+)__/g, (_, i) => guarded[+i]);
  }

  // A group set to fill="none" swallows any child that inherits its fill,
  // which is how a knockout mark ends up invisible once its plate is gone.
  svg = svg.replace(/<g([^>]*)\sfill="none"/gi, "<g$1");
  // An empty clip hides everything it is applied to.
  if (/<clipPath[^>]*>\s*<\/clipPath>/i.test(svg)) {
    svg = svg.replace(/\sclip-path="url\([^)]*\)"/gi, "");
  }

  // These marks run from an almost square roundel to a masthead twelve times
  // wider than it is tall. Sizing them all to one height makes the wide ones
  // shout and the square ones vanish, so each is sized by area instead:
  // height falls as the mark gets wider, clamped so nothing becomes a hair.
  const vb = /viewBox="([\d.\s-]+)"/i.exec(svg);
  let h = 18;
  if (vb) {
    const [, , vw, vh] = vb[1].trim().split(/\s+/).map(Number);
    if (vw && vh) h = Math.round(Math.max(13, Math.min(26, 31 / Math.sqrt(vw / vh))) * 10) / 10;
  }
  out[key] = { svg, h, source: ii.descriptionurl, licence: "public domain (text logo)" };
  console.log(`  ${key.padEnd(10)} ${(svg.length / 1024).toFixed(1)}kb  h=${out[key].h}px`);
  await new Promise((r) => setTimeout(r, 700));
}

writeFileSync("src/data/press-logos.json", JSON.stringify(out, null, 1));
console.log(`\n  ${Object.keys(out).length} wordmarks → src/data/press-logos.json`);
