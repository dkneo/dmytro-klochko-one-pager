// A sitemap built from what actually shipped, so it cannot list a page that
// does not exist or miss one that does.
//
// Left out on purpose: the four redirect stubs (they carry noindex and a
// canonical pointing elsewhere); /names, which is behind a password; and the
// hidden rooms. Those rooms stay on disk and stay reachable by url. They are
// not the foyer, so they are not advertised.
import { readdirSync, statSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const SITE = "https://dmklochko.com";
const SKIP = new Set([
  "/archive/",
  "/at-work/",
  "/feed/",
  "/modus-operandi/",
  "/names/",
  "/writing/",
  "/writing/staying-human",
  "/writing/english-teacher",
  "/eidos/",
  "/eidos/deck/",
  "/eidos/map/",
  "/eidos/orbit/",
  "/eidos/sit/",
  "/today/",
  "/taste/",
  "/basho",
  "/hokku/",
  "/pond/",
  "/dance/",
  "/curate/",
  "/vault/",
  "/map/",
  "/lab/shader",
  "/ask/",
]);

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (name.endsWith(".html")) out.push(p);
  }
  return out;
}

if (!existsSync("dist")) {
  console.log("sitemap: no dist yet, skipped");
} else {
  const urls = walk("dist")
    .map((f) => "/" + f.replace(/^dist\//, "").replace(/index\.html$/, "").replace(/\.html$/, ""))
    .filter((u) => !SKIP.has(u))
    // a page that tells crawlers to ignore it does not belong in a sitemap
    .filter((u) => {
      const f = u.endsWith("/") ? `dist${u}index.html` : `dist${u}.html`;
      return existsSync(f) && !readFileSync(f, "utf8").includes("noindex");
    })
    .sort();

  const today = process.env.SITEMAP_DATE || new Date().toISOString().slice(0, 10);
  const body = urls
    .map((u) => `  <url>\n    <loc>${SITE}${u}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`)
    .join("\n");

  writeFileSync("dist/sitemap.xml",
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`);

  // robots.txt is served by Cloudflare, so point at the sitemap from the
  // pages themselves rather than trying to own that file.
  console.log(`sitemap: ${urls.length} pages`);
}
