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
