// A lock for the things git cannot protect.
//
// Two agents share this repo. Git handles conflicts on files: if Codex and
// Claude both edit press.astro, the second push is refused and someone
// merges. KV has no such protection. Two writes to names:folio and the
// second one silently wins, with no conflict and no warning.
//
// So anything that ends in a KV write gets claimed first. The lock expires
// on its own after two hours, because a forgotten lock that blocks the other
// agent forever is worse than the collision it was preventing.
//
//   node scripts/lock.mjs status
//   node scripts/lock.mjs claim names "swapping the esse illustration"
//   node scripts/lock.mjs release names
//
// Resources worth locking: names, ask, eidos, vault.
import { execFileSync } from "node:child_process";

const NS = "d5e466fe143e4b8aadce72dd01da4507";
const TTL = 60 * 60 * 2;
const WHO = process.env.AGENT || "claude";
const [, , cmd, resource, note] = process.argv;

const kv = (args, quiet = true) => {
  try {
    return execFileSync("npx", ["wrangler", "kv", "key", ...args, `--namespace-id=${NS}`, "--remote"],
      { encoding: "utf8", stdio: ["ignore", "pipe", quiet ? "ignore" : "inherit"] });
  } catch { return ""; }
};

const key = (r) => `lock:${r}`;
const read = (r) => { try { return JSON.parse(kv(["get", key(r)]).trim()); } catch { return null; } };
const ago = (iso) => {
  const m = Math.round((Date.now() - new Date(iso)) / 60000);
  return m < 1 ? "just now" : m < 60 ? `${m} min ago` : `${Math.round(m / 60)}h ago`;
};

const ALL = ["names", "ask", "eidos", "vault", "scout"];

if (cmd === "status" || !cmd) {
  let any = false;
  for (const r of ALL) {
    const l = read(r);
    if (l) { any = true; console.log(`  ${r.padEnd(7)} held by ${l.who}, ${ago(l.at)}${l.note ? " — " + l.note : ""}`); }
  }
  if (!any) console.log("  nothing locked. all clear.");
  process.exit(0);
}

if (!resource || !ALL.includes(resource)) {
  console.log(`resource must be one of: ${ALL.join(", ")}`);
  process.exit(1);
}

if (cmd === "claim") {
  const held = read(resource);
  if (held && held.who !== WHO) {
    console.log(`  ${resource} is held by ${held.who}, ${ago(held.at)}${held.note ? " — " + held.note : ""}`);
    console.log(`  do not write to ${resource}. it clears on its own within two hours.`);
    process.exit(1);
  }
  execFileSync("npx", ["wrangler", "kv", "key", "put", key(resource),
    JSON.stringify({ who: WHO, at: new Date().toISOString(), note: note || "" }),
    `--namespace-id=${NS}`, "--remote", "--ttl", String(TTL)],
    { stdio: ["ignore", "ignore", "ignore"] });
  console.log(`  ${resource} claimed by ${WHO}${note ? ": " + note : ""} (expires in 2h)`);
  process.exit(0);
}

if (cmd === "release") {
  const held = read(resource);
  if (held && held.who !== WHO) {
    console.log(`  ${resource} is held by ${held.who}, not you. leaving it alone.`);
    process.exit(1);
  }
  kv(["delete", key(resource)]);
  console.log(`  ${resource} released`);
  process.exit(0);
}

console.log("usage: lock.mjs status | claim <resource> [note] | release <resource>");
