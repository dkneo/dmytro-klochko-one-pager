# M05 — Reversible things use transitions, not keyframes

- **Status**: TODO
- **Commit**: bb2e3f5
- **Severity**: MEDIUM
- **Category**: 4. Interruptibility
- **Estimated scope**: `src/styles/dream.css` (menu, cv-open), `src/styles/pages/eidos-studio.css` (loader, stamp, faun), `src/styles/pages/eidos.css:816` (atlas detail), `src/pages/eidos/inbox.astro:449-469` (loader/faun JS), `src/components/eidos/EidosMoodboard.astro` (surprise wobble)

## Problem

Keyframes restart from zero and cannot be reversed; transitions retarget from wherever they are. Six reversible or rapidly re-triggered pieces of UI use keyframes:

```css
/* src/styles/dream.css:2899-2907 — current: the header menu, opens with a keyframe, closes with a hard cut */
[data-mode="dream"] .menu-drop { transform-origin: top right; animation: menu-open 0.18s var(--ease) both; }
/* src/styles/dream.css:2572 — a second, dead animation on the same element */
[data-mode="dream"] .menu-drop { … animation: cv-unfold 0.2s var(--ease) both; }
/* src/styles/dream.css:2236-2251 — read-more: 340ms open, instant close */
[data-mode="dream"] .cv-open { animation: cv-unfold 0.34s var(--ease) both; }
/* src/styles/pages/eidos-studio.css:367-381 + inbox.astro:449-454 — the loader is force-restarted with a reflow */
plateLoader.classList.remove("is-active"); void plateLoader.offsetWidth; plateLoader.classList.add("is-active");
/* eidos-studio.css:430-435, 264-266 — favourite stamp and faun reaction, keyframes on a control fired many times a minute */
/* src/styles/pages/eidos.css:816 — the atlas detail panel: em-rise keyframe, teleports or replays */
/* EidosMoodboard.astro (surprise): piece.animate([rotate(-1deg), rotate(1deg), none], { duration: 420 }) stacks on mash */
```

`.gloss-note` (dream.css:1318-1339) already shows the right shape: transitions + `@starting-style`, asymmetric 140ms in / 190ms out, trigger-anchored origin.

## Target

```css
/* target — header menu (dream.css), replaces both animation declarations */
[data-mode="dream"] .menu-drop {
  transform-origin: top right;
  opacity: 0; transform: translateY(-4px) scale(0.94);
  transition: opacity 120ms var(--ease-out), transform 120ms var(--ease-out), display 120ms allow-discrete;
}
[data-mode="dream"] .menu[open] > .menu-drop { opacity: 1; transform: none; transition-duration: 180ms, 180ms, 180ms; }
@starting-style { [data-mode="dream"] .menu[open] > .menu-drop { opacity: 0; transform: translateY(-4px) scale(0.94); } }

/* target — read-more */
[data-mode="dream"] .cv-open { opacity: 0; transform: translateY(-4px); transition: opacity 140ms var(--ease-out), transform 140ms var(--ease-out); }
[data-mode="dream"] .cv-job[open] .cv-open { opacity: 1; transform: none; transition-duration: 200ms, 200ms; }
@starting-style { [data-mode="dream"] .cv-job[open] .cv-open { opacity: 0; transform: translateY(-4px); } }

/* target — favourite stamp: same look, driven by the class, retargets on a fast second favourite */
.eidos-studio .in-favorite-stamp { opacity: 0; transform: translate(-50%, -50%) rotate(-7deg) scale(0.92); transition: opacity 120ms var(--ease-out), transform 260ms var(--ease-out); }
.eidos-studio .in-card.is-favorite .in-favorite-stamp { opacity: 1; transform: translate(-50%, -50%) rotate(-7deg) scale(1); }

/* target — faun reaction: the same transition vocabulary the [data-preview] states already use (studio 252-263) */
.eidos-studio [data-state="favorite"] .in-faun-key { transform: translateY(-3px) scale(1.04); transition: transform 260ms var(--ease-out); }

/* target — atlas detail panel */
[data-mode="dream"] .em-detail { opacity: 0; transform: translateY(6px); transition: opacity var(--dur) var(--ease-out), transform var(--dur) var(--ease-out); }
[data-mode="dream"] .em-detail[data-open] { opacity: 1; transform: none; }
```

Loader: keep the print-registration feel but stop forcing reflows — drive the rings from `data-state="loading" | "done"` with transitions on `opacity`/`transform` (280ms `var(--ease-out)`), and gate re-entry: if a new plate is requested within 280ms of the last, do not restart, only extend.

Surprise wobble: before starting a new `animate()`, `previous?.cancel()`; set `duration: 240`, easing `var(--ease-out)` literal `cubic-bezier(0.23, 1, 0.32, 1)`; or replace with an `is-found` class carrying a `transform` transition.

## Repo conventions to follow

- Exemplar: `dream.css:1318-1339` (`.gloss-note`).
- `display … allow-discrete` and `@starting-style` are already used by the gloss popover; keep the `[hidden]`/`details[open]` mechanics as they are.
- Reduced motion: keep the opacity half of each transition and drop the transform half (see M07).

## Steps

1. Menu: delete the `animation` line at dream.css:2572 and replace the block at 2899-2907 with Target; check that closing now fades out (120ms).
2. Read-more: replace the keyframe at 2236-2251 with Target.
3. Studio: stamp, faun state, loader as in Target; remove `void plateLoader.offsetWidth` and the timer-plus-keyframe pairing at inbox.astro:462-469 in favour of `dataset.state` toggles.
4. Atlas detail: set `data-open` from the script that fills the panel; remove `em-rise` usage.
5. Moodboard surprise: cancel-before-start.
6. Build; suite; pane: open/close the menu five times in a second — it never jumps back to `scale(0.94)`.

## Boundaries

- Do NOT change the `transform-origin: top right` of the menu (settled, Emil's fifth tip, dream.css:2895-2898).
- Do NOT alter the ambient keyframes or the `fly` keyframe in global.css.

## Verification

- **Mechanical**: suite green; `grep -n "menu-open\|cv-unfold\|em-rise\|favorite-press\|faun-favorite" src/styles/*.css src/styles/pages/*.css` returns only the `@keyframes` definitions if any remain unused (delete those too).
- **Feel check**: mash the hamburger: the panel follows the taps, retargeting mid-flight, and it fades out rather than vanishing. Toggle a read-more twice quickly: it reverses from wherever it was. Favourite two cards in a row with the mouse: the second stamp does not flash from zero. Rapid-fire plates: the loader never stutters.
- **Done when**: nothing reversible in the UI is driven by `@keyframes`.
