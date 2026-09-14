# M03 — Every control answers the finger

- **Status**: TODO
- **Commit**: bb2e3f5
- **Severity**: HIGH
- **Category**: 3. Physicality — press feedback · 4. Asymmetric timing
- **Estimated scope**: `src/styles/pages/eidos-product.css`, `src/styles/pages/eidos-studio.css`, `src/styles/dream.css` (~4 rules), `src/styles/pages/press.css`

## Problem

The whole eidos surface has no press feedback. There is no `:active` rule in `eidos-product.css` and one in `eidos-studio.css` (not on the buttons). The homepage's press rule is written against `button:active` under `[data-mode="dream"]` (dream.css:2876), and the eidos layout renders `<html data-eidos-product>` with no `data-mode`, so keep, pass, favorite, undo, every filter, `.ep-action`, `.ep-weather`, `.ep-visual-open`, `.ep-more`, `.ep-surprise`, `.ep-detail-close`, the comparison pair and the gate/throw submits all do nothing under the finger.

On the homepage the same rule misses three kinds of control: `div.log-bead[role="button"]` (index.astro:653), the header hamburger `<summary>` (dream.css:2523; the chapter compass summary *does* press at 2710), and three link-shaped controls (`.me-door` dream.css:647, `.pr-row` press.css:108, `.chapter-rail a` dream.css:2798).

Where press feedback exists it is symmetric (dream.css:2888 `scale 90ms`; eidos.css:799; dream.css:3089, 1654): press and release take the same time.

## Target

```css
/* target — src/styles/pages/eidos-product.css, one element-level rule, mirrors dream.css:2870-2876 */
[data-eidos-product] button:active,
[data-eidos-product] [role="button"]:active,
[data-eidos-product] summary:active,
[data-eidos-product] .ep-action:active,
[data-eidos-product] .ep-visual-open:active { transform: scale(0.97); transition: transform 160ms var(--ease-out); }
/* release snaps: the system answers faster than the hand pressed */
[data-eidos-product] button, [data-eidos-product] [role="button"], [data-eidos-product] summary,
[data-eidos-product] .ep-action, [data-eidos-product] .ep-visual-open { transition: transform 90ms var(--ease-out); }
```

Where a control already transitions `color`/`background` (`.ep-action` 214, `.ep-weather` 445, `.in-btn` studio 438), *add* `transform` to its list rather than replacing it, keeping the 160ms press / 90ms release split via a `:active { transition-duration: 160ms }` override.

```css
/* target — dream.css, beside line 2876 */
[data-mode="dream"] [role="button"]:active,
[data-mode="dream"] .menu > summary:active,
[data-mode="dream"] .me-door:active,
[data-mode="dream"] .chapter-rail a:active { scale: 0.97; }
[data-mode="dream"] .pr-row:active { scale: 0.99; }   /* a full-width row: subtle */
```

and the existing symmetric releases (dream.css:2888 `scale 90ms`, eidos.css:799, dream.css:3089, dream.css:1654) become press 160ms / release 90ms by adding `:active { transition-duration: 160ms; }` next to each.

`--ease-out` comes from M04; use the literal `cubic-bezier(0.23, 1, 0.32, 1)` if M04 is not in yet.

### Focus, while we are here

`src/styles/pages/eidos-studio.css` has no `:focus-visible` rule at all (product: 7, dream: 19). The studio's controls fall back to the browser's default ring, which differs per browser and clips against the paper. One rule, the same on every studio control:

```css
/* target — eidos-studio.css */
.eidos-studio :is(button, [role="button"], summary, a, input, textarea):focus-visible { outline: 2px solid var(--ep-raspberry); outline-offset: 2px; border-radius: inherit; }
.eidos-studio :is(button, [role="button"], summary, a, input, textarea):focus:not(:focus-visible) { outline: none; }
```

No transition on it (keyboard-initiated).

## Repo conventions to follow

- Exemplar: `dream.css:2869-2895` ("written against the element rather than a list of class names… transform only, so it runs on the compositor"). Keep that voice; the eidos rule is the same idea under a different root attribute.
- The `.hero-stack figure` and pile tilts are not controls; leave them.
- `tests/house-rules.test.mjs` checks radii and hover weights; add one assertion: every stylesheet that styles a `button` also contains `button:active`.

## Steps

1. Add the eidos press rule block (Target) to `eidos-product.css`; it covers the studio too because `.eidos-studio` lives under `[data-eidos-product]`.
2. Add the four homepage selectors beside dream.css:2876 and the `.pr-row` rule in `press.css`.
3. Make the four symmetric releases asymmetric.
4. Extend the house-rules test; build; suite.

## Boundaries

- Do NOT add press feedback to inline text links in prose (they are exempt by the same reasoning as the tap-target rule in dream.css:2915).
- Do NOT change any hover rule here.

## Verification

- **Mechanical**: suite green; in the pane on `/eidos/inbox`, `getComputedStyle(document.getElementById("keep")).transition` includes `transform`.
- **Feel check**: on a phone, tap keep, pass, a filter, the faun guide, "open moodboard", a plate, the header hamburger on `/`, a journey row, the "more of what i love" pill, a press row: each dips to 0.97 (0.99 for the row) on touch and snaps back faster than it went down. In DevTools Animations panel at 10%: press ≈ 160ms, release ≈ 90ms.
- **Done when**: no pressable thing on either surface is inert under the finger.
