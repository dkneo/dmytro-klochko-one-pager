// The site is static assets and stays that way. This worker exists for one
// thing: the curation queue, which needs somewhere to put verdicts and a way
// to know they are his.
//
// Everything that is not /api/* is handed straight to the asset server, so a
// mistake in here cannot take the site down with it — the fallthrough is the
// first thing every path hits.
//
// Auth is Cloudflare Access. Access sits in front of /curate and /api/curate,
// authenticates by one-time code to his address, and passes a signed JWT in
// Cf-Access-Jwt-Assertion. This verifies that signature against his team's
// public keys. It is deliberately fail-closed: with ACCESS_TEAM_DOMAIN or
// ACCESS_AUD unset the curation routes answer 503 and nothing can be written.

const JSON_HEADERS = { "content-type": "application/json; charset=utf-8" };
const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });

// ── access ──────────────────────────────────────────────────────────────────

let certsCache = { at: 0, keys: null };

async function teamKeys(teamDomain) {
  const fresh = Date.now() - certsCache.at < 60 * 60 * 1000;
  if (fresh && certsCache.keys) return certsCache.keys;
  const r = await fetch(`https://${teamDomain}/cdn-cgi/access/certs`);
  if (!r.ok) throw new Error("certs " + r.status);
  const { keys } = await r.json();
  certsCache = { at: Date.now(), keys };
  return keys;
}

const b64url = (s) => {
  const pad = s.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(pad + "=".repeat((4 - (pad.length % 4)) % 4));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
};

/** Returns the caller's email, or null if the token is missing or bad. */
async function whoIsThis(request, env) {
  const token = request.headers.get("Cf-Access-Jwt-Assertion");
  if (!token) return null;
  const [h, p, s] = token.split(".");
  if (!h || !p || !s) return null;

  let head, claims;
  try {
    head = JSON.parse(new TextDecoder().decode(b64url(h)));
    claims = JSON.parse(new TextDecoder().decode(b64url(p)));
  } catch { return null; }

  const aud = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
  if (!aud.includes(env.ACCESS_AUD)) return null;
  if (typeof claims.exp === "number" && claims.exp * 1000 < Date.now()) return null;

  const keys = await teamKeys(env.ACCESS_TEAM_DOMAIN);
  const jwk = keys.find((k) => k.kid === head.kid);
  if (!jwk) return null;

  const key = await crypto.subtle.importKey(
    "jwk", jwk, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]
  );
  const ok = await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5", key, b64url(s), new TextEncoder().encode(`${h}.${p}`)
  );
  return ok ? (claims.email || "unknown") : null;
}

// ── the queue ───────────────────────────────────────────────────────────────

async function candidates(env) {
  // Shipped as a static asset so a batch is a commit, reviewable in git,
  // rather than something written into a database out of sight.
  const r = await env.ASSETS.fetch(new Request("https://x/inbox.json"));
  if (!r.ok) return [];
  const d = await r.json();
  return Array.isArray(d.candidates) ? d.candidates : [];
}


// ── /names ──────────────────────────────────────────────────────────────────
//
// A shared password, not an identity check: anyone he sends it to gets in.
// The folio is compiled into this bundle rather than shipped to dist/, so
// there is no file to fetch around the gate.
//
// The password itself is a worker secret. This repo is public, so it is never
// written down here. Missing secret means the door does not open at all.
//
// The cookie is an HMAC of a constant under the password, so it cannot be
// forged without knowing the password, and knowing the cookie does not reveal
// it. Path is / rather than /names because the teaching endpoints under
// /api/eidos need the same door; path is not a security boundary anyway, since
// any same-origin page can make the request either way.
//
// The folio itself lives in KV, not in this repo and not in dist/. That is
// forced by two facts at once: the repo is public, so the content cannot be
// committed, and a push to it triggers a build on cloudflare, so anything
// kept out of git cannot reach the worker through the pipeline either. KV is
// the one place that is both outside git and present at runtime. It also
// means editing the folio never needs a deploy.

const NAMES = /^\/names(?:\/|$)/i;
const COOKIE = "names_pass";

const hex = (buf) =>
  [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");

async function passToken(password) {
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(password),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  return hex(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode("names-v1")));
}

/** Length-independent compare, so a wrong guess leaks nothing by timing. */
function sameSecret(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const x = new TextEncoder().encode(a), y = new TextEncoder().encode(b);
  let diff = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) diff |= (x[i] ?? 0) ^ (y[i] ?? 0);
  return diff === 0;
}

function cookieValue(request, name) {
  const raw = request.headers.get("cookie");
  if (!raw) return null;
  for (const part of raw.split(";")) {
    const i = part.indexOf("=");
    if (i > -1 && part.slice(0, i).trim() === name) return part.slice(i + 1).trim();
  }
  return null;
}

