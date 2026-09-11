# Eidos Visual Studio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:test-driven-development for each behavior change and superpowers:verification-before-completion before every publish claim.

**Goal:** Make Eidos a visual-only discovery studio with a flawless share card, intentional verdicts, useful visual arrangements, and an honest foundation for seeing loved work in person.

**Architecture:** Keep the vault and KV data intact while filtering the current interface at its read boundaries. Extend the verdict contract with `favorite`, compile visual metadata into the existing map payload, and keep color and physical metadata build-time so the browser only arranges known values. Treat live exhibition status as separate sourced data rather than guessing it from collection ownership.

**Tech Stack:** Astro, vanilla JavaScript, CSS, Node test runner, Sharp, Cloudflare Workers and KV.

**Spec:** `docs/superpowers/specs/2026-09-09-eidos-visual-studio-design.md`

## Global Constraints

Preserve every hidden non-visual record. Preserve natural media ratios. Never invent a location or dimension. No visible em dashes. Use `scripts/ship.sh` for every publish. Verify desktop before mobile.

### Task 1: Repair the share card

**Files:** `tests/og-eidos.test.mjs`, `scripts/og-eidos-build.mjs`, `public/og-eidos.png`

- [ ] Add a failing assertion that every headline line has a declared maximum width inside the copy column.
- [ ] Recompose the headline with bounded lines and regenerate the PNG.
- [ ] Render and inspect the final 1200 by 628 image.
- [ ] Run the focused tests and ship the repair.

### Task 2: Make the studio visual-only and quiet at entry

**Files:** `tests/eidos-product.test.mjs`, `tests/reading-room.test.mjs`, `src/pages/eidos/inbox.astro`, `src/styles/pages/eidos-studio.css`

- [ ] Add failing tests that reject non-visual payloads, bookmark fetches, the link composer, the note panel and the auto-playing open-card clip.
- [ ] Filter harvested candidates at build time, remove bookmark intake at runtime, and remove annotation UI and payloads.
- [ ] Replace the entry overlay with a small visual loading mark tied to image readiness.
- [ ] Verify gate, loading, image failure, empty queue, pass, keep and undo states.
- [ ] Ship the desktop studio repair.

### Task 3: Add favorites, media shelves and comparison rounds

**Files:** `tests/inbox-worker.test.mjs`, `tests/eidos-product.test.mjs`, `worker/index.js`, `src/pages/eidos/inbox.astro`, `src/styles/pages/eidos-studio.css`, `scripts/eidos-pull.mjs`, `scripts/lib/vault-note.mjs`, `scripts/map-build.mjs`

- [ ] Add failing worker tests for the `favorite` verdict and its counts.
- [ ] Add failing studio tests for favorite controls, `f`, visual shelf filters and a skippable comparison after twelve positive choices.
- [ ] Accept and persist favorite as a positive verdict, then write `favorite: true` into a pulled visual note.
- [ ] Implement the studio controls and pair comparison without scores.
- [ ] Run worker, vault and studio suites and ship.

### Task 4: Add moodboard arrangements and truthful metadata

**Files:** `tests/eidos-product.test.mjs`, `scripts/map-build.mjs`, `src/pages/eidos/index.astro`, `src/components/eidos/EidosMoodboard.astro`, `src/styles/pages/eidos-product.css`, `src/data/eidos-colors.json`, `scripts/eidos-colors.mjs`

- [ ] Add failing tests for salon, color and favorites views, collection labels, and conditional physical scale.
- [ ] Compile dominant hue from each local plate and propagate `collection`, `dimensions` and `favorite` from vault notes.
- [ ] Implement a compact view control and FLIP reflow for pigment drift.
- [ ] Show collection beside the work and expose scale only where dimensions are verified.
- [ ] Verify the wall at 1366 and 1440 widths and ship.

### Task 5: Build the sourced visit foundation

**Files:** `vault/**`, `scripts/map-build.mjs`, `src/pages/eidos/places.astro`, `src/components/eidos/EidosHeader.astro`, tests

- [ ] Inventory existing collection metadata and classify own, institutional, unknown and non-object records.
- [ ] Add a failing test that forbids `on view` without both an authoritative URL and `checked` date.
- [ ] Propagate existing collection metadata and build a city-first institution index.
- [ ] Enrich only records verified from primary museum sources.
- [ ] Link a quiet `places` route from visual details, not from the primary header until it has useful coverage.
- [ ] Ship the sourced foundation; keep itinerary generation out until enough current records exist.

### Task 6: Mobile and final verification

- [ ] Measure overflow and targets at a real 390px viewport.
- [ ] Adapt the studio shelves, favorite control, comparison and moodboard modes.
- [ ] Run the build and full test suite without piping its exit status.
- [ ] Publish through `scripts/ship.sh`, wait for the newer deployment, and compare live output with `dist`.

