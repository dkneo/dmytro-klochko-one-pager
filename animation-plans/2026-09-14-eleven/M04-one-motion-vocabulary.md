# M04 — One motion vocabulary: tokens, curves, budgets

- **Status**: TODO
- **Commit**: bb2e3f5
- **Severity**: MEDIUM (many small wrongs that compound into "slightly sluggish everywhere")
- **Category**: 2. Easing & duration · 7. Cohesion & tokens
- **Estimated scope**: `src/styles/global.css` (tokens), `src/styles/dream.css` (~14 rules), `src/styles/pages/eidos-product.css` (~8), `src/styles/pages/eidos-studio.css` (~8), `src/styles/pages/eidos-atlas.css` (2), `src/components/eidos/EidosCollection.astro` (delete), `DESIGN.md`

## Problem

The site has one general curve and it starts slow:

```css
/* src/styles/global.css:176-179 — current */
--ease: cubic-bezier(0.2, 0, 0.2, 1);
--ease-slick: cubic-bezier(0.62, 0.05, 0.01, 0.99); /* hold, then snap to rest; entrances only */
--dur: 200ms;
--dur-slow: 320ms;
```

`--ease` is an ease-in-out shape used for everything, including entrances and exits, which should start fast. The eidos surfaces never use the tokens at all: **16 hand-typed copies** of `cubic-bezier(0.2, 0, 0.2, 1)` in two spellings (`eidos-product.css:144, 236, 251, 350×2, 499`; `eidos-studio.css:207, 212, 225, 314, 367-369`; `eidos-atlas.css:93, 106`; `dream.css:520`; `EidosCollection.astro:114`), a private duration scale (120/160/180/220/240/260/520ms), two near-duplicate strong ease-outs (`cubic-bezier(0.18, 0.8, 0.24, 1)` at studio 264/266/430 and `cubic-bezier(0.18, 0.72, 0.18, 1)` at studio 315), bare `ease` at dream.css:89 and atlas 106, and a documented token `ease-text` (DESIGN.md:115) that is defined nowhere.

Durations over the 300ms UI ceiling on frequent elements: `cv-unfold 0.34s` (dream.css:2237), hover lifts at `--dur-slow` 320ms (dream.css:576, 1385-1387, 2051, 2942, 230-233, 165), `.dm-swap` 320ms (3174), `.wall img` 320ms (global.css:978), the underline sweep 320ms (global.css:1130), the loader rings 520ms (studio 367-369), `favorite-press` and `faun-favorite` 340ms (studio 430, 264).

Keyboard-initiated motion: the skip link slides in over 200ms (global.css:255); the eidos nav underline sweeps on `:focus-visible` (eidos-product.css:134-147); the weather preview fades in on focus (459-466).

## Target

```css
/* target — src/styles/global.css:176-181 */
--ease: cubic-bezier(0.2, 0, 0.2, 1);                  /* hover, colour, state that is neither entering nor leaving */
--ease-out: cubic-bezier(0.23, 1, 0.32, 1);            /* anything entering or exiting; the default */
--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);        /* something already on screen, moving to a new place */
--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);         /* gestures settling */
--ease-slick: cubic-bezier(0.62, 0.05, 0.01, 0.99);    /* unchanged: one-shot 0.9s entrances only */
--dur-fast: 160ms;  --dur: 200ms;  --dur-mid: 240ms;  --dur-slow: 300ms;
```

Rules, then applied everywhere (one find-and-replace pass per file, then the per-rule retargets):

| what | now | target |
| --- | --- | --- |
| every literal `cubic-bezier(0.2, 0, 0.2, 1)` / `(.2,0,.2,1)` | 16 copies | `var(--ease)` |
| `cubic-bezier(0.18, 0.8, 0.24, 1)`, `(0.18, 0.72, 0.18, 1)` | 4 copies | `var(--ease-out)` (the settle uses `var(--ease-drawer)`, see M02) |
| bare `ease` (dream 89, atlas 106) | | `var(--ease)` |
| eidos durations 180ms → `var(--dur-fast)`; 220/240/260ms → `var(--dur-mid)`; 120/160ms → `var(--dur-fast)` | | |
| entrances/exits on `--ease`: `.menu-drop` (dream 2901), `.cv-open` (2237), `.easel-layer` (250-253), `.gloss-note` (1323-1331), rail label (2831-2839), `.chapter-rail` (2632-2635), `.ep-hero-note` (product 249-252), hero settle (236), `.in-card.is-flying` (studio 314) | `var(--ease)` | `var(--ease-out)` |
| `cv-unfold 0.34s` | 340ms | `200ms var(--ease-out)` (M05 turns it into a transition) |
| hover lifts at `--dur-slow` (dream 165, 230-233, 576, 1385-1387, 2051, 2942; global 978, 1130) | 320ms | `var(--dur)` 200ms |
| `.dm-swap > *` | 320ms | `var(--dur)`, plus the asymmetry in M08 |
| loader rings (studio 367-369) | 520ms | `280ms var(--ease-out)` |
| `favorite-press`, `faun-favorite`, `faun-halo` | 340ms | `260ms var(--ease-out)` |
| skip link (global 255) | slide 200ms | `transition: none` — instant on Tab |
| `.ep-nav a:focus-visible::after` | 220ms sweep | instant on focus (`transition: none` inside `:focus-visible`); keep the sweep for `[aria-current]` only, on `var(--ease-out)` |
| `.ep-weather:focus-visible .ep-weather-preview` | 180ms fade | instant on focus |
| press release `scale 90ms` (dream 2888) | 90ms `--ease` | `160ms var(--ease-out)` press, 90ms release (M03) |
| DESIGN.md `ease-text` | documented, undefined | delete the line (the `--ease-slick` entrance is the text entrance) |
| `EidosCollection.astro` | unused, own vocabulary | delete the file |

## Repo conventions to follow

- Tokens live at `global.css:176-179`; DESIGN.md `motion:` block at line 113 mirrors them — update both in the same commit.
- `tests/house-rules.test.mjs` is the place to pin "no literal cubic-bezier outside global.css": add a test that greps `src/styles/**/*.css` and `src/**/*.astro` for `cubic-bezier(` and allows matches only in `global.css` (and the one documented `--ease-slick` use).

## Steps

1. Add the tokens; update DESIGN.md.
2. Per file, replace literals with tokens (table rows 1–4).
3. Retarget the entrances to `--ease-out` (row 5) and cap the durations (rows 6–10).
4. Make the three keyboard-triggered reveals instant (rows 11–13).
5. Delete `EidosCollection.astro`; `grep -rn EidosCollection src` must return nothing.
6. Add the no-literal test; build; suite.

## Boundaries

- Do NOT change `--ease-slick` or the 0.9s `.enter-anim` entrances (settled, DESIGN.md:116).
- Do NOT alter the three ambient tempos (48s/88s/132s) or any `infinite` loop.
- Do NOT convert keyframes to transitions here (M05).

## Verification

- **Mechanical**: suite green including the new no-literal test; `grep -rn "cubic-bezier(" src --include=*.css --include=*.astro | grep -v global.css` returns nothing.
- **Feel check**: open the header menu, a read-more, hover a journey row, open the gloss popover: each now starts moving on the first frame instead of hesitating; nothing on either surface takes longer than 300ms except the three documented exceptions (0.9s entrances, ambient loops, the 900ms scene crossfade). Tab to the skip link: it is simply there.
- **Done when**: one token file describes every curve and duration in use, and the DevTools Animations panel shows no UI transition over 300ms.
