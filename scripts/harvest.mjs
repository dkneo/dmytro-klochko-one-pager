// Finds taste he has already declared somewhere on the site and the vault has
// never heard of.
//
// This is the cheapest enrichment there is: no museum api, no guessing, no
// asking him anything. His own pages already name the people on his wall and
// carry the paintings he made, and none of it had reached the map.
//
// It proposes; it never invents. A harvested note carries what the source
// actually says and no weather at all, because how a thing feels is his to
// say. Unplaced notes ride the ring on /eidos until he places them.
//
//   node scripts/harvest.mjs           what is missing
//   node scripts/harvest.mjs --apply   write the notes
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const apply = process.argv.includes("--apply");
const slug = (s) => s.toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 60);

// everything the vault already knows, by name and by file
const known = new Set();
for (const dir of readdirSync("vault")) {
  for (const f of readdirSync(join("vault", dir))) {
    if (!f.endsWith(".md")) continue;
    known.add(f.replace(/\.md$/, ""));
    const t = readFileSync(join("vault", dir, f), "utf8");
    const who = /^who:\s*"?([^"\n]+)"?/m.exec(t);
    if (who) known.add(slug(who[1]));
    const src = /^src:\s*"?([^"\n]+)"?/m.exec(t);
    if (src) known.add(src[1].trim());
  }
}

const found = [];

// ── the wall: people he chose to look at, in his own captions ────────────
const index = readFileSync("src/pages/index.astro", "utf8");
const wall = /const wall = \[(.*?)\] as const;/s.exec(index);
if (wall) {
  for (const m of wall[1].matchAll(/\{\s*src:\s*"([^"]+)",\s*cap:\s*"([^"]+)"\s*\}/g)) {
    const [, src, cap] = m;
    if (known.has(slug(cap))) continue;
    found.push({
      kind: "person", file: `vault/people/${slug(cap)}.md`, name: cap,
      body: [
        "---", "type: person", `name: ${cap}`, `src: ${src}`,
        "source: his wall on the main page",
        `added: ${new Date().toISOString().slice(0, 10)}`,
        "---", "",
        `on the wall. no weather yet: that is his to say.`, "",
      ].join("\n"),
    });
  }
}

// ── his own paintings: the ten skies the whole site is built on ──────────
// DESIGN.md: "His own paintings (Seedream, 4K, chosen and named by him) run
// full-bleed as fixed scenes". They are his making, not his borrowing, and
// the map had no idea they existed.
const SCENE_NOTE = {
  swim: "the swimmer under the orange sun. the opening screen.",
  fuji: "the fuji rafts. stands behind replika.",
  fields: "sunflowers. stands behind what came before.",
  fire: "the campfire. stands behind how he works.",
  dock: "the boy fishing. stands behind childhood.",
  lavender: "the lavender walk. stands behind the camera.",
  snow: "the snowlit village. stands behind saying hi.",
  estuary: "the estuary. stands behind taste.",
  nightcourt: "a dark courtyard. carries the reading pages.",
  study: "one of his own, taken down to night, for learning.",
};
if (existsSync("public/images/scenes")) {
  for (const f of readdirSync("public/images/scenes")) {
    const name = f.replace(/\.webp$/, "");
    const src = `/images/scenes/${f}`;
    if (known.has(src) || known.has(`his-${name}`)) continue;
    found.push({
      kind: "painting (his own)", file: `vault/paintings/his-${name}.md`, name,
      body: [
        "---", "type: painting", "who: Dmytro Klochko", `title: ${name}`,
        `src: ${src}`, "collection: his own, made with Seedream and named by him",
        "licence: his",
        `note: |-`, `  ${SCENE_NOTE[name] || "one of the ten skies the site runs on."}`,
        `added: ${new Date().toISOString().slice(0, 10)}`,
        "---", "",
        "made rather than found. no weather yet.", "",
      ].join("\n"),
    });
  }
}

// ── his own writing ───────────────────────────────────────────────────────
if (existsSync("src/pages/writing")) {
  for (const f of readdirSync("src/pages/writing")) {
    if (!f.endsWith(".astro") || f === "index.astro") continue;
    const t = readFileSync(join("src/pages/writing", f), "utf8");
    const h1 = /const title = "([^"]+)"/.exec(t);
    const name = (h1 ? h1[1] : f.replace(/\.astro$/, "")).split("·")[0].trim();
    if (known.has(slug(name))) continue;
    found.push({
      kind: "his writing", file: `vault/writing/${slug(name)}.md`, name,
      body: [
        "---", "type: writing", "who: Dmytro Klochko", `title: ${name}`,
        `url: /writing/${f.replace(/\.astro$/, "")}`,
        `added: ${new Date().toISOString().slice(0, 10)}`,
        "---", "",
        "his own. no weather yet.", "",
      ].join("\n"),
    });
  }
}

const byKind = {};
for (const f of found) (byKind[f.kind] ||= []).push(f.name);
console.log(`${found.length} things the site declares and the vault does not know:\n`);
for (const [k, names] of Object.entries(byKind)) console.log(`  ${k} (${names.length}): ${names.join(", ")}`);

if (apply) {
  const { mkdirSync } = await import("node:fs");
  for (const f of found) {
    mkdirSync(f.file.split("/").slice(0, -1).join("/"), { recursive: true });
    writeFileSync(f.file, f.body);
  }
  console.log(`\nwritten. none carries a weather: ${found.length} more notes on the ring, waiting for him.`);
} else if (found.length) {
  console.log("\nnothing written. run with --apply.");
}
