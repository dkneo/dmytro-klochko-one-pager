// The other half of the loop: verdicts live in KV, the vault lives in git, and
// this moves the keeps from one to the other as markdown.
//
//   npx wrangler kv key get verdicts --binding VAULT --remote > /tmp/verdicts.json
//   node scripts/vault-pull.mjs /tmp/verdicts.json
//
// Deliberately not automatic. Nothing reaches the vault without a commit, so
// the history shows what was kept, when, and by whom.

import { readFileSync, writeFileSync, existsSync, renameSync } from "node:fs";
import { join } from "node:path";

const file = process.argv[2];
if (!file) {
  console.error("usage: node scripts/vault-pull.mjs <verdicts.json>");
  process.exit(1);
}

const verdicts = JSON.parse(readFileSync(file, "utf8"));
const inbox = JSON.parse(readFileSync("public/inbox.json", "utf8")).candidates;

const slug = (s) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);

const q = (v) =>
  /[:#"'\n[\]{}|>]/.test(String(v)) ? `"${String(v).replace(/"/g, '\\"')}"` : String(v);

let kept = 0, passed = 0, waiting = 0;

for (const c of inbox) {
  const v = verdicts[c.id];
  if (!v) { waiting++; continue; }
  if (v.verdict !== "keep") { passed++; continue; }

  if (c.type !== "painting") {
    console.warn(`  ${c.id}: only paintings are handled so far, skipped`);
    continue;
  }

  // The image moves out of the inbox and into the site proper: an approved
  // painting is no longer a candidate and should not be served from a folder
  // that says it is.
  const from = join("public", c.src);
  const to = join("public/images/today", c.src.split("/").pop());
  if (existsSync(from) && !existsSync(to)) renameSync(from, to);
  const src = "/images/today/" + c.src.split("/").pop();

  const name = slug(`${c.who}-${c.title}`);
  const path = `vault/paintings/${name}.md`;
  if (existsSync(path)) { console.log(`  ${name} already in the vault`); continue; }

  writeFileSync(path, [
    "---",
    "type: painting",
    `who: ${q(c.who)}`,
    `title: ${q(c.title)}`,
    `year: ${q(c.year)}`,
    `collection: ${q(c.collection || "see source")}`,
    `src: ${q(src)}`,
    `source: ${q(c.source)}`,
    `licence: ${q(c.licence)}`,
    `weather: ${q(c.weather)}`,
    `added: ${(v.at || "").slice(0, 10)}`,
    "---",
    "",
    `![[${src.split("/").pop()}]]`,
    "",
    `weather: [[${c.weather}]] · who: [[${c.who}]]`,
    "",
  ].join("\n"));
  kept++;
}

console.log(`pulled: ${kept} kept into the vault, ${passed} passed, ${waiting} still waiting`);
if (kept) console.log("now run: npm run vault && npm run build");
