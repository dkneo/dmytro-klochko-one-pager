# M08 — Crossfades that do not double-expose; entrances that arrive one by one

- **Status**: TODO
- **Commit**: bb2e3f5
- **Severity**: MEDIUM
- **Category**: 7. Cohesion (crossfades, stagger)
- **Estimated scope**: `src/styles/dream.css:248-261, 3174-3205, 1252-1265`, `src/layouts/Layout.astro:334-345`, `src/pages/eidos/inbox.astro:580-589`

## Problem

```css
/* src/styles/dream.css:248-261 — current: two full prints in one mat, symmetric dissolve */
[data-mode="dream"] .easel-layer { opacity: 0; transition: opacity 220ms var(--ease), transform 220ms var(--ease); }
```

For ~110ms two photographs — often two faces — sit superimposed at ~50% each. The `dm` heading does the same inside a word: `.dm-swap > *` crossfades 📨 and "ytro" symmetrically over 320ms (dream.css:3174-3205).

Every `.enter-anim` target already on screen at load gets `is-in` in the same IntersectionObserver callback (Layout.astro:334-345), so groups of rows rise in perfect unison. The end-of-deck kept shelf paints all thumbnails in one frame (inbox.astro:580-589).

## Target

```css
/* easel: the outgoing print leaves faster than the incoming arrives, and a 2px blur masks the overlap */
[data-mode="dream"] .easel-layer { opacity: 0; filter: blur(2px); transition: opacity 140ms var(--ease-out), transform 220ms var(--ease-out), filter 220ms var(--ease-out); }
[data-mode="dream"] .easel-layer.is-active { opacity: 1; filter: blur(0); transition-duration: 220ms, 220ms, 220ms; }

/* dm: no overlap — the envelope is gone before the letters arrive */
[data-mode="dream"] .dm-mail { transition: opacity 120ms var(--ease) 110ms; }          /* rest state: arrives after ytro has gone */
[data-mode="dream"] .dm-ytro { transition: opacity 180ms var(--ease); }
[data-mode="dream"] .card-title:hover .dm-mail { transition-delay: 0ms; }             /* leaves at once */
[data-mode="dream"] .card-title:hover .dm-ytro { transition-delay: 110ms; }           /* arrives after */
```

```js
// Layout.astro:334-345 — target: 60ms stagger inside each observer batch, capped at 240ms, decorative only
entries.filter((e) => e.isIntersecting).forEach((e, i) => {
  e.target.style.transitionDelay = `${Math.min(i, 4) * 60}ms`;
  e.target.classList.add("is-in");
  e.target.addEventListener("transitionend", () => { e.target.style.transitionDelay = ""; }, { once: true });
  io.unobserve(e.target);
});
// inbox.astro:580-589 — target: the kept shelf deals its thumbnails
row.querySelectorAll("img, i").forEach((el, i) => el.animate(
  [{ opacity: 0, transform: "translateY(8px) scale(0.94)" }, { opacity: 1, transform: "none" }],
  { duration: 260, easing: "cubic-bezier(0.23, 1, 0.32, 1)", delay: Math.min(i, 8) * 50, fill: "backwards" }));
```

Under reduced motion the stagger stays (it is opacity-timing) but the blur and the transforms go (M07's block already nulls transforms; add `filter: none` to it).

## Repo conventions to follow

- `.easel-layer` keeps its `scale(0.985) → 1` (dream.css:236-238, settled: two layers trading places).
- The `dm` joke's reduced-motion branch (dream.css:3199-3204) stays.
- `tests/homepage-motion.test.mjs` "the journey easel has two media buffers" must stay green; add an assertion that `.easel-layer` transitions `filter`.

## Steps

1. Easel and dm CSS as in Target.
2. Observer stagger in `Layout.astro`.
3. Kept-shelf WAAPI in `inbox.astro` (and the same in `reads.astro` if it ever shows a shelf).
4. Build; suite.

## Boundaries

- Do NOT exceed `blur(2px)`; do NOT add blur to anything else.
- Stagger must never delay interactivity: rows are clickable from the first frame.

## Verification

- **Mechanical**: suite green; DevTools Animations at 10%: the outgoing easel print is gone at 140ms while the incoming is still arriving.
- **Feel check**: hover down the journey rows quickly: no ghost faces; the swap reads as one print replacing another. Hover the "dm klochko" title: the envelope leaves, then the letters arrive, never both. Reload `/` at the top: the first rows rise one after another, 60ms apart, and are clickable immediately.
- **Done when**: no frame of the easel swap shows two faces, and the load entrance is staggered.
