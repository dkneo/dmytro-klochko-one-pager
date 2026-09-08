import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

// The portrait travels: /eidos/embed remains a small frame without the site's
// chrome. The public product no longer promotes embed machinery in its story.

const root = path.resolve(import.meta.dirname, "..");
const read = (f) => fs.readFileSync(path.join(root, f), "utf8");
const exists = (f) => fs.existsSync(path.join(root, f));

test("the embed is the portrait alone, with no site furniture showing through the frame", () => {
  assert.ok(exists("dist/eidos/embed/index.html"), "no embed page was built");
  const html = read("dist/eidos/embed/index.html");
  assert.match(html, /class="eidos-portrait/, "the embed does not carry the portrait");
  for (const chrome of ["site-header", "site-footer", "dream-sky", 'class="scenes"', "chapter-rail"]) {
    assert.ok(!html.includes(chrome), `the embed shows the site's ${chrome} inside the frame`);
  }
  assert.match(html, /<base target="_top"/, "links inside the frame must open the top window");
  assert.match(html, /name="robots" content="noindex/, "the embed must not be indexed on its own");
  // the frame and the product read the same vault
  const lib = read("dist/eidos/index.html");
  const map = JSON.parse(read("src/data/map.json"));
  const shelved = map.items.filter((item) => item.type !== "link").length;
  assert.equal(Number(html.match(/(\d+) real things i love/)?.[1]), shelved, "the embed miscounts the vault");
  assert.equal([...lib.matchAll(/data-piece data-form=/g)].length, shelved, "the product miscounts the vault");
});

test("the product keeps frame machinery out of the story, and the sitemap keeps the frame out", () => {
  const lib = read("dist/eidos/index.html");
  assert.doesNotMatch(lib, /iframe|embed-copy|lib-embed/, "technical embed furniture leaked into the portrait");
  assert.ok(!read("dist/sitemap.xml").includes("/eidos/embed"), "the embed leaked into the sitemap");
});
