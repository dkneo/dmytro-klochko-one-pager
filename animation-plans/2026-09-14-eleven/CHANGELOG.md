# Eleven — execution log (branch `eleven`)

One commit per plan. Every file touched is listed. Optional plans (P01, P03, M11) are measured, not applied, unless stated.

## M04 — One motion vocabulary
- `src/styles/global.css` — tokens: `--ease-out`, `--ease-in-out`, `--ease-drawer`, `--dur-fast`, `--dur-mid`; `--dur-slow` 320→300ms; skip link no longer animates; hover zoom/sweep at `--dur`.
- `src/styles/dream.css` — journey row hover on tokens; easel hover lifts at `--dur`; easel crossfade, gloss popover, chapter rail, rail label, menu on `--ease-out`; `cv-unfold` 340→200ms ease-out; dead duplicate `animation` on `.menu-drop` removed; `dm-swap` at `--dur`.
- `src/styles/pages/press.css` — row hover on tokens.
- `src/styles/pages/eidos-product.css` — 7 literal curves → `var(--ease)`; private durations → `--dur-fast`/`--dur-mid`; nav underline and weather preview instant on focus; hero notes and settle on `--ease-out`.
- `src/styles/pages/eidos-studio.css` — 10 literal curves → tokens; faun favourite/halo 340→260ms; loader rings 520→280ms; favourite stamp 340→260ms; card exit on `--ease-out`, settle on `--ease-drawer` 300ms.
- `src/styles/pages/eidos-atlas.css` — 2 literals → tokens; bare `ease` → `--ease`.
- `DESIGN.md` — motion block mirrors the tokens; undefined `ease-text` removed.
- `tests/house-rules.test.mjs` — new: no `cubic-bezier(` outside `global.css` (allow-list: name-shake egg, unused `EidosCollection.astro`).
- `tests/eidos-product.test.mjs` — the gesture test reads the tokens instead of a literal curve.
- Not changed: `EidosCollection.astro` (unused, Codex's; its one literal is allow-listed rather than edited).

## P04 — Cache the media that never changes
- `public/_headers` — `/fonts/*` and `/video/*` immutable for a year; `/images/*` one day fresh plus thirty days stale-while-revalidate.
- `tests/pages.test.mjs` — new: the three rules present, images never immutable.

## P02 — Metric-matched fallbacks so type never shifts the page
- `src/styles/global.css` — four fallback `@font-face`s (Zodiak/Newsreader, upright and italic) with fontpie metrics against Times New Roman; `--serif` names its fallback; new `--display` token (the 25 `var(--display, "Zodiak", …)` uses resolve to it).
- `src/layouts/Layout.astro` — the two italic faces the hero uses are preloaded alongside the two uprights.
- `tests/house-rules.test.mjs` — new: fallback faces, stacks and preloads present.

## P05 — Serve every picture at the size it is seen
- `scripts/image-build.mjs` — `pictures` recipes (eidos hero desktop 768/1152/1536 and mobile 480/960 in AVIF + WebP; faun mark 96/540 WebP q85; press portrait 800/1200/1600 AVIF + WebP; nine homepage rasters → WebP at their own pixel size); AVIF and lossless support in `render`/`inspect`; `--apply` is now idempotent (a derivative that matches its manifest is kept byte for byte — re-encoding is not deterministic across sharp builds and would churn 500 plates).
- `scripts/image-derivatives.json` — 31 new entries; nothing else changed.
- `public/images/responsive/eidos/*`, `public/images/responsive/press/*`, `public/images/responsive/home/*` — the derivatives (2.4 MB total; the eidos hero alone was 0.6 MB per view before).
- `src/components/eidos/EidosHero.astro` — `<picture>` with AVIF/WebP sources, `srcset`/`sizes` measured in the browser (860 px at 1440, full width on phones), true intrinsic size 1536×1024 (was declared 1920×1080).
- `src/components/eidos/EidosHeader.astro`, `src/pages/eidos/inbox.astro` — faun mark served from 96/540 px derivatives with `sizes`; the 720 px source file stays where it was.
- `src/pages/press.astro` — portrait as `<picture>` with AVIF source and WebP `srcset`; `src` is the 1600 file the attributes describe.
- `src/pages/index.astro` — pirate mark, lynch, lecture, war-16, cv-lecture and four video posters reference their WebP twins (same pixels).
- `tests/pictures.test.mjs` — new: hero/portrait attributes true to the file and offer `srcset`; faun offered small; homepage ships no png/jpg but icons and the social image.
- `tests/eidos-product.test.mjs`, `tests/reading-room.test.mjs` — five pins widened from exact filenames to `…-poster[^"]*.webp`; the one pin that asserted the wrong hero size (1920×1080) now asserts the true one.
- Left alone on purpose: the 440 px moodboard plates render at 259 px on a 2× screen, i.e. they are already slightly under-served; shrinking them would cost quality.

## P06 — An ambient budget: pay only for motion that is on screen
- `src/styles/dream.css` — weather and glint loops pause once their act has faded (`html[data-weather-idle]` gate, 950ms after the last change); scene layers at zero weight (`.is-off`) stop breathing; glints join the `data-motion="paused"` list. Keyframes, tempos and counts untouched.
- `src/scripts/scene-choreography.js` — toggles `is-off` on invisible layers; sets `data-weather-idle` on `<html>` 950ms after each scene/weather change.
- `src/scripts/motion-control.js` — `paused: document.hidden`; `visibilitychange` re-applies the policy (CSS loops, films and the petal field all stop in a hidden tab).
- `src/scripts/petal-field.js` — the render loop never starts into a hidden tab.
- `src/layouts/Layout.astro` — sky `--mx/--my` and pile `--tx/--ty` writes batched into one rAF per frame (were one per pointer event).
- `src/styles/global.css` — permanent `will-change` removed from the `.stars` layers dream mode never displays.
- `src/pages/eidos/inbox.astro` — the 232-line `<style media="not all">` block that never applied is gone (its reduced-motion rules were not policy; eidos-studio.css is).
- `tests/homepage-motion.test.mjs` — new: gates, paused list, hidden-tab pause, loop guard, batched writes.
- `tests/pages.test.mjs` — the inbox radius check reads eidos-studio.css now that the dead block is gone.
- Measured, not applied: direct `element.style.transform` writes instead of parent variables (six descendants; the scroll half is a documented decision), `animation-timeline: scroll()` (would duplicate five per-layer formulas in CSS), `content-visibility` on the moodboard columns (CSS multi-column balancing jumps as items become visible; not worth the risk to Codex's layout).
- Verified in the browser: at rest in the fire act the ember and estuary layers carry `is-off`, `data-weather-idle` is set; in the estuary act fire and ember are off and the estuary layer on.

## M01 — The reading room answers keys instantly
- `src/pages/eidos/reads.astro` — `origin` threaded through `fly`, `pass`, `keep`, the button listeners (`event.detail === 0` is the keyboard), the key map and ⌘↵; `decisionDelay(origin)` is 0 for the keyboard, 240ms for the pointer; `onCancel` returns the card home without posting. Mirrors `inbox.astro` name for name.
- `tests/reads-room.test.mjs` — the key map, the delay, the keyboard branch and the cancel handler are pinned.

## M03 — Every control answers the finger (and shows its focus)
- `src/styles/pages/eidos-product.css` — one element-level press rule for the whole product and studio (`button`, `[role="button"]`, `summary`, `.ep-action`, `.ep-visual-open`): scale 0.97, 160ms down on `--ease-out`, 90ms up; a focus ring for every studio control (the studio had none of its own).
- `src/styles/dream.css` — press reaches `[role="button"]` (journey rows), the header hamburger `summary`, the `.me-door` pill and the chapter-rail dots; press/release made asymmetric (160/90) where releases were symmetric; the release curve is `--ease-out`.
- `src/styles/pages/press.css` — the press row dips to 0.99 and snaps back.
- `src/styles/pages/eidos.css` — release curve on the atlas buttons.
- `tests/house-rules.test.mjs` — new: press rules on both surfaces, studio focus ring, asymmetric timing, no release on the slow-start curve.

## M07 — Reduced motion keeps the feedback and drops only the travel
- `src/styles/global.css` — the blanket (`animation: none !important; transition-duration: 120ms !important` on `*`) is replaced: transitions are limited to opacity and colour properties at 160ms; the ambient movers (`.dream-sky b`, `.scenes i`, `.sunpulse`, `.firelight`, `.weather s`, `.glints s`) stop and stand still; everything else keeps its fades. `.wall figure:hover img` gated to fine pointers.
- `src/styles/dream.css` — the scene layers keep their 900ms crossfade under reduced motion (only the parallax goes); nine `:hover` transforms wrapped in `@media (hover: hover) and (pointer: fine)` so a tap never leaves a print, a card or a mark displaced (`.lib-card` and the rail label keep their `:focus-visible` twins outside the gate; `.cv-media--screen:hover .cell { transform: none }` left as is because it removes movement); `.hero-stack` gets the reduced-motion rule its twin `.hi-stack` already had.
- `src/styles/pages/eidos-studio.css` — the faun's keep/pass colour and opacity feedback survive (only its 2–4px travel is removed); the card leaves by fade; the favourite stamp fades in and out (`favorite-fade`) instead of sticking; the comparison pair's hover lift gated.
- `src/styles/pages/eidos-product.css` — `.ep-action`/`.ep-weather` keep their colour transitions; movers nulled by `transform`, not by deleting every transition; the nav underline stays instant.
- `src/layouts/Layout.astro` — the `lisa` petal shower checks reduced motion like its sibling egg.
- `tests/house-rules.test.mjs` — new: no blanket on `*`; the crossfade survives; the stamp fades; every `:hover` rule that moves sits inside a hover-capable media block (a small CSS scanner that judges values, so `transform: none` is not movement).

## M06 — Only transform and opacity move
- `src/styles/pages/eidos-studio.css` — the card stage no longer transitions `max-width`/`margin` on every deal (the frame takes its size at once; the card's own motion covers it — the homepage easel's documented answer).
- `src/styles/dream.css` — the easel's `aspect-ratio` transition removed (its width had already been stopped for the same reason); the atlas dot grows by `transform: scale` (7→10, 5→10) instead of animating the SVG `r`; its `:hover` half gated to fine pointers, `.is-on` stays for everyone.
- `src/styles/global.css` — the contact/receipt underline sweep is a `::after` bar scaled by transform, not a `background-size` repaint; gated to fine pointers like every other hover that moves.
- `src/pages/eidos/map.astro` — wheel zoom disables the stage transition while the wheel turns (the drag path's `is-dragging`) and meets rising resistance past the limits, settling back 120ms after the last tick; the zoom buttons keep their hard clamp (discrete actions).
- `tests/house-rules.test.mjs` — new: no `transition` in `src/styles/**` names a layout property (allow-list: the documented `.arw` hop).
- Measured, not applied: the five `box-shadow` hover transitions (small, hover-scoped, one element at a time; a `::after` duplicate would add markup-facing CSS to Codex's `.ep-piece`).

## M05 — Reversible things use transitions, not keyframes
- `src/styles/dream.css` — the header menu and the read-more disclosures animate their `::details-content` with transitions and `@starting-style` (180/200ms in, 120/140ms out, retarget mid-flight; browsers without `::details-content` get an instant open/close, which is what they had minus the one-shot keyframe); `menu-open`, `cv-unfold` and `em-rise` keyframes removed.
- `src/styles/pages/eidos-studio.css` — the favourite stamp is driven by the card's `is-favorite` class with transitions (a fast second favourite retargets instead of replaying from zero); the faun's favourite bob rides the key's own transition from `data-state`; `favorite-press` and `faun-favorite` keyframes removed. The faun halo (`faun-halo`) stays a one-shot flourish on `data-state`, which returns to idle after the reaction — modular for the states Codex will add.
- `src/styles/pages/eidos.css` — the atlas detail panel transitions on `[hidden]` with `display allow-discrete`, so it leaves as well as arrives.
- `src/pages/eidos/inbox.astro` — the plate loader no longer forces a reflow (`void offsetWidth`) to restart; its class already toggles across frames behind `LOADER_DELAY`.
- `tests/house-rules.test.mjs` — new: the five keyframes are gone, the `::details-content` and `[hidden]` transitions exist, the stamp is class-driven, no forced reflow.
- Not changed: `EidosCollection.astro`'s surprise wobble (the component is imported by no page).

## M02 — A swipe that knows how fast the hand moved
- `src/pages/eidos/inbox.astro`, `src/pages/eidos/reads.astro` — identical gesture code: a swipe commits at 110px or at 0.11px/ms (a flick of 80px commits; a slow 100px drag settles); velocity is smoothed over the last moves; the flight lasts 160–300ms from the release speed; a re-grab reads the card's live offset (`DOMMatrix.m41`) and continues from it; `will-change: transform` is set on pointerdown and released on settle or commit; the keep/pass stamps scale with the drag (0.9→1) instead of only fading.
- `src/styles/pages/eidos-studio.css` — the permanent `will-change` on `.in-card` removed; `.in-edge` transitions its transform (120ms).
- `tests/reads-room.test.mjs` — new: thresholds, velocity commit, live-offset re-grab, velocity-scaled flight, gesture-scoped will-change, no permanent layer, stamps that land.
- **Tested** in the browser pane with synthetic pointer sequences on the local build: desktop mouse at 1440 — 80px flick in 60ms commits, 60px slow drag settles, 115px slow drag commits; touch at 375 — 72px flick commits, 50px slow settles, 120px slow commits, a `pointercancel` mid-drag returns the card without a verdict. The re-grab-from-live-offset path could not be observed in the pane (it freezes CSS transitions, so the settling card reads as already home); it is pinned by test and needs a hand on a real trackpad and a real phone before this ships — per the brief, that check is the owner's.
