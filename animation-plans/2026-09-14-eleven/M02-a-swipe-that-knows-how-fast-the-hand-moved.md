# M02 — A swipe that knows how fast the hand moved

- **Status**: TODO
- **Commit**: bb2e3f5
- **Severity**: HIGH
- **Category**: 4. Interruptibility · 3. Physicality
- **Estimated scope**: `src/pages/eidos/inbox.astro` (drag block ~765-798), `src/pages/eidos/reads.astro` (drag block ~419-437), `src/styles/pages/eidos-studio.css:314-315, 407-409`

## Problem

The card is the product's one gesture and it is judged on distance alone:

```js
// src/pages/eidos/inbox.astro:785 — current (reads.astro:430 identical)
if (dx > 110) keep("pointer"); else if (dx < -110) pass("pointer");
```

A fast 90px flick "puts it back"; a slow 115px drag commits. `onDown` records only `x0`, never a time. Re-grabbing a card mid-settle teleports it:

```js
// src/pages/eidos/inbox.astro:765 — current
const onDown = (e) => { …; card.classList.remove("is-flying", "is-home"); x0 = e.clientX; … };
```

The leave and the return are fixed tweens regardless of release speed:

```css
/* src/styles/pages/eidos-studio.css:314-315 — current */
.eidos-studio .in-card.is-flying { transition: transform 240ms cubic-bezier(0.2, 0, 0.2, 1), opacity 220ms var(--ease); }
.eidos-studio .in-card.is-home   { transition: transform 220ms cubic-bezier(0.18, 0.72, 0.18, 1); }
```

and the keep/pass stamps only fade (`edgeIn.style.opacity = dx / 90`), never move with the hand.

## Target

```js
// target — both rooms, identical code
let x0 = 0, t0 = 0, dx = 0, vx = 0, lastX = 0, lastT = 0, dragging = false;
const onDown = (e) => {
  if (!cur || busy || e.target.closest("a, button, input, textarea, label")) return;
  // read the live offset so a re-grab continues from where the card is, not from zero
  const live = new DOMMatrix(getComputedStyle(card).transform).m41 || 0;
  card.classList.remove("is-flying", "is-home");
  dragging = true; x0 = e.clientX - live; lastX = e.clientX; lastT = t0 = performance.now(); vx = 0;
  card.setPointerCapture?.(e.pointerId);
  card.style.willChange = "transform";
};
const onMove = (e) => {
  if (!dragging) return;
  const now = performance.now();
  vx = 0.7 * vx + 0.3 * ((e.clientX - lastX) / Math.max(1, now - lastT));  // px/ms, smoothed
  lastX = e.clientX; lastT = now;
  dx = e.clientX - x0;
  card.style.transform = `translateX(${dx}px) rotate(${dx / 22}deg)`;
  const k = Math.min(1, Math.abs(dx) / 90);
  (dx > 0 ? edgeIn : edgeOut).style.opacity = k;
  (dx > 0 ? edgeIn : edgeOut).style.transform = `${dx > 0 ? "rotate(6deg)" : "rotate(-6deg)"} scale(${0.9 + 0.1 * k})`;
  (dx > 0 ? edgeOut : edgeIn).style.opacity = 0;
};
const onUp = () => {
  if (!dragging) return;
  dragging = false;
  const commit = Math.abs(dx) > 110 || Math.abs(vx) > 0.11;   // distance OR velocity (AUDIT: ~0.11 px/ms)
  if (commit) {
    // the flight lasts as long as the hand implies: fast flick, fast exit; clamp 160–300ms
    const ms = Math.round(Math.min(300, Math.max(160, 260 - Math.abs(vx) * 400)));
    card.style.transitionDuration = `${ms}ms, ${ms}ms`;
    (dx > 0 || vx > 0.11) ? keep("pointer") : pass("pointer");
  } else {
    card.classList.add("is-home"); card.style.transform = ""; edgeIn.style.opacity = 0; edgeOut.style.opacity = 0;
  }
  card.style.willChange = ""; dx = 0; vx = 0;
};
```

```css
/* target — eidos-studio.css */
.eidos-studio .in-card.is-flying { transition: transform 240ms var(--ease-out), opacity 200ms var(--ease-out); }  /* duration overridden inline from velocity */
.eidos-studio .in-card.is-home   { transition: transform 300ms cubic-bezier(0.32, 0.72, 0, 1); }                 /* the drawer curve: settles like a spring without one */
.eidos-studio .in-edge { transition: transform 120ms var(--ease-out); }  /* the stamp lands, it does not only fade */
```

`--ease-out: cubic-bezier(0.23, 1, 0.32, 1)` is added in M04; if M04 is not applied yet, write the literal.

## Repo conventions to follow

- The two rooms must stay identical in gesture code; `src/pages/eidos/inbox.astro` is the source of truth, `reads.astro` copies it.
- `will-change` is set only for the life of the gesture (P06 removes the permanent one at `eidos-studio.css:311`).
- Reduced motion: `eidos-studio.css:605-618` already drops the flight; leave that branch.

## Steps

1. Replace the drag block in `inbox.astro` with Target; then copy the identical block into `reads.astro` (after M01 has added `onCancel`, keep it).
2. Change the three CSS rules.
3. Build; suite; pane check with a synthetic pointer sequence (pointerdown at x=300, three pointermoves to x=380 within 60ms, pointerup) → the card commits on velocity though it moved only 80px.

## Boundaries

- Do NOT add a physics library; the drawer curve + velocity-scaled duration is the whole "spring".
- Do NOT change the 120vw / 16deg exit pose.
- Do NOT touch the keyboard path (M01).

## Verification

- **Mechanical**: suite green; the synthetic-pointer pane check above commits; a slow 100px drag returns home.
- **Feel check**: on a trackpad, flick a card 70px hard: it commits and leaves fast. Drag it 115px slowly and release: it commits and leaves at the base speed. Drag 60px and release: it settles home on the drawer curve with no bounce-back and no snap. Grab a card while it is settling: it continues from where it is. The keep stamp grows as the card travels and is at full size at the commit line.
- **Done when**: all five feel checks pass on a trackpad and on a phone.
