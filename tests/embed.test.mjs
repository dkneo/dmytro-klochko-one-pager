import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

// The portrait travels: /eidos/embed is the same component in a frame with no
// chrome, and /eidos hands out the one line that puts it on another page.

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
  // the numbers are the library's numbers
  const lib = read("dist/eidos/index.html");
  const n = (h) => Number((h.match(/(\d+) real things i love/) || [])[1]);
  assert.equal(n(html), n(lib), "the embed and the library disagree about how many things he loves");
});

test("the library hands out the frame, and the sitemap keeps it out", () => {
  const lib = read("dist/eidos/index.html");
  assert.match(lib, /class="lib-embed"/, "no embed disclosure under the portrait");
  assert.match(lib, /iframe src=&quot;https:\/\/dmklochko\.com\/eidos\/embed&quot;|iframe src="https:\/\/dmklochko\.com\/eidos\/embed"|&lt;iframe src=\\?"https:\/\/dmklochko\.com\/eidos\/embed/, "the snippet does not point at the embed");
  assert.match(lib, /id="embed-copy"/, "no way to copy the snippet");
  assert.ok(!read("dist/sitemap.xml").includes("/eidos/embed"), "the embed leaked into the sitemap");
});
