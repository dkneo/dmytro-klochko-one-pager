# Working on dmklochko.com

For any agent picking this repo up. Read this first, then `CHECKLIST.md`
(taste), `DESIGN.md` (tokens), `CURATION.md` (the vault's rules).

The site belongs to **Dmytro Klochko**, CEO of Replika. Audience is VCs,
scouts and tech-Twitter. Everything on it is either true or removed.

The **foyer** is what public nav and the sitemap offer: `/`, `/learning`,
`/press`, `/#contact`. Extra rooms stay in the repo, reachable by url,
unlinked and noindex. Do not put writing or eidos in the header.

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

### The eidos pages

`/eidos` is **the library** — unlisted, not in the sitemap, and the one page
on the site that is meant to be shared on its own (it carries its own OG
card, `public/og-eidos.png`, composed by `scripts/og-eidos.mjs` from the
same data as the page). It opens with **the portrait** — one paragraph and a
strip of eight weathers, every word and bar computed from the vault at build
by `src/components/EidosPortrait.astro` — then hangs the pictures and sets
the words in **two rooms of their own**: the hall (`#pictures`: paintings,
posters, objects, buildings, people; weather by weather, cold to warm, each
plate at its own proportions) and the reading room (`#words`: poems whole
with the original above the english and the translator named; quotes in
their own tongue with the english under; songs by name). Then **read**
(`#read`: bookmarks he kept from the inbox, typographic cards) and
**unfiled** (the ring). Every count on the page is computed from what it
renders. The weathers are labels inside a room, not walls between rooms:
eight short walls interrupted by eight short columns never read as a place.

**The same portrait component renders compact on the homepage** as the
`#eidos` chapter (the door to the library), so home and library can never
disagree about what he loves. `tests/eidos-portrait.test.mjs` holds them to
the same numbers.

Views: `/eidos/map` (the sketch), `/eidos/orbit` (the shape). `/eidos/deck`
is legacy, unlinked.

`/eidos/inbox` **replaced `/eidos/sit`** (the worker 301s the old address).
One surface, two kinds of card: what the harvester brought (pictures) and
what he threw in himself (links). The composer at the top posts a url to
`POST /api/eidos/bookmark`; the worker reads the page once (title, site,
description, og:image, author, a 300-char excerpt — never our own network:
private hosts are refused), asks the model for a two-sentence summary and
tags **only if `ANTHROPIC_API_KEY` is set**, and stores the record in KV
`eidos:bookmarks`. `GET /api/eidos/bookmarks` lists them (behind the door).
Both are judged with the same right/left motion into `eidos:verdicts`. A
kept link becomes `vault/bookmarks/<id>.md` through `eidos-pull`
(obsidian-shaped: frontmatter, the summary as body, wikilinks to weather,
author and tags) and appears under `#read`. Posters and suggested
newsletters arrive as **candidates**, never directly on the page.

Marks come in eleven kinds: paintings, objects, buildings, **posters**, poems,
songs, quotes, links, people, writing, **bookmarks**. `map-build` carries
`lang` for poems and quotes (script/stopword detection on the original),
`english` for quotes and `original` + `translator` for poems, so the
reading room can set both.

### The taste loop, end to end

The one workflow that spans all of them. It only moves when he judges, which
is what `/eidos/inbox` exists to make cheap:

1. `node scripts/candidates.mjs --apply` — Wikimedia, public domain only,
   aimed at the weathers thinnest **on the map**. Four search terms per
   weather; one search yields at most one candidate, so fewer terms leaves
   whole weathers empty.
2. He judges at `/eidos/inbox`: right if it stays, left if it goes — and
   throws his own links in at the top of the same page. Verdicts land in KV
   under `eidos:verdicts`, bookmarks under `eidos:bookmarks`, both behind
   the `/names` door.
3. `node scripts/eidos-pull.mjs --apply` — turns keeps into vault notes
   (pictures into their kind's folder, links into `vault/bookmarks`). A
   remote candidate has its picture **brought home** here (fetched, tracking
   params dropped, webp at 1600 wide, into `public/images/vault/`), because
   `vault-build` throws on a painting that is not on disk.
4. `node scripts/image-build.mjs --apply` — the new paintings need thumbnails
   before the map can show them. `npm run build` runs `--check` and **fails**
   if they are missing, which is the intended alarm, not a bug.
5. Commit. The vault is git; the map rebuilds from it.

**Step 4 must come after a build, not before it.** `image-build` reads its
work list from `src/data/map.json`, which `map-build` writes in step 4's
own pipeline. Run `--apply` straight after the pull and it will happily
regenerate the derivatives it already had and none of the new ones. The order
that works: pull → `npm run build` (fails at `--check`, on purpose, having
written a fresh map) → `image-build --apply` → `npm run build` again. And
if a derivative was already built from a smaller source, delete the file:
`--apply` trusts `scripts/image-derivatives.json` and will not rebuild it.

**An `/images/inbox/` src is the one local path that is not the picture.**
The harvester saves a deck-sized copy so the sitting has something to show.
`bringHome` used to return any local src untouched, so four kept paintings
shipped too small to make a 960px plate. An inbox src is now re-fetched full
size from the Commons page the candidate cites — and while fixing it, one of
those four turned out to be a different painting than its note claimed, so
check the picture against the title when a keep looks off.

`scripts/lib/` holds the two pieces of that pipeline worth testing on their
own: `attribution.mjs` (Commons names arrive wearing catalogue clothes) and
`vault-note.mjs` (three builds read the shape of a note and none forgive a
surprise).

---

## 7. Verifying — this environment lies to you

Hard-won and non-obvious. Ignoring these produces confident wrong conclusions:

- **Verify against built `dist/`** on `python3 -m http.server 4399 -d dist`.
  The vite dev server has served 500s mid-recompile and poisoned screenshots.
- **A headless capture at `--window-size=390` lays the page out wider than
  390 and crops the image**, so mobile screenshots show text and grids cut
  off at the right edge when the real page fits. Twice in one day this looked
  like a horizontal-overflow bug on pages that had none. Diagnose width in
  the pane: set the viewport to 390 and read `scrollWidth - clientWidth`
  plus every element whose right edge passes the viewport (the sky canvas is
  3000px wide by design; skip it). Use headless 390 captures for structure
  only.
- **Astro moves a page's styles into their own hashed bundle,
  `/_astro/<page>.<hash>.css`, once they are large enough.** A test that
  scans a page's inline `<style>` blocks for something then finds nothing
  and passes on an empty list — the inbox's radius guard did exactly this.
  Resolve the page's own sheet from its `<link href>`, assert it exists and
  is the right one, and read that.
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
- **A narrow headless screenshot can show clipping that is not there.** At
  `--window-size=390`, `/eidos` captured with its text running past the right
  edge; the same page measured at a real 390 viewport twice — pane and the
  scaled-iframe method — reported `scrollWidth === clientWidth` and no
  offending element. The png came back exactly 390 wide, so it is not a
  clamp, and the cause is still unknown. **Measure before believing a narrow
  capture**, and prefer the iframe.
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

The **foyer** is what public nav and the sitemap offer:

| url | what |
|---|---|
| `/` | the main page: CV, work, photographs. no homepage poems chapter. |
| `/press` | verified press pieces, wordmarks, real quotes, contacts |
| `/learning` | what he's studying, plus `/learning/ui-vernacular` |
| `/#contact` | say hi |

**Hidden rooms** stay on disk, reachable by url, unlinked and noindex:

| url | what |
|---|---|
| `/today` | a daily chord: painting, poem, quote, song, by "weather" |
| `/eidos` | the taste library; `/eidos/deck` is the swipe deck |
| `/hokku` | write a haiku, reviewed by rule |
| `/basho` | a hosted essay |
| `/pond` | the stillness toy |
| `/taste` | the playlist remnant |
| `/writing` | two skyeng-year pieces |
| `/dance` | the dance loop |
| `/curate`, `/vault`, `/map` | curation tooling |
| `/names` | **gated** — the naming folio + the app brief |
| `/ask` | **gated, separate password** — the request desk |
| `/scout` | **gated** — taso's ugc program |

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
  Both are hidden rooms.

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
