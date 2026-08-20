# Scout field manual implementation plan

> **For Codex:** execute this plan in order. Keep `/scout` content and media out
> of git. Write each behavior test before its implementation and show the failing
> result once.

**Goal:** Rebuild the private scout course as the approved five-day field manual,
add gated portrait and instructional media, correct the guide, and make its scout
desk reliable enough for real use.

**Architecture:** The course remains one KV-served HTML document at
`contents/scout-school.html`. Private binary assets live in KV under
`scout:media:*` and are returned by the existing worker only after scout-cookie
authentication. A small public, content-free state module owns tracker
serialization and merge rules so it can be unit tested in CI; the private page's
inline script owns DOM behavior.

**Stack:** Cloudflare Worker + KV, vanilla HTML/CSS/JS, Node test runner, Astro
build, Wrangler, ImageGen, signed-in browser captures, ffmpeg for short muted
walkthroughs when available.

---

## Task 1: Prove the scout gate and private-media contract

**Files:**

- Create: `tests/scout-worker.test.mjs`
- Modify: `worker/index.js`
- Modify: `wrangler.jsonc`

1. Add a worker harness with mock `VAULT` and `ASSETS` bindings.
2. Write failing tests for the scout door title, successful login cookie, private
   page fetch, rejected unauthenticated media, authenticated binary media,
   content type, `HEAD`, range requests, invalid slugs, traversal attempts and
   non-GET media methods.
3. Run `node --test tests/scout-worker.test.mjs` and confirm the new assertions
   fail for the current worker.
4. Refactor the door helper to accept title, heading, copy and action directly.
   Remove scout's string-replacement customization.
5. Add the exact `/scout/media/<safe-slug>` branch after scout authentication and
   before `scout:page`; read with KV metadata and return private headers.
6. Add `/scout` and `/scout/*` to `assets.run_worker_first` even though the page
   is absent from `dist`; this makes the security intent explicit and future-safe.
7. Run the focused test, full test command and `git diff --check`.
8. Commit with a lowercase message explaining that portraits must not bypass the
   fourth door.

## Task 2: Make scout state deterministic and recoverable

**Files:**

- Create: `public/scripts/scout-state.js`
- Create: `tests/scout-state.test.mjs`

1. Write failing unit tests for schema versioning, invalid stored JSON, row
   normalization, CSV escaping, JSON backup, merge de-duplication, replacement,
   demo-row separation and undo restoration.
2. Run `node --test tests/scout-state.test.mjs` and confirm failure because the
   module does not exist.
3. Implement pure exports only: `emptyState`, `loadState`, `normalizeRow`,
   `serializeBackup`, `parseBackup`, `mergeRows`, `toCsv` and undo helpers.
4. Keep field names and statuses in one exported source of truth. Do not put
   Anastasia's name, contact information or guide copy in this public module.
5. Run focused and full tests.

## Task 3: Generate the private Anastasia illustration set

**Files:**

- Read: the six supplied photographs in the system temp directory
- Create, gitignored: `contents/scout-media/taso-scout.webp`
- Create, gitignored: `contents/scout-media/taso-cat.webp`
- Create, gitignored: `contents/scout-media/taso-operator.webp`
- Create, gitignored: prompt sidecars beside each final image

1. Inspect all six references at full size. Assign identity references and scene
   references explicitly.
2. Generate the hero first in the approved limited-palette gouache and cut-paper
   editorial print style. Preserve Anastasia's brows, face shape, dark hair and
   red track jacket; add phone/contact-sheet cues without fake logos or text.
3. Generate the cat chapter break from the smiling cat photograph.
4. Generate the operator scene from the restaurant and keychain references.
5. Inspect each output at full size. Reject warped hands, changed identity,
   beauty-filter skin, fake text and generic stock-illustration treatment.
6. Convert approved outputs to correctly sized WebP files under 4 MB each while
   retaining source-resolution masters locally.
7. Record exact prompts and reference paths in sidecars. Do not add any of these
   files to git.

## Task 4: Build the instructional media set

**Files:**

- Create, gitignored: six or more annotated images under
  `contents/scout-media/`
- Create, gitignored: three muted MP4 walkthroughs plus posters under the same
  directory
- Create, gitignored: `contents/scout-media/manifest.json`

1. Capture current official interfaces or official product documentation for
   Meta Ad Library, TikTok Creative Center, TikTok One, Fiverr and creator-ad
   permission flows. Keep the source URL and capture date in the manifest.
2. Redact account identifiers, notifications and unrelated personal data.
3. Annotate only the controls Anastasia needs, in the field manual's red/petrol
   system. Do not fabricate performance results or creator profiles.
