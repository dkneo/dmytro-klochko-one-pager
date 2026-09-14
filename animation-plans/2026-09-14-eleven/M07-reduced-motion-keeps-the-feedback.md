# M07 — Reduced motion keeps the feedback and drops only the travel

- **Status**: TODO
- **Commit**: bb2e3f5
- **Severity**: HIGH (accessibility)
- **Category**: 6. Accessibility
- **Estimated scope**: `src/styles/global.css:704-713`, `src/styles/dream.css` (1068-1073, eight hover rules, hero-stack), `src/styles/pages/eidos-studio.css:605-618`, `src/styles/pages/eidos-product.css:705-716`, `src/layouts/Layout.astro:297-324`

## Problem

The global reduced-motion rule is wrong on both halves:

```css
/* src/styles/global.css:708-713 — current */
*, *::before, *::after { animation: none !important; transition-duration: 120ms !important; }
```

It kills every keyframe including pure-opacity/colour feedback (`faun-register-*`, `faun-proof`, `cv-unfold`, `menu-open`, `em-rise`), and it *keeps* every movement transition — `.wall figure:hover img { transform: scale(1.05) }`, `.lib-card:hover { translateY(-2px) }`, the parallax — just faster. Reduced motion means fewer and gentler, not zero; and it must drop position changes first.

Also: `dream.css:1068-1073` sets `transition: none` on `.scenes i`, which removes the 900ms opacity crossfade between full-screen paintings, giving reduced-motion users a hard cut. `eidos-studio.css:610-614` and `eidos-product.css:710-716` blanket `transition: none !important`, deleting the opacity/colour feedback on the swipe direction indicators and on `.ep-action`/`.ep-weather`. `eidos-studio.css:618` pins the favourite stamp permanently visible. Eight `:hover` transforms are not gated to `(hover: hover) and (pointer: fine)` (dream.css:165, 634, 1200, 1394, 2982, 3109; global.css:981; studio 556), so a tap on a phone leaves cards and marks displaced. The `lisa` easter egg (Layout.astro:297-324) injects sixteen falling petals with no reduced-motion check. `.hero-stack figure` has no reduced-motion counterpart while its twin `.hi-stack` does (dream.css:3006-3011).

## Target

```css
/* target — src/styles/global.css, replaces 708-713 */
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  /* travel goes; opacity and colour stay */
  *, *::before, *::after { transition-property: opacity, color, background-color, border-color, fill, stroke !important; transition-duration: 160ms !important; }
  /* anything that moves for atmosphere stops; anything that moves as the sole feedback becomes a fade */
  .dream-sky b, .scenes i, .sunpulse, .firelight, .weather s, .glints s, .enter-anim { animation: none !important; transform: none !important; }
}
```

Then per surface, the fades that must survive:

```css
/* dream.css:1068-1073 — target: parallax off, crossfade kept */
@media (prefers-reduced-motion: reduce) { .scenes i { transform: none; } }   /* transition: opacity 900ms stays */

/* eidos-studio.css:610-618 — target */
@media (prefers-reduced-motion: reduce) {
  .eidos-studio .in-faun-key, .eidos-studio .in-faun-echo, .eidos-studio .in-faun-signal { transform: none !important; }   /* opacity 120ms and background 120ms stay */
  .eidos-studio .in-card.is-flying, .eidos-studio .in-card.is-home { transform: none !important; transition: opacity 160ms var(--ease) !important; }
  .eidos-studio .in-card.is-favorite .in-favorite-stamp { animation: favorite-fade 900ms ease both; transform: translate(-50%, -50%) rotate(-7deg); }
}
@keyframes favorite-fade { 0% { opacity: 0; } 20%, 70% { opacity: 1; } 100% { opacity: 0; } }

/* eidos-product.css:710-716 — target: keep colour/opacity, null the transform */
@media (prefers-reduced-motion: reduce) { .ep-action, .ep-weather, .ep-hero-note, .ep-visual-open { transform: none !important; } }

/* dream.css — add beside 3006-3011 */
@media (prefers-reduced-motion: reduce) { [data-mode="dream"] .hero-stack figure, [data-mode="dream"] .hero-stack figure:hover .cell { transform: none; transition: none; } }
```

Wrap the eight hover transforms in `@media (hover: hover) and (pointer: fine) { … }` exactly as `eidos-product.css:547-556` and `dream.css:92, 656` already do. In `Layout.astro:297`, after the `buf !== "lisa"` check add `if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;` (mirrors line 274).

## Repo conventions to follow

- CHECKLIST.md §6: "Reduced motion drops the transition and keeps the colour"; DESIGN.md:424: "reduced motion removes travel while preserving quiet state feedback". The target above is those two sentences as CSS.
- Exemplar hover gate: `eidos-product.css:547-556`.
- `tests/reading-room.test.mjs` and `tests/house-rules.test.mjs` read CSS via `allCss()`; add a test that the reduced-motion block does not contain `animation: none !important` on `*` and that every `:hover` rule with `transform` sits inside a `(hover: hover)` media block.

## Steps

1. Replace the global blanket with Target.
2. Apply the four surface-level corrections.
3. Gate the eight hover transforms.
4. Guard the `lisa` egg.
5. Add the tests; build; suite.

## Boundaries

- Do NOT remove any reduced-motion branch that already keeps opacity (e.g. `.gloss-note` dream.css:1355-1361).
- Do NOT change what happens for users without reduced motion.

## Verification

- **Mechanical**: suite green; with DevTools Rendering → "prefers-reduced-motion: reduce": `document.getAnimations()` on `/` at rest returns 0; hover a wall print: no scale; scroll between acts: the paintings still crossfade.
- **Feel check** (reduced motion on): open the menu — it fades in; keep a card — it fades out; favourite — the stamp fades in and out, never sticks; the faun's keep/pass colour still changes as you drag. On a phone with reduced motion off: tap a wall print, then tap elsewhere — nothing stays enlarged.
- **Done when**: every state on both surfaces is still communicated under reduced motion, by opacity or colour, and nothing travels.
