// Delete CSS rules by selector, comment-aware and brace-aware. Four builds
// have now been broken by regex deletions orphaning a rule's leading comment
// terminator; a regex cannot see where a rule really starts or ends.
import { readFileSync, writeFileSync } from "node:fs";

const [file, ...selectors] = process.argv.slice(2);
const src = readFileSync(file, "utf8");
const want = new Set(selectors);

const out = [];
let i = 0, chunkStart = 0, depth = 0, removed = 0;
while (i < src.length) {
  if (src.startsWith("/*", i)) { i = src.indexOf("*/", i + 2) + 2 || src.length; continue; }
  const c = src[i];
  if (c === "{") { depth++; i++; continue; }
  if (c === "}") {
    depth--;
    if (depth === 0) {
      const chunk = src.slice(chunkStart, i + 1);
      // a rule's leading comment belongs to the rule, so it goes with it
      const sel = chunk.replace(/\/\*[\s\S]*?\*\//g, "").split("{")[0].trim();
      const parts = sel.split(",").map((x) => x.trim());
      if (parts.length && parts.every((p) => want.has(p))) removed++;
      else out.push(chunk);
      chunkStart = i + 1;
    }
    i++;
    continue;
  }
  i++;
}
out.push(src.slice(chunkStart));
writeFileSync(file, out.join("").replace(/\n{3,}/g, "\n\n"));
console.log(`  removed ${removed} rule(s)`);
