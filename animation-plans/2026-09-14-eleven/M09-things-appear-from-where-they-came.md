# M09 — Things appear from where they came: the deal, the lightbox, the dialogs

- **Status**: TODO
- **Commit**: bb2e3f5
- **Severity**: MEDIUM (missed opportunities on the product's primary interactions)
- **Category**: 8. Missed opportunities · 3. Origin
- **Estimated scope**: `src/pages/eidos/inbox.astro` + `reads.astro` (`next()`), `src/components/eidos/EidosMoodboard.astro:66-73`, `src/styles/pages/eidos-product.css:533-542`, `src/styles/pages/eidos-studio.css` (`.in-keys`, `.in-comparison`, `.in-next-edge`), `src/styles/dream.css:2719-2733` (chapter compass), `src/styles/pages/eidos.css:748-770` (atlas tip)

## Problem

Three of the product's primary interactions have no motion at all, and one has motion that says nothing about where the thing came from:

- **The deal.** After a card flies, the next one simply exists (`inbox.astro:545-570`: `card.hidden = false; card.style.transform = ""`), while `.in-next-edge` already draws the edge of the next card behind it.
- **The lightbox.** `EidosMoodboard.astro:66-73` calls `detail.showModal()` on a `<dialog>` with zero open/close motion (`eidos-product.css:533-542` has no `[open]` rule, no `@starting-style`). This is the moodboard's main action, under a `zoom-in` cursor.
- **The dialogs** `.in-keys` and `.in-comparison` (studio 520, 529) open and close with a hard cut.
- **The chapter compass list** (dream.css:2719-2733) opens above its pill by teleport, and its positioning `translateX(50%)` means any scale would grow from its centre, not the pill. **The atlas tip** (eidos.css:748-770) fades in place with no origin.

## Target

```js
// the deal — inbox.astro / reads.astro next(), pointer and button origins only (keyboard stays instant)
if (origin !== "keyboard") {
  card.style.transition = "none";
  card.style.transform = "translateY(10px) scale(0.985)"; card.style.opacity = "0";
  requestAnimationFrame(() => {
    card.style.transition = "transform 220ms cubic-bezier(0.23, 1, 0.32, 1), opacity 160ms cubic-bezier(0.23, 1, 0.32, 1)";
    card.style.transform = ""; card.style.opacity = "";
  });
  nextEdge.animate([{ transform: "rotate(0.8deg)" }, { transform: "rotate(1.6deg)" }], { duration: 220, easing: "cubic-bezier(0.23, 1, 0.32, 1)" });
}
```

```css
/* the lightbox — grows from the plate it came from */
.ep-detail { opacity: 0; transform: scale(0.96) translateY(8px); transform-origin: var(--from-x, 50%) var(--from-y, 50%);
  transition: opacity 180ms var(--ease-out), transform 220ms var(--ease-out), overlay 220ms allow-discrete, display 220ms allow-discrete; }
.ep-detail[open] { opacity: 1; transform: none; }
@starting-style { .ep-detail[open] { opacity: 0; transform: scale(0.96) translateY(8px); } }
.ep-detail::backdrop { opacity: 0; transition: opacity 180ms var(--ease-out), overlay 180ms allow-discrete, display 180ms allow-discrete; }
.ep-detail[open]::backdrop { opacity: 1; }
@starting-style { .ep-detail[open]::backdrop { opacity: 0; } }
/* close is faster than open */
.ep-detail:not([open]) { transition-duration: 140ms, 140ms, 140ms, 140ms; }
```

```js
// EidosMoodboard.astro click handler: set the origin from the clicked figure
const r = figure.getBoundingClientRect();
detail.style.setProperty("--from-x", `${((r.left + r.width / 2) / innerWidth * 100).toFixed(1)}%`);
detail.style.setProperty("--from-y", `${((r.top + r.height / 2) / innerHeight * 100).toFixed(1)}%`);
detail.showModal();
```

The same three rules (base, `[open]`, `@starting-style`) apply to `.in-keys` and `.in-comparison` with `transform-origin: center` (modals are exempt from trigger-origin), 180ms open / 140ms close. Chapter compass list: `transform-origin: bottom center`, from `translateY(6px) scale(0.96)`, 180ms `var(--ease-out)`, with `@starting-style`. Atlas tip: `transform: translateX(-50%) translateY(-4px) scale(0.96)` → `translateX(-50%)`, `transform-origin: top center`, 150ms.

`--ease-out` from M04 (`cubic-bezier(0.23, 1, 0.32, 1)`).

## Repo conventions to follow

- DESIGN.md:424 "Repeated decisions finish in 240ms or less": the deal entrance is 220ms and runs in parallel with nothing else; the total from swipe to next card ready stays ≤ 240ms.
- `@starting-style` + `allow-discrete` is the pattern the gloss popover already uses (dream.css:1318-1339).
- Reduced motion: opacity only (M07).

## Steps

1. Deal entrance in both rooms, gated by `origin`.
2. Lightbox CSS + origin variables in the click handler.
3. `.in-keys`, `.in-comparison`, chapter compass, atlas tip.
4. Build; suite; pane: open the lightbox from a plate at the top-left and one at the bottom-right — it grows from each.

## Boundaries

- Do NOT animate on the keyboard path (`origin === "keyboard"`), including `?` opening the keys sheet — the sheet may still fade (opacity only, 120ms) since it is a rare action, but it must not scale.
- Do NOT change any dialog's content or focus behaviour.

## Verification

- **Mechanical**: suite green; the Animations panel shows the lightbox's `transform-origin` changing per plate.
- **Feel check**: click a plate: the detail grows from under the cursor and the plate grid dims behind it; Esc: it shrinks back faster than it grew. Swipe a card with the mouse: the next card rises 10px into place as the pile behind loses a leaf. Press `l`: no entrance, instant. Open the compass: the list unfolds upward from the pill.
- **Done when**: every open/close on both surfaces has an entrance and an exit, and every trigger-anchored panel visibly comes from its trigger.
