#!/usr/bin/env node

// Derive small, purpose-specific copies from tracked source images. Like the
// other writing scripts in this repo, this is a dry run unless --apply is
// explicit. --check is for CI and tests: it writes nothing and exits non-zero
// when a derivative is missing, malformed, or stale.

import fs from "node:fs";
import fsp from "node:fs/promises";
import crypto from "node:crypto";
import path from "node:path";

import sharp from "sharp";

const root = process.cwd();
const apply = process.argv.includes("--apply");
const check = process.argv.includes("--check");
const manifestFile = path.join(root, "scripts/image-derivatives.json");

if (apply && check) {
  console.error("choose --apply or --check, not both");
  process.exit(2);
}

const readJson = (file) => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const publicFile = (url) => path.join(root, "public", url.replace(/^\//, ""));
const sha256 = (buffer) => crypto.createHash("sha256").update(buffer).digest("hex");
const recipeFor = ({ width, height, fit, quality }) => ({
  width,
  ...(height ? { height } : {}),
  fit,
  position: "centre",
  withoutEnlargement: true,
  format: "webp",
  quality,
  effort: 6,
});
const thumbnailFor = (src) => {
  const relative = src.replace(/^\/images\//, "");
  const parsed = path.posix.parse(relative);
  return path.posix.join("/images/thumbs", parsed.dir, `${parsed.name}.webp`);
};

const map = readJson("src/data/map.json");
const today = readJson("src/data/today.json");

const mapSources = [...new Set(
  map.items.map((item) => item.src).filter((src) => src?.startsWith("/images/")),
)];
const todaySources = [...new Set(today.chords.map((chord) => chord.painting.src))];

const jobs = [
  ...mapSources.map((src) => ({
    src,
    out: thumbnailFor(src),
    width: 320,
    height: 320,
    fit: "cover",
    quality: 76,
  })),
  ...todaySources.flatMap((src) => {
    const stem = path.basename(src, path.extname(src));
    return [480, 960].map((width) => ({
      src,
      out: `/images/responsive/today/${stem}-${width}.webp`,
      width,
      fit: "inside",
      quality: width === 480 ? 76 : 80,
    }));
  }),
  // The pond: a phone does not need the 1800px print, and the frog renders at
  // 168px at most, so 340 covers 2x screens.
  ...[800, 1280].map((width) => ({
    src: "/images/pond/fuji.webp",
    out: `/images/responsive/pond/fuji-${width}.webp`,
    width,
    fit: "inside",
    quality: width === 800 ? 78 : 80,
  })),
  {
    src: "/images/pond/frog.webp",
    out: "/images/responsive/pond/frog-340.webp",
    width: 340,
    fit: "inside",
    quality: 82,
  },
];

const render = (job) => {
  const recipe = recipeFor(job);
  return sharp(publicFile(job.src))
    .resize({
      width: recipe.width,
      height: recipe.height,
      fit: recipe.fit,
      position: recipe.position,
      withoutEnlargement: recipe.withoutEnlargement,
    })
    .webp({ quality: recipe.quality, effort: recipe.effort })
    .toBuffer();
};

const inspect = async (job) => {
  const out = publicFile(job.out);
  if (!fs.existsSync(out)) return "missing";
  const metadata = await sharp(out).metadata();
  if (metadata.format !== "webp") return `format ${metadata.format}`;
  if (metadata.width !== job.width) return `width ${metadata.width}`;
  if (job.height && metadata.height !== job.height) return `height ${metadata.height}`;
  const recorded = manifest.jobs[job.out];
  if (!recorded) return "manifest entry missing";
  if (recorded.src !== job.src || JSON.stringify(recorded.recipe) !== JSON.stringify(recipeFor(job))) {
    return "recipe differs";
  }
  const [source, actual] = await Promise.all([
    fsp.readFile(publicFile(job.src)),
    fsp.readFile(out),
  ]);
  if (recorded.sourceSha256 !== sha256(source)) return "source differs";
  if (recorded.outputSha256 !== sha256(actual)) return "content differs";
  return "ready";
};

const manifest = fs.existsSync(manifestFile)
  ? JSON.parse(fs.readFileSync(manifestFile, "utf8"))
  : { version: 1, jobs: {} };

if (check) {
  const wrong = [];
  for (const job of jobs) {
    const state = await inspect(job);
    if (state !== "ready") wrong.push(`${job.out}: ${state}`);
  }
  if (wrong.length) {
    console.error(wrong.join("\n"));
    process.exit(1);
  }
  console.log(`image derivatives: ${jobs.length} ready`);
  process.exit(0);
}

if (!apply) {
  console.log(`would derive ${jobs.length} images; pass --apply to write them`);
  process.exit(0);
}

let before = 0;
let after = 0;
const nextManifest = { version: 1, jobs: {} };
for (const job of jobs) {
  const source = publicFile(job.src);
  const out = publicFile(job.out);
  const temporary = `${out}.tmp`;
  await fsp.mkdir(path.dirname(out), { recursive: true });
  const [sourceBuffer, outputBuffer] = await Promise.all([
    fsp.readFile(source),
    render(job),
  ]);
  before += sourceBuffer.length;
  await fsp.writeFile(temporary, outputBuffer);
  await fsp.rename(temporary, out);
  after += outputBuffer.length;
  nextManifest.jobs[job.out] = {
    src: job.src,
    recipe: recipeFor(job),
    sourceSha256: sha256(sourceBuffer),
    outputSha256: sha256(outputBuffer),
  };
}

await fsp.writeFile(`${manifestFile}.tmp`, `${JSON.stringify(nextManifest, null, 2)}\n`);
await fsp.rename(`${manifestFile}.tmp`, manifestFile);

console.log(
  `image derivatives: ${jobs.length}, ${Math.round(before / 1024)}KB sources → ${Math.round(after / 1024)}KB`,
);
