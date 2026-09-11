# Eidos Product Rebrand Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:test-driven-development for each behavior change and superpowers:verification-before-completion before every publish claim.

**Goal:** Rebuild Eidos as a coherent product-shaped public taste portrait and rebuild `/eidos/inbox` as its private discovery studio, while preserving the vault, worker APIs, attribution rules, and existing data.

**Architecture:** Keep `eidos` as the working public and internal name. Add a product-specific layout layer and a pure derived view model over `src/data/map.json`. The public profile remains static and read-only. The gated inbox keeps its current worker contracts but receives a new responsive field-folio interface. The 2D map remains an optional atlas, while the redundant orbit is redirected only after its unique behavior is accounted for.

**Tech Stack:** Astro, vanilla JavaScript, CSS, Node test runner, Sharp, Cloudflare Workers and KV.

**Spec:** `docs/superpowers/specs/2026-09-08-eidos-product-rebrand-design.md`

**Global Constraints:** Desktop first and live review first, mobile second and live review second, tablet last. Preserve natural media ratios. No public write controls. No fabricated portrait claims. No em dashes in visible copy. Use `scripts/ship.sh` for every push. Keep Eidos out of the public foyer and sitemap.

## File map

### Create

- `src/components/eidos/EidosHeader.astro`: standalone product navigation
- `src/components/eidos/EidosHero.astro`: static-first responsive Faun and Gryphon hero
- `src/components/eidos/EidosReading.astro`: evidence-backed portrait summary
- `src/components/eidos/EidosField.astro`: weather index and representative previews
- `src/components/eidos/EidosCollection.astro`: mixed collection and progressive reveal
- `src/components/eidos/EidosTraces.astro`: quiet archival metadata and product ending
- `src/lib/eidos-view.mjs`: pure selectors and editorial ordering
- `src/styles/pages/eidos-product.css`: product tokens and shared public/studio skin
- `tests/eidos-product.test.mjs`: derived model, public structure, routes and assets
- `tests/eidos-responsive.test.mjs`: desktop/mobile structural invariants
- `public/images/eidos/`: approved stills and motion assets

### Modify

- `src/pages/eidos/index.astro`: compose the new portrait
- `src/pages/eidos/inbox.astro`: rebuild the discovery studio without changing API payloads
- `src/pages/eidos/map.astro`: simplify and restyle as the atlas
- `src/pages/eidos/embed.astro`: use the compact new reading
- `src/components/EidosPortrait.astro`: retain only compatibility needed by embed/tests, then retire
- `worker/index.js`: add route redirects only, without changing Eidos write contracts
- `tests/pages.test.mjs`: assert the new public/private boundaries
- `tests/reading-room.test.mjs`: replace obsolete room-specific expectations
- `tests/eidos-portrait.test.mjs`: migrate to the new evidence model
- `tests/embed.test.mjs`: verify the compact portrait
- `tests/og-eidos.test.mjs`: verify the refreshed share card
- `scripts/og-eidos-build.mjs`: compose the new brand share card
- `DESIGN.md`: document the Eidos product system after it ships

### Retire after parity

- `src/pages/eidos/orbit.astro`: replace with worker redirect or static redirect
- `src/pages/eidos/deck.astro`: keep until the product ending has a working discovery demonstration, then redirect
- obsolete library-only rules in `src/styles/pages/eidos.css`

## Task 1: Establish the derived profile model

**Files:** `src/lib/eidos-view.mjs`, `tests/eidos-product.test.mjs`

1. Write failing tests for `buildProfile(map, palettes)`:
   - excludes craft links from the public collection
   - preserves all other items exactly once
   - derives recurring makers from real records
   - returns weather slices in cold-to-warm order
   - produces a varied editorial order without adjacent duplicate form/maker when alternatives exist
   - returns evidence ids for every generated observation
2. Run `node --test tests/eidos-product.test.mjs` and confirm the module-not-found failure.
3. Implement pure selectors with no file writes and no guessed metadata.
4. Run the focused test and then the existing Eidos tests.
5. Commit through `scripts/ship.sh` only when the first visible desktop slice is also ready, so the CI deployment always contains a usable page.

## Task 2: Install and verify the approved assets

**Files:** `public/images/eidos/*`, `tests/eidos-product.test.mjs`

1. Add failing tests that require desktop/mobile hero posters, WebM/MP4 pairs, loader, and card reactions with declared size ceilings.
2. Copy approved files from `~/Downloads/faun-gryphon-fal-renders-2026-09-08` and the existing static kit.
3. Inspect start, midpoint, and end frames. Reject blue/cyan, closed-circle, camera-motion, face-morph, or extra-limb renders.
4. Record exact dimensions and sizes in a tracked asset manifest.
5. Keep missing overlay files optional until they actually arrive.

## Task 3: Build the standalone desktop product shell

**Files:** `EidosHeader.astro`, `EidosHero.astro`, `eidos-product.css`, `index.astro`, `tests/eidos-product.test.mjs`

1. Add failing HTML tests for:
   - one standalone Eidos header
   - working-name wordmark
   - public nav labels `portrait`, `collection`, `atlas`
   - link back to Dmytro's main site
   - static hero poster before ambient video
   - hero copy from the approved spec
   - no Greek etymology in the opening frame