const PRIVATE = {
  "content-type": "text/html; charset=utf-8",
  "cache-control": "private, no-store, must-revalidate",
  "x-robots-tag": "noindex, nofollow, noarchive",
  "referrer-policy": "no-referrer",
};

// Sizes are literals because this page is served by the worker and never
// loads the site's stylesheet, so there are no custom properties to read.
// Each one is a documented step from DESIGN.md typography: dream-display for
// the title, dream-prose for the input, dream-prose-sm and t-sm below it.
function door(message, action = "/names") {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>names</title><style>
:root{--void:#262b44;--bone:#ece6d9;--hot:#ff9bc0;--quiet:#c4beb0}
*{box-sizing:border-box}
body{margin:0;min-height:100svh;display:grid;place-items:center;padding:2rem;
background:var(--void);color:var(--bone);
font-family:Georgia,'Times New Roman',serif;-webkit-font-smoothing:antialiased}
main{width:100%;max-width:26rem}
h1{margin:0;font-size:clamp(2rem,3.4vw,2.9rem);font-weight:400;letter-spacing:-.02em}
p{margin:.6rem 0 2rem;color:var(--quiet);font-size:1rem;line-height:1.6}
form{display:flex;gap:.6rem;align-items:center;flex-wrap:wrap}
input{flex:1 1 12rem;min-width:0;padding:.6rem 0;background:none;border:0;
border-bottom:1px solid rgb(236 230 217 / 46%);color:var(--bone);
font-family:inherit;font-size:1.13rem}
input:focus{outline:none;border-bottom-color:var(--hot)}
button{padding:.45rem 1.1rem;background:none;border:1px solid rgb(236 230 217 / 34%);
border-radius:999px;color:var(--hot);cursor:pointer;
font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.75rem;
letter-spacing:.14em;text-transform:uppercase;
transition:border-color 200ms cubic-bezier(.2,0,.2,1),scale 90ms cubic-bezier(.2,0,.2,1)}
button:hover{border-color:rgb(255 155 192 / 45%)}
button:active{scale:.97}
b{display:block;margin-top:1.4rem;color:var(--hot);font-weight:400;font-size:1rem}
a{color:var(--quiet);font-size:.875rem;display:inline-block;margin-top:2.5rem}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
</style></head><body><main>
<h1>names</h1>
<p>nineteen of them, considered as atmosphere. this one is not public yet.</p>
<form method="post" action="${action}">
<input type="password" name="password" autocomplete="current-password"
 aria-label="password" autofocus required>
<button type="submit">come in</button>
</form>
${message ? `<b>${message}</b>` : ""}
<a href="/">back to the main page</a>
</main></body></html>`;
}

async function names(request, env, url) {
  // Never echo the raw path back into the page or a Location header. URL
  // parsing already escapes quotes, but the door only ever points at one of
  // two known places, so say so rather than trust the encoding.
  const p = url.pathname.toLowerCase().replace(/\/+$/, "");
  const where = p === "/names/old" ? "/names/old" : "/names";

  if (!env.NAMES_PASSWORD) {
    return new Response(door("the door is not configured yet."), { status: 503, headers: PRIVATE });
  }
  const good = await passToken(env.NAMES_PASSWORD);

  if (request.method === "POST") {
    const form = await request.formData().catch(() => null);
    const tried = form && form.get("password");
    if (sameSecret(String(tried ?? ""), env.NAMES_PASSWORD)) {
      return new Response(null, {
        status: 303,
        headers: {
          location: where,
          "set-cookie": `${COOKIE}=${good}; Path=/; Max-Age=${60 * 60 * 24 * 30}; HttpOnly; Secure; SameSite=Lax`,
          ...PRIVATE,
        },
      });
    }
    // A wrong guess costs a moment, so the door is not worth grinding on.
    await new Promise((r) => setTimeout(r, 700));
    return new Response(door("that is not it.", where), { status: 401, headers: PRIVATE });
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response("method not allowed", { status: 405, headers: { allow: "GET, HEAD, POST" } });
  }

  if (sameSecret(cookieValue(request, COOKIE) || "", good)) {
    // Two volumes, one door. Anything else under /names is nothing.
    const path = url.pathname.toLowerCase().replace(/\/+$/, "");
    // /names/ii was live for a while, so it redirects rather than breaking
    // for anyone holding the link.
    if (path === "/names/ii") {
      return new Response(null, { status: 301, headers: { location: "/names", ...PRIVATE } });
    }
    const key = path === "/names" ? "names:folio"
      : path === "/names/old" ? "names:folio-old"
      : null;
    if (!key) return new Response("no such page", { status: 404, headers: PRIVATE });

    const folio = env.VAULT && (await env.VAULT.get(key, { type: "text", cacheTtl: 60 }   // a folio edit should show up in a minute, not an hour));
    if (!folio) {
      return new Response(door("the folio is not loaded yet."), { status: 503, headers: PRIVATE });
    }
    return new Response(folio, { status: 200, headers: PRIVATE });
  }
  return new Response(door("", where), { status: 401, headers: PRIVATE });
}


// ── /api/eidos ──────────────────────────────────────────────────────────────
//
// Three endpoints behind the door he already has. Writes use the /names
// cookie rather than Cloudflare Access, because Access is still unconfigured
// and a teaching loop nobody can use teaches nothing. Reads are open: the map
// itself is public.
//
// Asking costs money, so it needs his own key as a secret. Without it the
// endpoint says so plainly rather than pretending to think.

const EIDOS_SYSTEM = `You are the map of one person's taste, speaking for itself.

You are given every note in his vault: paintings, poems, songs, quotes and
links, each filed under one of eight "weathers" he invented — cold clarity,
dissolution, invincible summer, nerve, the dark and the lamp, the plain thing,
vastness, weight and grace.

Rules, in order:
1. Answer only from the notes. If the notes do not support an answer, say you
   do not know, and say what would have to be added for you to know.
2. Never invent a work, a person, or a preference he has not shown.
3. When you suggest something new, mark it clearly as a guess and say which
   notes it is a guess from.
4. Write the way the notes are written: lowercase, plain, no dashes, no
   flattery, short. Three sentences unless more is genuinely needed.`;

async function eidosAsk(request, env) {
  if (!env.ANTHROPIC_API_KEY) {
    return json({ error: "the map cannot talk yet: no api key is set. run wrangler secret put ANTHROPIC_API_KEY." }, 503);
  }
  let q = "";
  try { ({ q } = await request.json()); } catch { return json({ error: "bad json" }, 400); }
  if (!q || typeof q !== "string" || q.length > 600) return json({ error: "ask something shorter" }, 400);

  const asset = await env.ASSETS.fetch(new Request("https://x/map.json"));
  if (!asset.ok) return json({ error: "the map data is not published" }, 503);
  const m = await asset.json();

  // The whole vault fits in a prompt, so it goes in whole rather than being
  // retrieved in pieces: forty five notes is smaller than any embedding index
  // would be, and nothing gets missed.
  const notes = m.items.map((i) =>
    `- ${i.type} | ${i.weather || "unplaced"} | ${i.who || "unknown"} | ${i.line || i.title}${i.note ? " | " + i.note : ""}`
  ).join("\n");
  const weathers = m.weathers.map((w) => `- ${w.name}: ${w.why} (${w.count} notes)`).join("\n");

  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-5",
      max_tokens: 600,
      system: EIDOS_SYSTEM,
      messages: [{ role: "user", content: `The eight weathers:\n${weathers}\n\nEvery note:\n${notes}\n\nHis question: ${q}` }],
    }),
  });
  if (!r.ok) {
    const detail = await r.text().catch(() => "");
    return json({ error: `the model refused: ${r.status}`, detail: detail.slice(0, 200) }, 502);
  }
  const d = await r.json();
  const answer = (d.content || []).filter((c) => c.type === "text").map((c) => c.text).join("").trim();
  return json({ answer: answer || "no answer came back." });
}

/** What he has already judged, so the page stops offering it. */
async function eidosJudged(env) {
  if (!env.VAULT) return json({ judged: [] });
  const seen = (await env.VAULT.get("eidos:verdicts", "json")) || {};
  return json({ judged: Object.keys(seen) });
}

/** The latest reading the deck produced, so the map can show it. */
async function eidosPortrait(env) {
  if (!env.VAULT) return json({ runs: 0 });
  const runs = (await env.VAULT.get("eidos:portrait", "json")) || [];
  return json({ runs: runs.length, latest: runs[runs.length - 1] || null });
}

/** Teaching writes: same shared password as the folio. */
async function eidosWrite(request, env, url) {
  if (!env.NAMES_PASSWORD) return json({ error: "the door is not configured" }, 503);
  if (!env.VAULT) return json({ error: "no kv binding" }, 503);
  const good = await passToken(env.NAMES_PASSWORD);
  if (!sameSecret(cookieValue(request, COOKIE) || "", good)) {
    return json({ error: "not signed in. open /names first." }, 401);
  }
  let body;
  try { body = await request.json(); } catch { return json({ error: "bad json" }, 400); }

  const now = new Date().toISOString();
  if (url.pathname.endsWith("/place")) {
    const { id, weather } = body || {};
    if (!id || !weather) return json({ error: "id and weather required" }, 400);
    const all = (await env.VAULT.get("eidos:placed", "json")) || {};
    all[id] = { weather, at: now };
    await env.VAULT.put("eidos:placed", JSON.stringify(all));
    return json({ ok: true, placed: Object.keys(all).length });
  }
  if (url.pathname.endsWith("/verdict")) {
    const { id, verdict, weather } = body || {};
    if (!id || (verdict !== "keep" && verdict !== "pass")) {
      return json({ error: "id and verdict:keep|pass required" }, 400);
    }
    const seen = (await env.VAULT.get("eidos:verdicts", "json")) || {};
    seen[id] = { verdict, weather: weather || "", at: now };
    await env.VAULT.put("eidos:verdicts", JSON.stringify(seen));
    const kept = Object.values(seen).filter((v) => v.verdict === "keep").length;
    return json({ ok: true, judged: Object.keys(seen).length, kept });
  }
  if (url.pathname.endsWith("/portrait")) {
    const { axes, kept, seen } = body || {};
    if (!axes || typeof axes.calm !== "number") return json({ error: "axes required" }, 400);
    const runs = (await env.VAULT.get("eidos:portrait", "json")) || [];
    runs.push({ axes, kept: kept || 0, seen: seen || 0, at: now });
    await env.VAULT.put("eidos:portrait", JSON.stringify(runs.slice(-50)));
    return json({ ok: true, runs: runs.length });
  }
  if (url.pathname.endsWith("/pair")) {
    const { weather, winner, pair } = body || {};
    if (!weather || !winner || !Array.isArray(pair)) return json({ error: "weather, winner and pair required" }, 400);
    const all = (await env.VAULT.get("eidos:pairs", "json")) || [];
    all.push({ weather, winner, pair, at: now });
    await env.VAULT.put("eidos:pairs", JSON.stringify(all.slice(-2000)));
    return json({ ok: true, answered: all.length });
  }
  return json({ error: "no such route" }, 404);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // The folio, behind its shared password. Checked before the asset
    // fallthrough and matching the whole /names subtree, so nothing under it
    // can be reached another way.
    if (NAMES.test(url.pathname)) return names(request, env, url);

    // The map: asking is a read, placing and pairing are writes.
    if (url.pathname === "/api/eidos/ask" && request.method === "POST") return eidosAsk(request, env);
    if (url.pathname === "/api/eidos/judged" && request.method === "GET") return eidosJudged(env);
    if (url.pathname === "/api/eidos/portrait" && request.method === "GET") return eidosPortrait(env);
    if (url.pathname.startsWith("/api/eidos/") && request.method === "POST") return eidosWrite(request, env, url);

    // Anything that is not the curation api is the site.
    if (!url.pathname.startsWith("/api/curate")) {
      return env.ASSETS.fetch(request);
    }

    if (!env.ACCESS_TEAM_DOMAIN || !env.ACCESS_AUD) {
      return json({ error: "curation is not configured", need: ["ACCESS_TEAM_DOMAIN", "ACCESS_AUD"] }, 503);
    }
    if (!env.VAULT) {
      return json({ error: "no kv binding" }, 503);
    }

    let email;
    try {
      email = await whoIsThis(request, env);
    } catch (e) {
      return json({ error: "access check failed" }, 503);
    }
    if (!email) return json({ error: "not you" }, 403);
    if (env.CURATOR && email.toLowerCase() !== env.CURATOR.toLowerCase()) {
      return json({ error: "not you" }, 403);
    }

    // GET  /api/curate/queue    what is left to judge
    if (request.method === "GET" && url.pathname.endsWith("/queue")) {
      const all = await candidates(env);
      const seen = await env.VAULT.get("verdicts", "json") || {};
      const left = all.filter((c) => !seen[c.id]);
      return json({ total: all.length, judged: Object.keys(seen).length, queue: left });
    }

    // POST /api/curate/verdict  { id, verdict: "keep" | "pass", note? }
    if (request.method === "POST" && url.pathname.endsWith("/verdict")) {
      let body;
      try { body = await request.json(); } catch { return json({ error: "bad json" }, 400); }
      const { id, verdict, note } = body || {};
      if (!id || (verdict !== "keep" && verdict !== "pass")) {
        return json({ error: "id and verdict:keep|pass required" }, 400);
      }
      const seen = await env.VAULT.get("verdicts", "json") || {};
      seen[id] = { verdict, note: note || "", at: new Date().toISOString(), by: email };
      await env.VAULT.put("verdicts", JSON.stringify(seen));
      return json({ ok: true, judged: Object.keys(seen).length });
    }

    // GET /api/curate/verdicts  everything judged so far, for pulling into the vault
    if (request.method === "GET" && url.pathname.endsWith("/verdicts")) {
      return json(await env.VAULT.get("verdicts", "json") || {});
    }

    return json({ error: "no such route" }, 404);
  },
};
