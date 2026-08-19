// What has been left in drop/ for me.
//
// Codex and Claude share this repo. Rather than exporting a zip and sending
// it through chat, whichever agent makes something writes it into drop/ and
// the other picks it up here.
//
// This only ever reports and files; it does not delete. An item is "filed"
// by being copied where it belongs, and only then moved out of the way.
//
//   node scripts/drop.mjs           what is waiting, and where each thing goes
//   node scripts/drop.mjs --file    put them where they belong
import { readdirSync, statSync, mkdirSync, copyFileSync, renameSync, existsSync } from "node:fs";
import { join, extname } from "node:path";

const apply = process.argv.includes("--file");
const DROP = "drop";
const DONE = join(DROP, "_filed");

// A prefix says where a thing belongs. Anything else needs a human sentence.
const ROUTES = [
  [/^scene-(.+)\.(jpe?g|png|webp)$/i, (m) => ({ to: `public/images/scenes/${m[1]}.webp`, note: "a site scene; convert to webp at 2560 wide first" })],
  [/^press-logo-(.+)\.svg$/i,          (m) => ({ to: `(src/data/press-logos.json → ${m[1]})`, note: "run scripts/press-logos.mjs or add by hand" })],
  [/^pond-(.+)\.(png|webp|svg|jpe?g)$/i, (m) => ({ to: `public/images/pond/${m[1]}${extname(m[0] || "")}`, note: "pond game asset" })],
  [/^wall-(.+)\.(jpe?g|png|webp)$/i,   (m) => ({ to: `public/images/wall/${m[1]}.webp`, note: "a face for the wall on the main page" })],
  [/^names?-(.+)\.html$/i,             (m) => ({ to: "KV names:folio", note: "the folio lives in KV, not the repo. upload with wrangler kv key put" })],
  [/^note-(.+)\.md$/i,                 (m) => ({ to: "(read it)", note: "a message, not an asset" })],
  [/\.(jpe?g|png|webp|gif)$/i,         () => ({ to: "(unrouted image)", note: "no prefix: say what it is in drop/notes.md" })],
  [/\.html?$/i,                        () => ({ to: "(unrouted page)", note: "no prefix: say what it is in drop/notes.md" })],
];

if (!existsSync(DROP)) { console.log("no drop/ folder"); process.exit(0); }
const files = readdirSync(DROP).filter((f) => f !== "README.md" && f !== "_filed" && !f.startsWith("."));

if (!files.length) {
  console.log("drop/ is empty. everything has been picked up.");
  process.exit(0);
}

console.log(`${files.length} waiting in drop/\n`);
const moves = [];
for (const f of files) {
  const s = statSync(join(DROP, f));
  if (s.isDirectory()) { console.log(`  ${f}/  (folder, look inside)`); continue; }
  const hit = ROUTES.find(([re]) => re.test(f));
  const r = hit ? hit[1](f.match(hit[0])) : { to: "(unknown)", note: "no rule matches this name" };
  const kb = (s.size / 1024).toFixed(0);
  console.log(`  ${f}`);
  console.log(`      ${kb}kb → ${r.to}`);
  console.log(`      ${r.note}`);
  if (apply && r.to.startsWith("public/")) moves.push([f, r.to]);
}

if (existsSync(join(DROP, "notes.md"))) {
  console.log("\n  drop/notes.md says:");
  console.log(readdirSync ? "  " + require("node:fs").readFileSync(join(DROP, "notes.md"), "utf8").trim().replace(/\n/g, "\n  ") : "");
}

if (apply && moves.length) {
  mkdirSync(DONE, { recursive: true });
  for (const [f, to] of moves) {
    mkdirSync(to.split("/").slice(0, -1).join("/"), { recursive: true });
    copyFileSync(join(DROP, f), to);
    renameSync(join(DROP, f), join(DONE, f));
    console.log(`  filed ${f} → ${to}`);
  }
} else if (moves.length) {
  console.log(`\n${moves.length} can be filed automatically. run with --file.`);
}
