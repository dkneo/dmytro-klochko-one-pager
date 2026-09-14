# P06 — An ambient budget: pay only for motion that is on screen

- **Status**: TODO
- **Commit**: bb2e3f5
- **Severity**: HIGH (performance: 43 infinite animations at rest; parent-variable transforms; 3 300 element moodboard layout)
- **Category**: Performance — compositor and main-thread work at rest
- **Estimated scope**: `src/styles/dream.css`, `src/styles/global.css`, `src/layouts/Layout.astro` (sky/pile handlers), `src/scripts/motion-control.js`, `src/scripts/petal-field.js`, `src/components/eidos/EidosHero.astro`, `src/styles/pages/eidos-product.css`, `src/pages/eidos/inbox.astro` (dead style block)

## Problem

**Forty-three infinite CSS animations run on the homepage at rest**, and none pause when the tab is hidden or the element is off screen:

| loop | elements | file:line | on screen? |
| --- | --- | --- | --- |
| `scene-breathe` (full-viewport image layers, `inset: -6%`) | 3 | dream.css:843 | one at a time; the other two are `opacity: 0` and still scaling |
| `snow-fall` | 16 | dream.css:1558 | never — the homepage has no snow scene; `.weather--snow` is `opacity: 0` forever (dream.css:1479, 1485) |
| `ember-rise` | 10 | dream.css:1517 | only in the ember act |
| `petal-fall` | 9 | dream.css:1099 | yes (until the WebGL field stands them down) |
| `glint-drift` | 4 | dream.css:962 | only in the fire act; also missing from the `data-motion="paused"` list (dream.css:1491-1497) |
| `fire-flicker` | 1 | dream.css:922 | only in the fire act |

`motion-control.js:30` hardcodes `paused: false`, so the whole `animation-play-state: paused` block is unreachable in production and `visibilitychange` (line 52) re-syncs only `<video>`.

**Child transforms are driven by CSS variables written on a parent**, which restyles every descendant on every write:

```js
// src/layouts/Layout.astro:220-221 — current, inside the raw pointermove handler (no rAF)
sky.style.setProperty("--mx", …); sky.style.setProperty("--my", …);
// src/layouts/Layout.astro:244-249 — hero and hi piles, same pattern, no rAF
pile.style.setProperty("--tx", …);
// src/components/eidos/EidosHero.astro:49-50 — rAF-batched, still a parent variable
hero.style.setProperty("--hero-x", x.toFixed(3));
```

with `dream.css:840-841, 888-889, 915-916, 946-947, 515-519` and `eidos-product.css:232, 250, 268-270` reading the variables in `calc()` transforms.

**Dead weight kept warm**: `global.css:814` holds `will-change: transform, opacity` on four fixed `.stars` layers that are `display: none` in dream mode on every page (dream.css:45). `src/pages/eidos/inbox.astro:182` ships a 230-line `<style media="not all">` block that never applies. `petal-field.js:333` starts its render loop before checking `document.hidden`.

**The moodboard lays out 3 288 elements** (398 figures) on every style change; Lighthouse eidos mobile "Style & Layout 157 ms".

## Target

1. **Weather loops run only in their act.** The active scene is already on `<html data-scene="…">` (set by `scene-choreography.js:26-30`). Gate every weather layer the way `sun-pulse` already is (dream.css:894-901):

```css
/* target — dream.css, next to the sun-pulse gate */
html:not([data-scene="snow"]) .weather--snow s,
html:not([data-scene="fire"]) .weather--fire s,
html:not([data-scene="fire"]) .scenes .glints s,
html:not([data-scene="fire"]) .firelight,
html:not([data-scene="ember"]) .weather--ember s,
.scenes i:not(.is-on) { animation-play-state: paused; }
```

For the scene layers, have `scene-choreography.js` toggle `is-on` on the active `.scenes i` (it already knows which one it is fading in) so the two invisible layers stop breathing. Expected count at rest in the fire act: 3 breathe → 1, glints 4, flicker 1, petals 9 (or 0 with the WebGL field) = **≤ 15**, and **0** anywhere off-act.

