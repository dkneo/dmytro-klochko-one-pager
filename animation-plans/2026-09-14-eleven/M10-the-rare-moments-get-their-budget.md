# M10 — The rare moments get their delight budget

- **Status**: TODO
- **Commit**: bb2e3f5
- **Severity**: LOW–MEDIUM (additive)
- **Category**: 8. Missed opportunities
- **Estimated scope**: `src/pages/eidos/inbox.astro` (`rest_`, `shutOut`, `record`/`count`), `src/pages/eidos/reads.astro` (same three + the throw handler)

## Problem

Four moments carry meaning and render as a teleport:

1. **End of the deck** (`inbox.astro:573-592`, `reads.astro rest_`): the card vanishes, "that is all of them. N kept…" appears, every kept thumbnail paints in the same frame. The one moment the sitting builds to.
2. **The gate** (`inbox.astro:624-637`, `reads.astro shutOut`): the whole workbench disappears and a password form is suddenly there, scrolled to with `behavior: "instant"`. The most jarring state change on either studio page; it reads as a bug.
3. **The sitting's record** (`inbox.astro:470-502`, `reads.astro:210-228`): the trail is rebuilt and the counter rewritten on every verdict with no acknowledgement — the one confirmation that the verdict landed is invisible. This fires tens of times per sitting, so it gets the smallest budget.
4. **The first thrown link** (`reads.astro:338-359`): saved to the queue beside the composer, the connection stated only in prose.

## Target

```js
// 1 — end of the deck: reveal the sentence, then deal the shelf
noteLine.animate([{ clipPath: "inset(0 0 100% 0)", opacity: 0 }, { clipPath: "inset(0 0 0 0)", opacity: 1 }], { duration: 300, easing: "cubic-bezier(0.23, 1, 0.32, 1)", fill: "backwards" });
row.querySelectorAll("img, i").forEach((el, i) => el.animate([{ opacity: 0, transform: "translateY(8px) scale(0.94)" }, { opacity: 1, transform: "none" }], { duration: 260, easing: "cubic-bezier(0.23, 1, 0.32, 1)", delay: 300 + Math.min(i, 8) * 50, fill: "backwards" }));

// 2 — the gate: workbench fades, gate rises, scroll is smooth unless reduced motion
workbench.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 120, easing: "ease", fill: "forwards" }).finished.then(() => {
  workbench.hidden = true; gate.hidden = false;
  gate.animate([{ opacity: 0, transform: "translateY(12px)" }, { opacity: 1, transform: "none" }], { duration: 240, easing: "cubic-bezier(0.23, 1, 0.32, 1)" });
  gate.scrollIntoView({ block: "center", behavior: reduced ? "instant" : "smooth" });
});

// 3 — the record: prepend one row and animate only it; tick the digits by opacity
const li = rowFor(entry); trail.prepend(li); while (trail.children.length > 5) trail.lastChild.remove();
li.animate([{ opacity: 0, transform: "translateY(-6px)" }, { opacity: 1, transform: "none" }], { duration: 180, easing: "cubic-bezier(0.23, 1, 0.32, 1)" });
countEl.animate([{ opacity: 1 }, { opacity: 0.35 }, { opacity: 1 }], { duration: 160, easing: "ease" });   // digits are tabular-nums; they must not move

// 4 — the thrown link flies to the stage
const from = urlField.getBoundingClientRect(), to = stage.getBoundingClientRect();
const ghost = document.createElement("span"); ghost.className = "in-ghost"; ghost.textContent = host(url); document.body.append(ghost);
Object.assign(ghost.style, { position: "fixed", left: `${from.left}px`, top: `${from.top}px`, width: `${from.width}px`, pointerEvents: "none" });
ghost.animate([{ transform: "none", opacity: 1 }, { transform: `translate(${to.left - from.left}px, ${to.top - from.top}px) scale(0.6)`, opacity: 0 }], { duration: 320, easing: "cubic-bezier(0.23, 1, 0.32, 1)" }).finished.then(() => ghost.remove());
stage.animate([{ transform: "translateY(-4px)" }, { transform: "none" }], { duration: 180, easing: "cubic-bezier(0.23, 1, 0.32, 1)", delay: 260 });
```

All four: `if (matchMedia("(prefers-reduced-motion: reduce)").matches)` → keep only the opacity halves (no `clipPath`, no `transform`), and no ghost.

## Repo conventions to follow

- WAAPI (`el.animate`) is already the repo's tool for one-off JS motion (`EidosMoodboard.astro` surprise); CSS handles predetermined motion.
- Digits everywhere are `tabular-nums` (CHECKLIST.md); the counter tick must not change layout.
- Budget: DESIGN.md:424 — repeated decisions ≤ 240ms. Item 3 is 180ms; items 1, 2, 4 are rare and may exceed it.

## Steps

1. `rest_` in both rooms (item 1).
2. `shutOut` in both rooms (item 2).
3. `record`/`renderTrail`/`count` in both rooms (item 3): stop `replaceChildren()`; prepend.
4. The throw handler in `reads.astro` (item 4); when the deck was empty and `next()` deals at once, skip the ghost and let M09's deal entrance carry it.
5. Build; suite; feel check.

## Boundaries

- Do NOT add motion to the verdict itself beyond M02/M09.
- Do NOT stagger more than 8 thumbnails or exceed 350ms total on the shelf.

## Verification

- **Mechanical**: suite green; no layout shift on the counter (CLS in the pane stays 0 while judging ten cards).
- **Feel check**: judge a whole shelf to the end: the closing line unrolls, then the kept pictures deal onto the shelf one by one. Log out in another tab and swipe: the workbench dims and the gate rises into view smoothly. Watch the sitting trail while judging: each new line slides in at the top and the count blinks once. Throw a link: its hostname flies from the field to the stage, which nods.
- **Done when**: all four moments are visible as events, and the reduced-motion path shows each as a fade.
