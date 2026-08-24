# Working on dmklochko.com

For any agent picking this repo up. Read this first, then `CHECKLIST.md`
(taste), `DESIGN.md` (tokens), `CURATION.md` (the vault's rules).

The site belongs to **Dmytro Klochko**, CEO of Replika. Audience is VCs,
scouts and tech-Twitter. Everything on it is either true or removed.

---

## 1. What it is

Astro static build → `dist/` → Cloudflare Workers (static assets **plus** a
worker script). No framework beyond Astro. No client JS framework. Vanilla JS
in `<script>` tags where a page needs behaviour.

```
src/pages/       one .astro file per URL
src/layouts/     Layout.astro — header, footer, scenes, tone toggle
src/styles/      global.css (base) + dream.css (~5300 lines, all the skin)
src/data/        json the pages import at build time
vault/           markdown: the source of truth for /today and /eidos
scripts/         build steps and pull scripts (see §6)
worker/index.js  the only server code: gates and APIs
public/          static assets, copied verbatim
```

**Build chain** (`npm run build`):

```
vault-build.mjs → map-build.mjs → image-build.mjs --check → astro build → sitemap-build.mjs
```

`vault-build` compiles `vault/**` into `src/data/today.json`. `map-build`
compiles it into `src/data/map.json` **and** `public/map.json` (the worker
reads the second one to answer questions). Never edit those two json files by
hand; edit the markdown and rebuild.

---

## 2. Deploying — read this before you touch anything

There are two deploy paths and **they fight**:

1. `npx wrangler deploy` — pushes your local `dist/` immediately.
2. **Pushing to GitHub** — CI builds from the repo and deploys ~1 minute later,
   **overwriting whatever wrangler just put there.**

So: **always commit and push.** A wrangler deploy without a push gets reverted
by the next CI run. If you deploy and don't push, the site silently rolls back.

`npx wrangler deploy` needs `dangerouslyDisableSandbox: true` in this
environment.

Verify **after CI has run**, not after your own deploy. The pattern used
throughout the history:

```bash
npx wrangler deployments status   # note the version, poll until it changes
```

Then check every page matches the local build:

```bash
for f in $(find dist -name index.html | sed 's|dist||;s|/index.html|/|'); do
  curl -s -o /tmp/l -w "%{http_code} $f\n" "https://dmklochko.com$f"
  cmp -s /tmp/l "dist${f}index.html" || echo "DIFFERS $f"
done
```

---

## 3. Content that is **not** in git

This trips up everyone. Some content lives in Cloudflare KV, not the repo.

| what | where | why |
|---|---|---|
| the names folio (`/names`) | KV `names:folio` | repo is public; the folio isn't |
| the earlier folio (`/names/old`) | KV `names:folio-old` | same |
| Stella's requests (`/ask`) | KV `ask:requests` | append-only log |
| scout school (`/scout`) | KV `scout:page` | source: `contents/scout-school.html` |
| scout images & film clips | KV `scout:media:<name>.<ext>` | served by the worker with Range support; webp/png/jpg/mp4 only — **no gif**, so "make a gif" means an **animated webp** (`ffmpeg` frames → `img2webp -lossy`; it is **lossless by default** and 15× the size if you forget the flag) |
| taste verdicts / pairs / portrait | KV `eidos:*` | written by the live page |
| raw source material | `/contents/`, `/updated-media/` | **gitignored** |

KV namespace id: `d5e466fe143e4b8aadce72dd01da4507` (binding `VAULT`).

```bash
npx wrangler kv key list   --namespace-id=<ns> --remote
npx wrangler kv key get    --namespace-id=<ns> "names:folio" --remote
npx wrangler kv key put    --namespace-id=<ns> "names:folio" --path=<file> --remote
```

**Editing the folio is a KV write, not a commit.** `git status` staying clean
after a folio change is correct, not a bug. The source file lives at
`contents/updated media/poetic-name-folio.html`, which is gitignored, so it
exists **only on his machine** — treat it as precious.

---

## 4. The worker: gates and APIs

`worker/index.js` is the only server code. Everything not matched falls
through to `env.ASSETS.fetch(request)`, so a mistake in there cannot take the
static site down.

**Three separate doors, three different passwords. Never merge them.**

| route | secret | who |
|---|---|---|
| `/names`, `/names/old` | `NAMES_PASSWORD` | shared with people choosing a name |
| `/ask`, `/api/ask/*` | `ASK_PASSWORD` | his assistant only |
| `/scout` | `SCOUT_PASSWORD` | Taso — the UGC scouting program |
| `/curate`, `/api/curate/*` | Cloudflare Access | him only — **not configured yet** |
| `/api/eidos/*` writes | reuses `NAMES_PASSWORD` | low stakes teaching loop |
| `/api/eidos/ask` | `ANTHROPIC_API_KEY` | **not set** — returns 503 by design |

Passwords are **Worker secrets and never in the repo** (it's public). Set with
`npx wrangler secret put NAME`. Cookies are an HMAC of a constant under the
password: unforgeable, and holding one doesn't reveal the password.

**The trap that bit us:** Cloudflare serves static assets **before** the worker
runs. A page built into `dist/` is fetchable directly and your gate never
executes. `/ask` was returning 200 to anyone until `run_worker_first` was added
in `wrangler.jsonc`. Two safe patterns:

- keep the content **out of `dist`** entirely (the folio, in KV), or
- add the path to `assets.run_worker_first` (what `/ask` does).

**Always test the bypass**, not just the happy path: `/x`, `/x/`,
`/x/index.html`, `/X`, `/x/anything`.

---

## 5. His taste — the short version

`CHECKLIST.md` is the full list and every design change gets argued against
it. The rules that get violated most:

- **Never invent art.** No ASCII, no drawn SVG icons, no generated
  landscapes — rejected five separate times. Derive from his own paintings,
  his photographs, or real public-domain work (Commons, museums). Generated
  *particles* (falling petals, glints) are fine and he loves them; generated
  *artwork* is not.
- **No large empty space that gives nothing.** Measure fill: a section that is
  under ~60% occupied by content is a defect. His words: "85% NOTHING".
- **No cream/white panels as a readability fix.** The approved answer is
  smoked glass — dim the painting, never paint over it.
- **No em-dashes in prose.** Date ranges and verbatim quotes are exempt.
- **Lowercase, first person.** The site says "i", never "he". Getting this
  wrong on /press was a real complaint.
- Loves: his art full-bleed, pink (`#ff9bc0`), sharpness, quiet ~40rem column,
  serif for sentences / mono for machinery, micro-interactions, falling things.

**Writing rules:** verb-first, no hedging, no invented storytelling, every
claim traceable. If you can't verify it, don't write it.

---

## 6. Scripts

```
vault-build.mjs    vault/**        → src/data/today.json     (build step)
map-build.mjs      vault/**        → src/data/map.json       (build step)
image-build.mjs    tracked images  → responsive copies       --apply to write
sitemap-build.mjs  dist/**         → dist/sitemap.xml        (build step)
harvest.mjs        the site itself → proposes vault notes     --apply to write
candidates.mjs     Wikimedia       → public/inbox.json        --apply to write
eidos-pull.mjs     KV              → vault markdown           --apply to write
ask-pull.mjs       KV              → prints Stella's requests; moves status
press-logos.mjs    Commons         → src/data/press-logos.json
pond-assets.mjs    Commons         → public/images/pond/
```

Every script that writes is **dry-run by default** and needs `--apply`. Keep
it that way.

### The taste loop, end to end

The one workflow that spans all of them. It only moves when he judges, which
is what `/eidos/sit` exists to make cheap:

1. `node scripts/candidates.mjs --apply` — Wikimedia, public domain only,
   aimed at the weathers thinnest **on the map**. Four search terms per
   weather; one search yields at most one candidate, so fewer terms leaves
   whole weathers empty.
2. He sits at `/eidos/sit`: right is his, left is not, seven is a sitting.
   Verdicts land in KV under `eidos:verdicts`, behind the `/names` door.
3. `node scripts/eidos-pull.mjs --apply` — turns keeps into vault notes. A
   remote candidate has its picture **brought home** here (fetched, tracking
   params dropped, webp at 1600 wide, into `public/images/vault/`), because
   `vault-build` throws on a painting that is not on disk.
4. `node scripts/image-build.mjs --apply` — the new paintings need thumbnails
   before the map can show them. `npm run build` runs `--check` and **fails**
   if they are missing, which is the intended alarm, not a bug.
5. Commit. The vault is git; the map rebuilds from it.

`scripts/lib/` holds the two pieces of that pipeline worth testing on their
own: `attribution.mjs` (Commons names arrive wearing catalogue clothes) and
`vault-note.mjs` (three builds read the shape of a note and none forgive a
surprise).

---

## 7. Verifying — this environment lies to you

Hard-won and non-obvious. Ignoring these produces confident wrong conclusions:

- **Verify against built `dist/`** on `python3 -m http.server 4399 -d dist`.
  The vite dev server has served 500s mid-recompile and poisoned screenshots.
- **The embedded browser pane freezes CSS transitions and rAF.** An element
  mid-transition reads as its *start* value. To test a state, inject
  `*{transition:none!important}` first. I twice "found" bugs that were only
  frozen transitions.
- **The pane reports `innerWidth: 0`.** Any measurement using it is garbage.
  Measure inside an iframe with explicit width instead.
- **Screenshots of scene pages come out black** — the fixed backdrop-filter
  layers don't composite. Trust DOM measurement over screenshots there.
- **An `opacity: 0.01` iframe does not lay out**; every rect returns 0. Use a
  visible iframe with `transform: scale()`.
- **Sections use `svh` units**, so resizing an iframe reflows everything and
  moves what you were measuring. Shift with `transform: translateY()` instead
  of changing height.
- **A pipe eats the exit code.** `node --test ... | tail && git push` pushed a
  red suite: the chain saw tail's exit 0, not the test runner's 1. This has now
  hidden a failure twice (a worker syntax error before, a stale test here).
  Ship steps run separately, capture output to a file, and check `$?` bare.
- **`scroll-behavior: smooth` stalls in the pane** for the same reason the
  transitions freeze: the animation clock is suspended. `scrollIntoView()`
  moves a few hundred pixels and stops, which looks exactly like a broken
  scroll container. Pass `{behavior: "instant"}` when driving the pane;
  suspect this before suspecting the page.
- Astro **collapses whitespace** around `{expr}` **and around inline tags on
  their own source line**. `needs\n<b>a bit of ui</b>` renders as
  "needsa bit of ui". This has bitten four times.
  **Do not fix it with `{" "}` in lists** — use `display:flex; gap:` on the
  container, so the layout does not depend on source whitespace at all. That
  is what `.learn-queue li` does.
  To find them, render the page and look for an inline element whose left edge
  touches the previous text on the same line. A static scan of the HTML
  over-reports badly: block-level children look joined in the markup and are
  fine on screen. Check the rendered geometry, not the string.

### The CSS mistake made three times

Removing a rule with a regex and leaving the **selector** behind:

```css
.hero-line a,          /* body eaten, selector left */
.next-rule { ... }     /* now silently applies to .hero-line a too */
```

It has swallowed `display:grid` and tinted a whole section. After any
programmatic CSS removal, scan for bodyless selectors and check brace balance.

### Accessibility floors, enforced

- Text contrast **≥ 4.5:1** measured against the *actual* composited backdrop
  (sample the scene image, apply the glass filter, then compute). The glass is
  `brightness(0.32)`; `--faint` (#7d82a6) is **not a text colour** — it cannot
  clear 4.5:1 over any of the ten skies. Use `--dim` or `--quiet`.
- Standalone tap targets **≥ 24px**. Links inline in a sentence are exempt and
  should be left alone.
- No horizontal overflow at 390 and 1366.

---

## 8. How we work

- **Take the shortest connected path first.** Before asking Dmytro to paste a
  log, sign in manually, run a terminal command, or ferry data between tools,
  check the native tools, installed plugins and recommended plugins available
  to the task. If the exact service has a plugin or MCP, connect and use it.
  Prefer, in order: service connector/MCP, authenticated CLI or API, signed-in
  browser, then manual user handoff. Manual work is the last resort, not the
  first response to a sandbox or authentication error.
- **Cloudflare work starts with the Cloudflare plugin.** Use its official MCP
  for build status, build logs, deployments, account data and other live
  Cloudflare state. Use Wrangler when it is the better operation or the MCP
  lacks the capability. Do not ask for copied Cloudflare logs until both paths
  have been checked.
- **Think in shortcuts.** A local restriction does not mean the task is
  blocked. Look for a native app action, connector, MCP, authenticated CLI,
  existing signed-in browser, or small repo script that reaches the same
  outcome safely. State exactly which paths were checked before escalating.
- **Measure, don't assert.** Every claim in the commit log has a number behind
  it. "It looks fine" has been wrong repeatedly.
- **Look at the page before saying it's done.** A structural check passing is
  not the same as the page rendering. He has caught this.
- **Never fabricate his data.** Test writes to KV (taste verdicts, requests)
  get deleted afterwards. His taste data must contain none of ours.
- **Say what didn't work.** Failed deploys, skipped steps and wrong turns go in
  the commit message and the reply.
- Commit messages are lowercase prose explaining *why*, including the mistakes.
  Read `git log` for the register.

---

## 9. Where things are

| url | what |
|---|---|
| `/` | the main page: CV, work, photographs, poems |
| `/press` | 29 verified press pieces, wordmarks, real quotes, contacts |
| `/today` | a daily chord: painting, poem, quote, song, by "weather" |
| `/eidos` | the taste map, 64 marks; `/eidos/deck` is the swipe deck |
| `/hokku` | write a haiku, reviewed by rule |
| `/learning` | what he's studying, plus `/learning/ui-vernacular` |
| `/basho` | a hosted essay |
| `/names` | **gated** — the naming folio + the app brief |
| `/ask` | **gated, separate password** — the request desk |
| `/curate`, `/vault`, `/map` | curation tooling, noindex |

The **weathers** are his taxonomy and the spine of the vault: cold clarity,
dissolution, invincible summer, nerve, the dark and the lamp, the plain thing,
vastness, weight and grace. Everything is filed by feeling, not by kind.

---

## 10. Open threads

- `ANTHROPIC_API_KEY` unset, so "ask the map" on `/eidos` returns 503.
- Cloudflare Access unconfigured, so `/curate` is unreachable; 23 candidates
  wait in `public/inbox.json`.
- `/pond` shipped: pale paper as decided (Hoji's belly wash cut out hollow on
  dark), 60s of stillness makes night fall and the frog jump in. `?still=N`
  shortens the minute for demos. Linked from the bashō figure on `/hokku`.

---

## 11. Two agents, one repo

Codex and Claude both work here. Git protects files — two edits to the same
`.astro` collide on push and someone merges. **KV has no such protection:**
two writes to `names:folio` and the second silently wins.

**Claim before any KV write.** The lock lives in KV and expires by itself
after two hours, because a forgotten lock is worse than the collision.

```bash
node scripts/lock.mjs status
node scripts/lock.mjs claim names "swapping the esse illustration"
node scripts/lock.mjs release names
```

Set `AGENT=codex` in the environment so the lock says who holds it. Lockable:
`names`, `ask`, `eidos`, `vault`.

### Handing work over: `drop/`

Do not export a zip and send it through chat. Write the file into `drop/` and
the other agent picks it up:

```bash
node scripts/drop.mjs          # what is waiting, and where each thing goes
node scripts/drop.mjs --file   # put them where they belong
```

Name the file for where it belongs and the pickup needs no explanation:

```
scene-ember.jpg        → public/images/scenes/ember.webp
press-logo-nature.svg  → the press wordmarks
pond-frog.png          → the pond game
wall-kurosawa.jpg      → the wall on the main page
names-folio.html       → KV names:folio
note-anything.md       → just read it
```

Anything else: drop it and say what it is in `drop/notes.md`. `drop/` is
gitignored apart from its README, so raw material stays off the public repo.
Read `drop/README.md`.
