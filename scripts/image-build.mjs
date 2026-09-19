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
const recipeFor = ({ width, height, fit, quality, format = "webp", lossless = false }) => ({
  width,
  ...(height ? { height } : {}),
  fit,
  position: "centre",
  withoutEnlargement: true,
  format,
  ...(lossless ? { lossless: true } : { quality }),
  effort: 6,
});
const thumbnailFor = (src) => {
  const relative = src.replace(/^\/images\//, "");
  const parsed = path.posix.parse(relative);
  return path.posix.join("/images/thumbs", parsed.dir, `${parsed.name}.webp`);
};

// Pictures that are looked at, served at the sizes they are actually seen
// (measured in the browser, 14 Sep 2026, see animation-plans/…/P05). A 2×
// screen gets twice the rendered width; AVIF where it costs least, WebP
// beside it; the faun mark is graphite, not line art: lossy at 85 keeps every grain.
const pictureFor = (src, stem, width, format, quality) => ({
  src,
  out: `/images/responsive/${stem}-${width}.${format}`,
  width,
  fit: "inside",
  format,
  quality,
});
const pictures = [
  // eidos hero: 860 px wide at 1440 (60vw), full width on phones
  ...[768, 1152, 1536].flatMap((w) => [pictureFor("/images/eidos/product/hero-desktop-poster.webp", "eidos/hero-desktop-poster", w, "avif", 63), pictureFor("/images/eidos/product/hero-desktop-poster.webp", "eidos/hero-desktop-poster", w, "webp", 82)]),
  ...[480, 720, 960].flatMap((w) => [pictureFor("/images/eidos/product/hero-mobile-poster.webp", "eidos/hero-mobile-poster", w, "avif", 63), pictureFor("/images/eidos/product/hero-mobile-poster.webp", "eidos/hero-mobile-poster", w, "webp", 82)]),
  // faun mark: 34 px in the header, 261 px in the discover rail
  ...[96, 540].map((w) => ({ src: "/images/eidos/product/faun-mark.webp", out: `/images/responsive/eidos/faun-mark-${w}.webp`, width: w, fit: "inside", format: "webp", quality: 85 })),
  // press portrait: 530 px at 1440, 341 px on phones
  ...[800, 1200, 1600].flatMap((w) => [pictureFor("/images/press/times-radio-studio.webp", "press/times-radio-studio", w, "avif", 63), pictureFor("/images/press/times-radio-studio.webp", "press/times-radio-studio", w, "webp", 82)]),
  // homepage rasters, same pixel size, modern format
  { src: "/images/pirate-flag-mark.png", out: "/images/responsive/home/pirate-flag-mark-64.webp", width: 64, fit: "inside", format: "webp", lossless: true },
  pictureFor("/images/lynch.jpg", "home/lynch", 640, "webp", 82),
  pictureFor("/images/journey/lecture.jpg", "home/lecture", 900, "webp", 82),
  pictureFor("/video/cv-meta-poster.jpg", "home/cv-meta-poster", 720, "webp", 82),
  pictureFor("/video/busking-poster.jpg", "home/busking-poster", 440, "webp", 82),
  pictureFor("/images/cv-lecture.jpg", "home/cv-lecture", 1100, "webp", 82),
  pictureFor("/images/war-16.jpg", "home/war-16", 520, "webp", 82),
  pictureFor("/video/theatre-poster.jpg", "home/theatre-poster", 760, "webp", 82),
  pictureFor("/video/actor-poster.jpg", "home/actor-poster", 640, "webp", 82),
];

const map = readJson("src/data/map.json");
const today = readJson("src/data/today.json");

const mapSources = [...new Set(
  map.items.map((item) => item.src).filter((src) => src?.startsWith("/images/")),
)];
const todaySources = [...new Set(today.chords.map((chord) => chord.painting.src))];

// The map wants square dots; the library wants plates. A cover crop cuts
// the composition off a painting, which is fine for a 40px mark on a chart
// and wrong for a wall you are meant to look at.
const plateFor = (src) => {
  const parsed = path.posix.parse(src.replace(/^\/images\//, ""));
  return path.posix.join("/images/plates", parsed.dir, `${parsed.name}.webp`);
};

const jobs = [
  ...mapSources.map((src) => ({
    src,
    out: thumbnailFor(src),
    width: 320,
    height: 320,
    fit: "cover",
    quality: 76,
  })),
  ...mapSources.map((src) => ({
    src,
    out: plateFor(src),
    width: 440,
    fit: "inside",
    quality: 80,
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
  ...pictures,
];

const render = (job) => {
  const recipe = recipeFor(job);
  const image = sharp(publicFile(job.src))
    .resize({
      width: recipe.width,
      height: recipe.height,
      fit: recipe.fit,
      position: recipe.position,
      withoutEnlargement: recipe.withoutEnlargement,
    });
  if (recipe.format === "avif") return image.avif({ quality: recipe.quality, effort: recipe.effort }).toBuffer();
  if (recipe.lossless) return image.webp({ lossless: true, effort: recipe.effort }).toBuffer();
  return image.webp({ quality: recipe.quality, effort: recipe.effort }).toBuffer();
};

const inspect = async (job) => {
  const out = publicFile(job.out);
  if (!fs.existsSync(out)) return "missing";
  const metadata = await sharp(out).metadata();
  const expected = recipeFor(job).format === "avif" ? "heif" : "webp";
  if (metadata.format !== expected) return `format ${metadata.format}`;
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
  // Idempotent: a derivative that already matches its manifest entry is kept
  // byte for byte. Re-encoding is not deterministic across sharp builds, and
  // five hundred churned plates would bury a real change.
  if ((await inspect(job)) === "ready") { nextManifest.jobs[job.out] = manifest.jobs[job.out]; continue; }
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