2. **Hidden tab pauses everything.** In `motion-control.js`, compute `paused: document.hidden` in `apply()` and call `apply()` from the existing `visibilitychange` listener; add `.scenes .glints s` to the paused selector list at dream.css:1491. In `petal-field.js:333`, start with `renderer.setAnimationLoop(document.hidden ? null : tick)` (or the equivalent in the P01 renderer).

3. **Transforms written directly, in one rAF.** In `Layout.astro`, keep the variables for the CSS-only fallback but set `el.style.transform` on each `.scenes i`, `.sunpulse`, `.firelight`, `.glints`, and each pile `figure` inside the existing `ease()` rAF; move the `--mx/--my` writes into that rAF. In `EidosHero.astro`, write `poster.style.transform` and the two notes' transforms inside the rAF that already exists at line 47. Read the per-layer constants (`-34px/-22px`, depth 5/11/18/24, etc.) once from the current CSS and put them in a small table in the script so the motion is identical.

   Where the browser supports it, the scroll half of the parallax should not be JS at all: `animation-timeline: scroll()` with a `@keyframes` that moves each layer by its current `vh` factor, gated `@supports (animation-timeline: scroll())`, with the JS `--scroll` path as fallback. Same motion, zero main-thread work per scroll.

4. **Delete the dead**: the `.stars` block (global.css:789-890) or at minimum its `will-change`; the `media="not all"` style block in `inbox.astro`.

5. **Moodboard containment**: `.ep-visual { content-visibility: auto; contain-intrinsic-size: auto 260px 340px; }` for figures after the first two rows (`.ep-visual:nth-child(n+11)`), so off-screen figures skip layout and paint. Measure "Style & Layout" before and after.

## Repo conventions to follow

- The gate pattern to imitate: `dream.css:894-901` (`sun-pulse` only in the fire act).
- Pause plumbing: `motion-control.js` `apply()`/`motionPolicy()` and the `html[data-motion]` attribute (dream.css:1491-1497).
- Tests: `tests/homepage-motion.test.mjs` "the homepage lights weather only while the hero owns the sky" already asserts scene gating for weather; extend it with a count of `animation:` declarations that are not gated.

## Steps

1. Add the gating block (Target 1); make `scene-choreography.js` set `is-on` on the active layer and remove it from the others when it changes `data-scene`.
2. Wire `paused` to `document.hidden` (Target 2); add the glints selector.
3. Refactor the three pointer handlers to direct transforms in rAF (Target 3); add the `@supports (animation-timeline: scroll())` scroll path with the JS fallback.
4. Remove `.stars` and the dead inbox style block (Target 4).
5. Add `content-visibility` to the moodboard (Target 5).
6. Build, run the suite, then in the pane on `/` at rest: `document.getAnimations().length` ≤ 15 in the fire act, 0 after `document.hidden` (simulate with the Rendering panel "emulate a focused page" off).

## Boundaries

- Do NOT change any keyframe's shape, duration or count of petals/embers/snow; this is about when they run, not how they look.
- Do NOT remove the CSS-variable fallback path; the transform writes replace the *hot path*, the variables stay for `@supports`-less browsers.
- Do NOT touch the video autoplay policy.

## Verification

- **Mechanical**: `npm run build`; suite green; pane: `getAnimations().length` as above; Lighthouse home mobile "Style & Layout" ≤ 250 ms; eidos mobile "Style & Layout" ≤ 90 ms.
- **Feel check**: scroll `/` slowly through all three acts: fire lights only in act one, embers only in act two, nothing runs in the estuary but the petals; move the mouse over the hero: the sky and the print pile answer the hand exactly as before (record before/after and compare frame by frame). Switch tabs and back: motion resumes from where it was.
- **Done when**: ≤ 15 animations at rest in the fire act, 0 with the tab hidden, and the before/after parallax recordings are indistinguishable.
