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

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

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
