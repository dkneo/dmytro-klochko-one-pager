// Reads the request desk.
//
// Stella files at /ask; this is how the requests reach a working session.
// Nothing here writes to the site: it prints what is open, and can mark a
// request as picked up, answered or done. Status changes append to the
// request's history rather than replacing it, so the trail survives.
//
//   node scripts/ask-pull.mjs                    what is open
//   node scripts/ask-pull.mjs --all              including what is finished
//   node scripts/ask-pull.mjs <id> doing         picked it up
//   node scripts/ask-pull.mjs <id> question "…"  ask her something
//   node scripts/ask-pull.mjs <id> done "…"      finished, with a note
import { execFileSync } from "node:child_process";

const NS = "d5e466fe143e4b8aadce72dd01da4507";
const KEY = "ask:requests";
const [, , a, b, c] = process.argv;

const kv = (args) =>
  execFileSync("npx", ["wrangler", "kv", "key", ...args, `--namespace-id=${NS}`, "--remote"],
    { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });

let all = [];
try { all = JSON.parse(kv(["get", KEY]).trim()) || []; } catch { all = []; }

if (a && a !== "--all" && b) {
  const r = all.find((x) => x.id === a);
  if (!r) { console.log(`no request ${a}`); process.exit(1); }
  if (!["new", "doing", "done", "declined", "question"].includes(b)) {
    console.log("status must be new, doing, done, declined or question"); process.exit(1);
  }
  r.events.push({ status: b, at: new Date().toISOString(), note: c || "" });
  execFileSync("npx", ["wrangler", "kv", "key", "put", KEY, JSON.stringify(all),
    `--namespace-id=${NS}`, "--remote"], { stdio: ["ignore", "ignore", "ignore"] });
  console.log(`${a} → ${b}${c ? ": " + c : ""}  (${r.events.length} events on the record)`);
  process.exit(0);
}

const showAll = a === "--all";
const open = all.filter((r) => (r.events.at(-1) || {}).status !== "done");
const show = showAll ? all : open;

console.log(`${all.length} filed, ${open.length} open\n`);
for (const r of show.slice().reverse()) {
  const last = r.events.at(-1) || {};
  console.log(`  ${r.id}  [${last.status}]  ${r.kind} · ${r.page}${r.urgency !== "whenever" ? " · " + r.urgency : ""}`);
  if (r.where) console.log(`      where: ${r.where}`);
  console.log(`      ${r.what.replace(/\n/g, "\n      ")}`);
  console.log(`      — ${r.who}, ${r.at.slice(0, 16).replace("T", " ")}`);
  if (r.events.length > 1) {
    for (const e of r.events.slice(1)) {
      console.log(`        ${e.at.slice(5, 16).replace("T", " ")}  ${e.status}${e.note ? ": " + e.note : ""}`);
    }
  }
  console.log();
}
if (!show.length) console.log("  nothing open.");
