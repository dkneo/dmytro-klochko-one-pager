# M01 — The reading room answers keys instantly, like discover already does

- **Status**: TODO
- **Commit**: bb2e3f5
- **Severity**: HIGH
- **Category**: 1. Purpose & frequency · 4. Interruptibility
- **Estimated scope**: 1 file (`src/pages/eidos/reads.astro`, script block), ~30 lines

## Problem

The owner judges reads with `→`/`l` and `←`/`h`, 100+ times a day. Every keystroke pays the 240ms pointer animation and the 240ms wait:

```js
// src/pages/eidos/reads.astro:362-372 — current
function fly(dir) { card.classList.add("is-flying"); card.style.transform = `translateX(${dir * 120}vw) rotate(${dir * 16}deg)`; card.style.opacity = "0"; }
function pass() {
  …
  record(cand, "pass"); fly(-1); send(cand, "pass", "", line); sat++; setTimeout(next, 240);
}
function keep() {
  …
  keptThis.push(cand); record(cand, "keep"); send(cand, "keep", cand.weather, line); sat++; fly(1); setTimeout(next, 240);
}
```

and a `pointercancel` (scroll takeover, palm) commits a verdict if the finger had travelled 110px:

```js
// src/pages/eidos/reads.astro:437 — current
card.addEventListener("pointercancel", onUp);
```

`src/pages/eidos/inbox.astro` already solves both (`origin` threading at 697-717, `decisionDelay(origin)`, `onCancel` at 790-798). The reading room was written a day later without them.

## Target

Mirror the inbox exactly:

```js
// target
const decisionDelay = (origin) => (origin === "keyboard" ? 0 : 240);
function fly(dir, origin) {
  if (origin === "keyboard") { card.style.opacity = "0"; return; }   // no flight on the 100+/day path
  card.classList.add("is-flying");
  card.style.transform = `translateX(${dir * 120}vw) rotate(${dir * 16}deg)`;
  card.style.opacity = "0";
}
function pass(origin = "pointer") { …; fly(-1, origin); send(…); sat++; setTimeout(next, decisionDelay(origin)); }
function keep(origin = "pointer") { …; fly(1, origin); send(…); sat++; setTimeout(next, decisionDelay(origin)); }

$("pass").addEventListener("click", (e) => pass(e.detail === 0 ? "keyboard" : "button"));
$("keep").addEventListener("click", (e) => keep(e.detail === 0 ? "keyboard" : "button"));
const KEYS = { ArrowRight: () => keep("keyboard"), l: () => keep("keyboard"), ArrowLeft: () => pass("keyboard"), h: () => pass("keyboard"), … };
// ⌘↵ inside the line field is a keyboard keep too
if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); say.blur(); keep("keyboard"); }

const onCancel = () => { if (!dragging) return; dragging = false; dx = 0; card.classList.add("is-home"); card.style.transform = ""; edgeIn.style.opacity = 0; edgeOut.style.opacity = 0; };
card.addEventListener("pointercancel", onCancel);
```

Drag release (`onUp`) keeps `keep("pointer")` / `pass("pointer")`.

## Repo conventions to follow

- The exemplar is `src/pages/eidos/inbox.astro:690-720` and `:785-798`. Copy its names (`origin`, `decisionDelay`, `onCancel`) so the two rooms read the same.
- `tests/reads-room.test.mjs` "the reading room answers the keyboard like discover does" asserts the key map shape; extend it to assert `decisionDelay` and `onCancel` exist in the source.

## Steps

1. Add `decisionDelay`; thread `origin` through `fly`, `pass`, `keep`, the button listeners, the key map and the ⌘↵ handler as in Target.
2. Add `onCancel`; point `pointercancel` at it.
3. Extend the test; build; run the suite.

## Boundaries

- Do NOT change the pointer path's timing or curves here (M02 owns the gesture).
- Do NOT touch `src/pages/eidos/inbox.astro`.

## Verification

- **Mechanical**: `node --test tests/reads-room.test.mjs` green; `grep -c 'origin' src/pages/eidos/reads.astro` ≥ 10.
- **Feel check**: on `/eidos/reads` hold `l` down for two seconds: cards advance one per keypress with no flight and no 240ms wait (a held key still fires once, the `e.repeat` guard is unchanged). Click keep with the mouse: the card flies as before. Start a drag, then scroll the page mid-drag: the card returns home and no verdict is sent (Network panel shows no POST).
- **Done when**: keyboard judging is instant, pointer judging is unchanged, and a cancelled drag never posts.
