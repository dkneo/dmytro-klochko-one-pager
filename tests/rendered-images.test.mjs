import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const attr = (tag, name) =>
  tag.match(new RegExp(`(?:^|\\s)${name}="([^"]*)"`))?.[1] ?? "";

const localFile = (url) => path.join(root, "public", url.replace(/^\//, ""));

test("the image derivative pipeline is complete", () => {
  const result = spawnSync(process.execPath, ["scripts/image-build.mjs", "--check"], {
    cwd: root,
    encoding: "utf8",
  });

  assert.equal(result.status, 0, result.stderr || result.stdout);
});

test("the derivative manifest records the complete renderer recipe", () => {
  const manifest = JSON.parse(read("scripts/image-derivatives.json"));

  assert.deepEqual(manifest.jobs["/images/thumbs/today/friedrich.webp"].recipe, {
    width: 320,
    height: 320,
    fit: "cover",
    position: "centre",
    withoutEnlargement: true,
    format: "webp",
    quality: 76,
    effort: 6,
  });
});

test("the image derivative check rejects substituted pixels", async () => {
  const target = path.join(root, "public/images/thumbs/today/friedrich.webp");
  const original = fs.readFileSync(target);
  const substitute = await sharp({
    create: { width: 320, height: 320, channels: 3, background: "#ff9bc0" },
  }).webp({ quality: 76, effort: 6 }).toBuffer();

  try {
    fs.writeFileSync(target, substitute);
    const result = spawnSync(process.execPath, ["scripts/image-build.mjs", "--check"], {
      cwd: root,
      encoding: "utf8",
    });
    assert.notEqual(result.status, 0, "a same-size replacement passed validation");
    assert.match(result.stderr, /content differs/);
  } finally {
    fs.writeFileSync(target, original);
  }
});

test("the image derivative check rejects a changed source even when its decoded pixels match", () => {
  const source = path.join(root, "public/images/today/friedrich.webp");
  const original = fs.readFileSync(source);

  try {
    fs.appendFileSync(source, Buffer.from([0]));
    const result = spawnSync(process.execPath, ["scripts/image-build.mjs", "--check"], {
      cwd: root,
      encoding: "utf8",
    });
    assert.notEqual(result.status, 0, "a changed source passed validation");
    assert.match(result.stderr, /source differs/);
  } finally {
    fs.writeFileSync(source, original);
  }
});

test("eidos map marks use small derivatives", async () => {
  const html = read("dist/eidos/index.html");
  const stage = html.slice(html.indexOf('id="stage"'), html.indexOf('class="em-zoom"'));
  const tags = [...stage.matchAll(/<img\b[^>]*>/g)].map((match) => match[0]);

  assert.ok(tags.length > 0);
  for (const tag of tags) {
    const src = attr(tag, "src");
    assert.match(src, /^\/images\/thumbs\//, src);
    const metadata = await sharp(localFile(src)).metadata();
    assert.ok(metadata.width <= 320, `${src} is ${metadata.width}px wide`);
    assert.equal(Number(attr(tag, "width")), metadata.width, `${src} width`);
    assert.equal(Number(attr(tag, "height")), metadata.height, `${src} height`);
  }
});

test("today reserves the real aspect ratio and offers responsive candidates", async () => {
  const html = read("dist/today/index.html");
  const tags = [...html.matchAll(/<img\b[^>]*data-src="[^"]+"[^>]*>/g)].map(
    (match) => match[0],
  );

  assert.ok(tags.length > 0);
  for (const tag of tags) {
    const src = attr(tag, "data-src");
    const metadata = await sharp(localFile(src)).metadata();
    assert.equal(Number(attr(tag, "width")), metadata.width, `${src} width`);
    assert.equal(Number(attr(tag, "height")), metadata.height, `${src} height`);

    const srcset = attr(tag, "data-srcset");
    assert.match(srcset, /-480\.webp 480w/);
    assert.match(srcset, /-960\.webp 960w/);
    assert.match(srcset, new RegExp(`${metadata.width}w$`));
    assert.ok(attr(tag, "sizes"), `${src} needs sizes`);
  }
});

test("main-page raster images declare their real dimensions", async () => {
  const html = read("dist/index.html");
  const tags = [...html.matchAll(/<img\b[^>]*>/g)]
    .map((match) => match[0])
    .filter((tag) => attr(tag, "src").startsWith("/images/"));

  assert.ok(tags.length > 0);
  for (const tag of tags) {
    const src = attr(tag, "src");
    const metadata = await sharp(localFile(src)).metadata();
    assert.equal(Number(attr(tag, "width")), metadata.width, `${src} width`);
    assert.equal(Number(attr(tag, "height")), metadata.height, `${src} height`);
    if (attr(tag, "loading") === "lazy") {
      assert.equal(attr(tag, "decoding"), "async", `${src} decoding`);
    }
  }
});
