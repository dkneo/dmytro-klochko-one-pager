import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const developmentPreviewMeta =
  /<meta(?=[^>]*\bname=["']codex-preview["'])(?=[^>]*\bcontent=["']development["'])[^>]*>/i;
const templateRoot = new URL("../", import.meta.url);

async function getWorker() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker;
}

async function render() {
  const worker = await getWorker();

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html", host: "localhost" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("serves local images when Cloudflare bindings are absent", async () => {
  const originalFetch = globalThis.fetch;
  let fetchedUrl = "";

  globalThis.fetch = async (input) => {
    const request = new Request(input);
    fetchedUrl = request.url;
    return new Response(new Uint8Array([137, 80, 78, 71]), {
      headers: { "content-type": "image/png" },
    });
  };

  try {
    const worker = await getWorker();
    const response = await worker.fetch(
      new Request(
        "http://localhost/_vinext/image?url=%2Fimages%2Fdmytro-city.png&w=640&q=75",
      ),
      {},
      {
        waitUntil() {},
        passThroughOnException() {},
      },
    );

    assert.equal(response.status, 200);
    assert.equal(fetchedUrl, "http://localhost/images/dmytro-city.png");
    assert.equal(response.headers.get("content-type"), "image/png");
    assert.match(response.headers.get("content-security-policy") ?? "", /sandbox/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("server-renders the finished portfolio", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>dmytro klochko — art &amp; technology<\/title>/i);
  assert.match(html, /jaywalker at the intersection of/);
  assert.match(html, /born &amp; raised in donetsk/);
  assert.match(html, /now ceo at replika/);
  assert.match(html, /finding(?:\s|<[^>]+>)*connection/i);
  assert.match(html, /\/images\/dmytro-city\.png/);
  assert.match(html, /\/images\/art-abstract\.jpg/);
  assert.match(html, /<details[^>]*class="menu"/i);
  assert.match(html, /<header[^>]*aria-label="primary navigation"/i);
  assert.match(html, /<main[^>]*id="main-content"/i);
  assert.match(html, /<meta[^>]*property="og:image"[^>]*content="http:\/\/localhost\/og\.png"/i);
  assert.doesNotMatch(html, developmentPreviewMeta);
  assert.doesNotMatch(html, /react-loading-skeleton|Your site is taking shape/);
});

test("removes the disposable starter surface", async () => {
  const [page, layout, styles, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(page, /satisfies readonly LinkItem\[\]/);
  assert.match(page, /skip-link/);
  assert.match(page, /aria-labelledby/);
  assert.match(styles, /prefers-reduced-motion/);
  assert.match(layout, /generateMetadata/);
  assert.match(layout, /\/og\.png/);
  assert.doesNotMatch(page, /SkeletonPreview|codex-preview/);
  assert.doesNotMatch(layout, /Starter Project|codex-preview/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);

  await Promise.all([
    assert.rejects(
      access(new URL("../app/_sites-preview/SkeletonPreview.tsx", templateRoot)),
    ),
    assert.rejects(access(new URL("../app/_sites-preview/preview.css", templateRoot))),
  ]);
});