2. Build the paper shell, type hierarchy, product tokens, focus styles, and responsive hero slot.
3. Use `<picture>` or media-aware poster sources and `<video muted autoplay loop playsinline>` with WebM and MP4.
4. Disable motion under reduced motion and data saver without hiding the poster.
5. Build and inspect at 1440x900 and 1366x768 from `dist`.
6. Ship as `eidos: establish the product shell and opening promise`.

## Task 4: Build the evidence-backed public portrait

**Files:** `EidosReading.astro`, `EidosField.astro`, `EidosCollection.astro`, `EidosTraces.astro`, `index.astro`, tests

1. Add failing tests for:
   - every statement carries evidence ids
   - representative works exist in the public collection
   - every public item is represented exactly once in collection data
   - initial HTML exposes 18 to 24 items and retains the rest for progressive reveal
   - natural width/height are declared for visual works
   - weather order and palette values match the map
2. Implement the short reading using only measurable claims: counts, recurrence, media balance, weather fullness, languages, and dated range.
3. Implement three recurring pulls only where the vault provides enough explicit evidence. If the data does not support a phrase, omit the pull.
4. Implement the weather field as a filter, not eight repeated corridors.
5. Implement mixed collection cards for visuals, poems/quotes, songs/people, and bookmarks.
6. Add `keep exploring`, filter, maker search, and `surprise me` in vanilla JavaScript.
7. Add traces and the honest `make yours` ending, linking to the existing deck while it remains the available demo.
8. Inspect desktop density, media sharpness, focus order, and collection reflow.
9. Ship in two meaningful commits: reading/field, then collection/traces.

## Task 5: Rebuild the desktop Inbox field folio

**Files:** `inbox.astro`, `eidos-product.css`, tests

1. Add failing tests for the new workbench structure while retaining all existing contract tests:
   - incoming rail
   - content area
   - note leaf
   - session trail
   - collapsed advanced metadata
   - gated state
2. Preserve current IDs and event contracts where practical to reduce worker risk.
3. Replace the blurred wallpaper and glowing composer with the paper field-folio shell.
4. Make card proportions content-aware: visual 62/38, link 54/46, words 50/50.
5. Keep primary media uncropped with `object-fit: contain` and bounded height.
6. Keep pointer, buttons, arrows, `h/l`, note `cmd+enter`, source open, undo, and `cmd+z` on one action map.
7. Add local draft recovery and explicit save status.
8. Add a five-item session trail and move URL intake into a real `add something` disclosure.
9. Trigger save/pass/open clips only after interaction completion; never use them as the drag itself.
10. Inspect visual, word, link, missing-image, gate, submitting, failure, and empty states.
11. Ship as two commits: field-folio structure, then behavior/history.

## Task 6: Simplify the atlas and retire the duplicate orbit

**Files:** `map.astro`, `worker/index.js`, `tests/pages.test.mjs`

1. Add failing tests that require one public map mode and private controls behind explicit mode/gate boundaries.
2. Restyle the map with Eidos product tokens and move explanation after the map's title.
3. Group `ask` and `teach` as secondary controls rather than page-length equal sections.
4. Compare orbit and map interactions. Move any unique useful behavior to map.
5. Add tested redirects from `/eidos/orbit` and slash variants to `/eidos/map`.
6. Keep `/eidos/deck` until the product ending's demonstration is verified.
7. Ship as `atlas: keep the useful map and retire the duplicate orbit`.

## Task 7: Desktop audit and publish gate

1. Run `npm run build`.
2. Run the entire test suite without piping the exit status.
3. Serve `dist` on port 4399.
4. Inspect `/eidos`, `/eidos/inbox`, `/eidos/map`, and `/eidos/embed` at desktop sizes.
5. Measure fill, natural media ratios, focus visibility, contrast, initial bytes, and LCP candidate.
6. Run `scripts/ship.sh` with the exact changed paths.
7. Wait for the Cloudflare deployment newer than the push.
8. Compare live pages with local `dist`.

## Task 8: Mobile adaptation and second publish

**Files:** public components, `inbox.astro`, CSS, `tests/eidos-responsive.test.mjs`

1. Add failing structural tests for the dedicated mobile hero, single-column collection, 44px studio actions, and note sheet.
2. Build the 390px public profile without horizontal overflow.
3. Build the mobile card with fixed action shelf and accessible note sheet.
4. Use the mobile hero loop and static poster.
5. Measure in a real 390px iframe; ignore the known misleading headless crop until geometry confirms it.
6. Build, run the full suite, publish, wait for CI, and verify live.

## Task 9: Tablet and motion finish

1. Tune the 768 to 1024px range after desktop and mobile are stable.
2. Check portrait/landscape rotation and folio proportions.
3. Re-scan the Fal folder and review any new overlay or profile-add renders.
4. Integrate only approved clips with stable posters and reduced-motion fallbacks.
5. Review motion using the animation audit skill before final publish.
6. Build, run the full suite, publish, and verify live.

## Task 10: Final truth, accessibility, and performance audit

1. Verify no public profile sentence exceeds its evidence.
2. Verify all credits and original-language text remain intact.
3. Verify no item disappeared from the public/archive partition.
4. Verify no private write controls appear on public pages.
5. Measure contrast against actual paper and media surfaces.
6. Measure tap targets and overflow at 390px and 1366px.
7. Verify reduced motion, data saver, missing media, offline failure, and empty queue states.
8. Update `DESIGN.md` with only the system that actually shipped.
9. Run `scripts/ship.sh`, wait for CI, and compare every built route to live.