4. Record three short task walkthroughs: competitor-ad search, creator-card read
   and tracker stage move. Use captions and no sound.
5. Compress each MP4 below the KV per-value limit and create a WebP poster.
6. Add transcript/step text, dimensions, duration, MIME type, slug and KV key to
   the manifest.

## Task 5: Rebuild the private guide around the five-part lesson rhythm

**Files:**

- Modify, gitignored: `contents/scout-school.html`
- Create: `.impeccable/surfaces/scout.md`

1. Add the approved direction contract as the opening HTML comment.
2. Build the hero, sticky progress rail, chapter overview and continue action.
3. Restructure all five days as argument, see it, know it, choose and do it.
   Preserve useful guide material while removing repetition. Bring day three and
   day four below roughly twelve minutes of reading each.
4. Replace missing public image URLs with authenticated `/scout/media/*` URLs.
   Add dimensions, loading policy, captions and fallbacks.
5. Correct the factual claims listed in the design spec. Keep the Grok Bot
   comparison at `$300/month`, explicitly tied to SuperGrok Heavy and checked on
   20 August 2026.
6. Add a compact sources drawer with official Meta, TikTok, xAI, Hermes, Replika,
   Tolan and Sensor Tower links.
7. Label practice profiles and example rates as simulations. Keep the judgments
   direct.
8. Run the Impeccable craft-floor preflight immediately before styling. Resolve
   any detector-ignore conflict locally because the user explicitly reopened the
   whole surface.
9. Implement responsive paper/night styling, correct contrast, focus treatments,
   24px minimum targets, mobile card tables and explicit horizontal-scroll cues.
10. Write the route-specific surface brief with the built visual and interaction
    decisions.

## Task 6: Wire the safe scout desk and accessible interactions

**Files:**

- Modify, gitignored: `contents/scout-school.html`
- Use: `public/scripts/scout-state.js`

1. Import the tested state module from the private page.
2. Add debounced input persistence plus blur flush, saved/saving/blocked states
   and a session-only fallback when storage fails.
3. Add CSV and JSON export, JSON import preview, merge/replace choice, and an undo
   toast for delete.
4. Give every generated field a visible or programmatic row-and-column label.
5. Render creator cards by default on mobile with an explicit table-view toggle.
6. Mark quiz, drill, copy and persistence results as polite live regions. Restore
   stored answers without announcing them on load.
7. Make progress navigation update from stored completion state and honor reduced
   motion.

## Task 7: Validate the private artifact before writing KV

**Files:**

- Create: `scripts/scout-check.mjs`
- Modify: `tests/scout-worker.test.mjs` if a regression is found

1. Write the checker first with failing fixtures for missing accessible names,
   missing media dimensions, public scout-media URLs, absent transcripts, unsafe
   target sizes and banned unsupported claims.
2. Implement the checker as a dry-run-only validator. It never changes the page.
3. Run it against `contents/scout-school.html` and fix every failure.
4. Build the repository and run all tests.
5. Serve the built site and a local worker-backed scout page. Capture desktop and
   390px mobile states after disabling transitions where measurements require it.
6. Measure contrast, accessible names, target rectangles and overflow. Test
   blocked storage, blocked media, wrong password, correct password, import,
   delete/undo and reload persistence.

## Task 8: Publish under the scout lock and verify live

**Files:**

- KV: `scout:page`
- KV: all `scout:media:*` keys from the private manifest

1. Check `AGENT=codex node scripts/lock.mjs status`.
2. Claim `scout` with a description naming the field-manual rebuild.
3. Upload media with content-type metadata, then upload `scout:page` last so the
   new HTML never points at missing assets.
4. Deploy the worker only after the relevant commit exists, push master, and poll
   Cloudflare until CI's deployment replaces the previous version.
5. Verify unauthenticated `/scout` and every bypass variant return the door, and
   unauthenticated media returns no asset bytes.
6. Authenticate with the supplied password and verify page, image, video range,
   private headers and tracker behavior live at desktop and mobile widths.
7. Run the local-dist/live comparison for every static page to ensure the worker
   change did not affect the rest of the site.
8. Release the scout lock even if verification fails. Report any failed or skipped
   check explicitly.

## Task 9: Independent finish review and documentation

1. Run the Impeccable detector exactly once on the completed private artifact and
   record any deliberate exceptions.
2. Capture final desktop and mobile review images under `.impeccable/review/`.
3. Spawn the required fresh finish reviewer with the request, design contract,
   artifact, captures, craft floor and critique reference. Apply material fixes
   and recapture once if needed.
4. Spawn the documenter after the last correction so DESIGN.md and the surface
   brief describe what shipped rather than what was planned.
5. Run verification once more before claiming completion.

