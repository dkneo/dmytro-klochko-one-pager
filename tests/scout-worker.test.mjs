import assert from "node:assert/strict";
import test from "node:test";

import worker from "../worker/index.js";

const scoutPage = "<!doctype html><title>scout school</title><h1>field manual</h1>";
const portrait = new TextEncoder().encode("private portrait bytes").buffer;

function env() {
  return {
    SCOUT_PASSWORD: "tasotaso",
    VAULT: {
      async get(key) {
        if (key === "scout:page") return scoutPage;
        return null;
      },
      async getWithMetadata(key) {
        if (key === "scout:media:taso-scout.webp") {
          return {
            value: portrait.slice(0),
            metadata: { contentType: "image/webp" },
          };
        }
        return { value: null, metadata: null };
      },
    },
    ASSETS: { fetch: () => new Response("asset", { status: 200 }) },
  };
}

async function login(bindings = env()) {
  const body = new FormData();
  body.set("password", "tasotaso");
  const response = await worker.fetch(new Request("https://dmklochko.com/scout", {
    method: "POST",
    body,
  }), bindings);
  assert.equal(response.status, 303);
  return response.headers.get("set-cookie").split(";", 1)[0];
}

const request = (path, cookie, init = {}) => new Request(`https://dmklochko.com${path}`, {
  ...init,
  headers: { ...(init.headers || {}), ...(cookie ? { cookie } : {}) },
});

test("the unauthenticated scout door names scout school in the document", async () => {
  const response = await worker.fetch(request("/scout"), env());
  const html = await response.text();

  assert.equal(response.status, 401);
  assert.match(html, /<title>scout school<\/title>/);
  assert.match(html, /<h1>scout school<\/h1>/);
  assert.doesNotMatch(html, /<title>names<\/title>/);
});

test("the scout page is returned only with its own cookie", async () => {
  const bindings = env();
  const cookie = await login(bindings);
  const response = await worker.fetch(request("/scout", cookie), bindings);

  assert.equal(response.status, 200);
  assert.equal(await response.text(), scoutPage);
  assert.match(response.headers.get("cache-control"), /private/);
});

test("private scout media never crosses the door without authentication", async () => {
  const response = await worker.fetch(request("/scout/media/taso-scout.webp"), env());

  assert.equal(response.status, 401);
  assert.match(response.headers.get("content-type"), /^text\/html/);
  assert.notEqual(await response.text(), "private portrait bytes");
});

test("authenticated scout media preserves bytes, type and private headers", async () => {
  const bindings = env();
  const cookie = await login(bindings);
  const response = await worker.fetch(request("/scout/media/taso-scout.webp", cookie), bindings);

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("content-type"), "image/webp");
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.match(response.headers.get("cache-control"), /private/);
  assert.equal(new TextDecoder().decode(await response.arrayBuffer()), "private portrait bytes");
});

test("private scout media supports HEAD and byte ranges for video playback", async () => {
  const bindings = env();
  const cookie = await login(bindings);

  const head = await worker.fetch(request("/scout/media/taso-scout.webp", cookie, {
    method: "HEAD",
  }), bindings);
  assert.equal(head.status, 200);
  assert.equal(head.headers.get("content-length"), String(portrait.byteLength));
  assert.equal((await head.arrayBuffer()).byteLength, 0);

  const range = await worker.fetch(request("/scout/media/taso-scout.webp", cookie, {
    headers: { range: "bytes=8-15" },
  }), bindings);
  assert.equal(range.status, 206);
  assert.equal(range.headers.get("content-range"), `bytes 8-15/${portrait.byteLength}`);
  assert.equal(range.headers.get("accept-ranges"), "bytes");
  assert.equal(new TextDecoder().decode(await range.arrayBuffer()), "portrait");
});

test("scout media rejects missing, malformed and traversal-shaped paths", async () => {
  const bindings = env();
  const cookie = await login(bindings);
  const paths = [
    "/scout/media/missing.webp",
    "/scout/media/taso-scout.webp/",
    "/scout/media/%2e%2e%2fscout%3apage",
    "/scout/media/TASO-SCOUT.WEBP",
  ];

  for (const path of paths) {
    const response = await worker.fetch(request(path, cookie), bindings);
    assert.equal(response.status, 404, path);
  }
});

test("scout media accepts only GET and HEAD", async () => {
  const bindings = env();
  const cookie = await login(bindings);
  const response = await worker.fetch(request("/scout/media/taso-scout.webp", cookie, {
    method: "PUT",
    body: "overwrite",
  }), bindings);

  assert.equal(response.status, 405);
  assert.equal(response.headers.get("allow"), "GET, HEAD");
});

