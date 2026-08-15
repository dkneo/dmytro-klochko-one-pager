# Switching the curation queue on

`/curate` is built and deployed and currently answers *"curation is not
configured"*, on purpose. It fails closed: with no Access application in front
of it, nothing can be read and nothing can be written.

Three steps, and only you can do them — they need your Cloudflare account, and
the sign-in is between you and Cloudflare. No password ever passes through me.

## 1. Turn on Zero Trust

Cloudflare dashboard → **Zero Trust**. If it asks you to pick a team name, pick
one; it becomes `<team>.cloudflareaccess.com`, and that string is the
`ACCESS_TEAM_DOMAIN` below. The free plan covers up to 50 users.

## 2. Add an application

Zero Trust → **Access → Applications → Add an application → Self-hosted**.

- **Name**: curate
- **Session duration**: whatever suits; a week is fine
- **Public hostname**: `dmklochko.com`, path `curate`
- **Add another**: `dmklochko.com`, path `api/curate` — this one matters. The
  page is only html; the queue is the api, and it is the api that needs the
  gate.

Policy:

- **Action**: Allow
- **Include**: Emails → `1@dmklochko.com`

Save. Cloudflare shows an **Application Audience (AUD) tag** — a long hex
string. That is `ACCESS_AUD`.

## 3. Give the worker the two values

Neither is a secret; they are public identifiers. Put them in
`wrangler.jsonc`:

```jsonc
"vars": {
  "ACCESS_TEAM_DOMAIN": "yourteam.cloudflareaccess.com",
  "ACCESS_AUD": "the-long-hex-string",
  "CURATOR": "1@dmklochko.com"
}
```

Then `npx wrangler deploy`. Or send me the two strings and I will.

After that, opening `/curate` prompts Cloudflare for a one-time code to your
address, and the queue appears. Anyone else gets Cloudflare's login wall on the
page and `403 not you` from the api, because the worker verifies the signature
on the Access token rather than trusting the header.

## The loop, end to end

1. **A batch arrives.** Candidates are swept from museum APIs into
   `public/inbox.json` with their images in `public/images/inbox/`. A batch is
   a commit, so it is reviewable in git before you ever see it.
2. **You judge them** at `/curate`. Keep or pass, arrow keys or buttons. Each
   verdict is a `POST` to the worker, stored in KV under `verdicts`.
3. **The keeps become vault markdown**:

   ```bash
   npx wrangler kv key get verdicts --binding VAULT --remote > /tmp/verdicts.json
   node scripts/vault-pull.mjs /tmp/verdicts.json
   npm run build
   ```

   Kept paintings move out of `images/inbox/` into `images/today/` and gain a
   markdown note in `vault/paintings/`. Passed ones stay where they are and are
   never served.

4. **`/today` and `/map` redraw themselves** from the vault on the next build.

Nothing reaches the site that you have not kept. That is the same rule as
"derive, never invent", applied to curation.

## Daily batches

Not wired yet, and it needs a scheduled agent in the cloud rather than a cron
on a laptop that sleeps. Worth doing once a few batches have been judged by
hand and we know what a good candidate looks like — automating a taste loop
before that produces volume, not taste.
