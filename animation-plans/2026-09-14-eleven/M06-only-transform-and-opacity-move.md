# M06 — Only transform and opacity move

- **Status**: TODO
- **Commit**: bb2e3f5
- **Severity**: MEDIUM
- **Category**: 5. Performance (layout-triggering transitions)
- **Estimated scope**: `src/styles/pages/eidos-studio.css:286`, `src/styles/dream.css:230-233, 2446-2447`, `src/styles/global.css:1126-1132`, five `box-shadow` transitions (dream 149, 233, 1197, 1387; product 499), `src/pages/eidos/map.astro` wheel zoom

## Problem

```css
/* src/styles/pages/eidos-studio.css:286 — current: the card stage reflows for 220ms on every deal */
.eidos-studio .in-stage { transition: max-width 220ms var(--ease), margin 220ms var(--ease); }
/* src/styles/dream.css:230-233 — current: the easel's height animates although its width was deliberately stopped (205-208) */
transition: aspect-ratio 220ms var(--ease), transform var(--dur-slow) var(--ease), box-shadow …;
/* src/styles/dream.css:2446-2447 — SVG geometry */
[data-mode="dream"] .map-node > circle + circle { transition: r var(--dur) var(--ease), fill var(--dur) var(--ease); }
/* src/styles/global.css:1126-1132 — paint on every frame of a 320ms sweep */
background-size: 0% 1px; transition: background-size var(--dur-slow) var(--ease), …;
```

Five transitions animate `box-shadow` (repaint each frame); the atlas wheel zoom pushes a continuous gesture through a fixed 220ms tween (`eidos.css:657-659`, `map.astro:272-283`) and dead-stops at the zoom limits (`map.astro:276, 302-303`).

## Target

```css
/* .in-stage: the frame takes its new size at once; the card crossfade covers the change (the homepage's own answer, dream.css:205-208) */
.eidos-studio .in-stage { transition: none; }

/* easel: drop the layout property, keep the rest */
transition: transform var(--dur) var(--ease), box-shadow …;   /* aspect-ratio removed */

/* map node: scale instead of r */
[data-mode="dream"] .map-node > circle + circle { transform-box: fill-box; transform-origin: center; transition: transform var(--dur) var(--ease), fill var(--dur) var(--ease); }
[data-mode="dream"] .map-node.is-on > circle + circle { transform: scale(1.35); }   /* choose the factor that reproduces the current r change exactly */

/* underline sweep: a bar, not a background */
.receipt-src, .ways a { position: relative; }
.receipt-src::after, .ways a::after { content: ""; position: absolute; left: 0; right: 0; bottom: -0.1em; height: 1px; background: currentColor; transform: scaleX(0); transform-origin: left; transition: transform var(--dur) var(--ease); }
.receipt-src:hover::after, .ways a:hover::after { transform: scaleX(1); }

/* shadows: cross-fade a duplicate on ::after */
.x { position: relative; } .x::after { content: ""; position: absolute; inset: 0; border-radius: inherit; box-shadow: <the hover shadow>; opacity: 0; transition: opacity var(--dur) var(--ease); pointer-events: none; }
.x:hover::after { opacity: 1; }
```

Atlas wheel: while wheel events arrive, add `is-dragging` (the class that already disables the transition for drags) and clear it 120ms after the last event; soft-clamp beyond the limits: `z = limit + (z - limit) * 0.25` during the gesture and ease back to `limit` on end.

## Repo conventions to follow

- The written reason at `dream.css:205-208` is the doctrine: "the frame now takes its new width at once and only the picture fades." Apply the same sentence to the stage.
- `tests/house-rules.test.mjs`: add a test that no `transition` in `src/styles/**` names `width`, `height`, `max-width`, `margin`, `padding`, `top`, `left`, `inset`, `aspect-ratio`, `r`, or `background-size` — allow-list the one documented exception (`.arw` top/left, global.css:1102-1116).

## Steps

1. Apply the five CSS changes above.
2. Atlas wheel: `is-dragging` on wheel + idle timeout; soft clamp.
3. Add the layout-property test; build; suite.

## Boundaries

- Do NOT touch `.arw` (documented exception).
- Do NOT change what the hover states look like at rest or at the end of the transition — only what animates in between.

## Verification

- **Mechanical**: suite green; DevTools Performance recording while dealing 10 cards shows no purple "Layout" blocks longer than 2ms during the deal.
- **Feel check**: deal cards: the stage snaps to the new width and the card fades in (no rubbery stage). Hover a map node: it grows the same amount as before. Hover an email in the contact list: the underline sweeps identically. Wheel-zoom the atlas: it follows the wheel without a lag and resists softly at the limits.
- **Done when**: the layout-property test passes and the deal recording is clean.
