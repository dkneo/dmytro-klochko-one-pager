import assert from "node:assert/strict";
import test from "node:test";

import worker from "../worker/index.js";

// The inbox: where he throws links. Same door as every other eidos write,
// a page read once, a record in KV, a swipe later. These cover the shape of
// the door and the reading, not the model, which is absent unless a key is.

function env(store = {}) {
  return {
    NAMES_PASSWORD: "test-names-password",
    VAULT: {
      async get(key, type) {
        const v = store[key];
        if (v == null) return null;
        return type === "json" ? JSON.parse(v) : v;
      },
      async put(key, value) { store[key] = value; },
    },
    ASSETS: { fetch: () => new Response("asset", { status: 200 }) },
    _store: store,
  };
}

async function login(bindings) {
  const body = new FormData();
  body.set("password", "test-names-password");
  const r = await worker.fetch(new Request("https://dmklochko.com/names", { method: "POST", body }), bindings);
  assert.ok(r.status === 303 || r.status === 200, `login returned ${r.status}`);
  const cookie = r.headers.get("set-cookie");
  assert.ok(cookie, "the door set no cookie");
  return cookie.split(";", 1)[0];
}

test("the sitting's old address walks you to the inbox", async () => {
  const r = await worker.fetch(new Request("https://dmklochko.com/eidos/sit"), env());
  assert.equal(r.status, 301);
  assert.equal(new URL(r.headers.get("location")).pathname, "/eidos/inbox");
  const slash = await worker.fetch(new Request("https://dmklochko.com/eidos/sit/"), env());
  assert.equal(slash.status, 301);
});

test("the inbox is his: adding and listing both need the door", async () => {
  const bindings = env();
  const add = await worker.fetch(new Request("https://dmklochko.com/api/eidos/bookmark", {
    method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ url: "https://example.com/a" }),
  }), bindings);
  assert.equal(add.status, 401);
  const list = await worker.fetch(new Request("https://dmklochko.com/api/eidos/bookmarks"), bindings);
  assert.equal(list.status, 401);
  assert.equal(bindings._store["eidos:bookmarks"], undefined, "nothing was written behind a shut door");
});

test("the inbox will not read our own network for a stranger", async () => {
  const bindings = env();
  const cookie = await login(bindings);
  for (const url of ["http://127.0.0.1/admin", "http://10.0.0.4/", "http://192.168.1.1/", "http://localhost:8787/", "ftp://example.com/x", "not a url"]) {
    const r = await worker.fetch(new Request("https://dmklochko.com/api/eidos/bookmark", {
      method: "POST", headers: { "content-type": "application/json", cookie }, body: JSON.stringify({ url }),
    }), bindings);
    assert.equal(r.status, 400, `${url} should be refused`);
  }
});

test("a thrown link is read once and kept with what a card needs", async () => {
  const bindings = env();
  const cookie = await login(bindings);
  const realFetch = globalThis.fetch;
  let reads = 0;
  globalThis.fetch = async (input, init) => {
    const u = typeof input === "string" ? input : (input.url || String(input));
    if (u.startsWith("https://craigmod.com/")) {
      reads++;
      return new Response(`<!doctype html><html><head>
        <title>Ridgeline — Craig Mod</title>
        <meta property="og:title" content="Ridgeline">
        <meta name="description" content="Walking Japan, weekly.">
        <meta property="og:image" content="/images/ridgeline.jpg">
        <meta name="author" content="Craig Mod">
        </head><body><nav>menu</nav><p>A newsletter about walking.</p></body></html>`,
        { status: 200, headers: { "content-type": "text/html; charset=utf-8" } });
    }
    return realFetch(input, init);
  };
  try {
    const r = await worker.fetch(new Request("https://dmklochko.com/api/eidos/bookmark", {
      method: "POST", headers: { "content-type": "application/json", cookie },
      body: JSON.stringify({ url: "https://craigmod.com/ridgeline/#top", note: "for the walks" }),
    }), bindings);
    assert.equal(r.status, 200);
    const d = await r.json();
    assert.ok(d.ok && d.id.startsWith("bm-"), "no id came back");
    assert.equal(d.summarised, false, "no key, so no summary, and it says so");
    const b = d.bookmark;
    assert.equal(b.title, "Ridgeline");
    assert.equal(b.site, "craigmod.com");
    assert.equal(b.description, "Walking Japan, weekly.");
    assert.equal(b.image, "https://craigmod.com/images/ridgeline.jpg", "a relative og:image is made absolute");
    assert.equal(b.who, "Craig Mod");
    assert.equal(b.note, "for the walks");
    assert.equal(b.url, "https://craigmod.com/ridgeline/", "the fragment is dropped");
    assert.match(b.excerpt, /walking/i, "a short excerpt of the body is kept for the card");
    assert.doesNotMatch(b.excerpt, /menu/, "navigation is stripped from the excerpt");
    assert.ok(b.excerpt.length <= 300, "the excerpt is a taste, not the page");

    // the same link again is the same record, not a second read
    const again = await worker.fetch(new Request("https://dmklochko.com/api/eidos/bookmark", {
      method: "POST", headers: { "content-type": "application/json", cookie }, body: JSON.stringify({ url: "https://craigmod.com/ridgeline/" }),
    }), bindings);
    const d2 = await again.json();
    assert.equal(d2.already, true);
    assert.equal(d2.id, d.id);
    assert.equal(reads, 1, "the page was read once");

    // and the list sees it, unjudged, with the key's absence declared
    const list = await (await worker.fetch(new Request("https://dmklochko.com/api/eidos/bookmarks", { headers: { cookie } }), bindings)).json();
    assert.equal(list.bookmarks.length, 1);
    assert.equal(list.bookmarks[0].verdict, "");
    assert.equal(list.canSummarise, false);
  } finally {
    globalThis.fetch = realFetch;
  }
});

test("a harvested read's summary is behind the door, and cached once it exists", async () => {
  const bindings = env();
  // shut door: nothing is read, nothing is written
  const shut = await worker.fetch(new Request("https://dmklochko.com/api/eidos/summary", {
    method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ url: "https://example.com/essay" }),
  }), bindings);
  assert.equal(shut.status, 401);
  assert.equal(bindings._store["eidos:summaries"], undefined);

  const cookie = await login(bindings);
  // not a link it can read
  const bad = await worker.fetch(new Request("https://dmklochko.com/api/eidos/summary", {
    method: "POST", headers: { "content-type": "application/json", cookie }, body: JSON.stringify({ url: "not a url" }),
  }), bindings);
  assert.equal(bad.status, 400);

  // a summary already made is served from the cache without touching the network
  const key = "sum-" + Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode("https://example.com/essay"))))
    .map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 12);
  bindings._store["eidos:summaries"] = JSON.stringify({ [key]: { summary: "two plain sentences.", tags: ["craft"], title: "An essay", at: "2026-09-04T00:00:00Z" } });
  globalThis.fetch = () => { throw new Error("the cache should have answered; the network was asked"); };
  try {
    const hit = await worker.fetch(new Request("https://dmklochko.com/api/eidos/summary", {
      method: "POST", headers: { "content-type": "application/json", cookie }, body: JSON.stringify({ url: "https://example.com/essay" }),
    }), bindings);
    assert.equal(hit.status, 200);
    const j = await hit.json();
    assert.equal(j.summary, "two plain sentences.");
    assert.equal(j.cached, true);
  } finally { delete globalThis.fetch; }
});
