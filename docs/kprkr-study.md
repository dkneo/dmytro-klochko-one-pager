# kprkr.co, taken apart

He asked for this one studied "VERY THOUGHTFULLY and RIGOROUSLY — animations,
grid etc". Read from the shipped bytes on 23 aug 2026, not from squinting:
the Next.js chunks, the one 16KB stylesheet, and the rendered DOM.

## The stack

Next.js (pages router) + Tailwind arbitrary values + **GSAP with CustomEase**
+ **Lenis** smooth scroll (lerp 0.1). No canvas, no three.js, no scroll-jacking
theatrics. The whole site is text.

## The animation system — two named eases, total discipline

Everything on the site moves with one of two curves, registered once:

```js
CustomEase.create("text",  "0.3, 0, 0, 1")        // entrances of type
CustomEase.create("slick", "0.62, 0.05, 0.01, 0.99") // spatial moves
```

- **`text`** is a hard ease-out: instantly moving, very long glide to rest.
  Used with `stagger: 0.1` (per line) and `stagger: 0.01` (per character),
  short delays chained. This is why the type feels poured rather than faded.
- **`slick`** is the signature: it holds back for most of its duration
  (control point at x=0.62 with only 5% progress), then covers nearly all the
  distance at once and stops dead (0.01, 0.99). Runs ~0.9–1.0s. The feel is
  "nothing, nothing, SNAP — parked." Panels and page transitions use it.
- A few `power3.inOut` for symmetric moves; `linear` only for color hovers
  (`transition: color .2s linear` is the *only* CSS transition on the site).
- Durations observed: 0.4 / 0.5 / 0.9 / 1.0. Nothing between 0.5 and 0.9:
  small things are fast, big things are slow, no mush in the middle.

The header mounts at `opacity-0` and is revealed by GSAP, so first paint is
composed by the animation system, not by CSS defaults.

## The grid that isn't a grid

`display: grid` count in the rendered DOM: **zero**. Thirty-three flex
containers, three fixed/absolute rails. The grid *feeling* comes from:

- one spacing atom: **11px** gutters everywhere (`ml-[11px]`, `mx-[11px]`),
  with 20/28px verticals — an odd number, consistently applied, reads as
  intentional rather than framework-default.
- a **spec-sheet aside**, fixed left: label/value rows (Location / Local Time
  / Studio / Social / Contact), with a live-ticking local clock.
- a numbered index for nav: `01. Info ←`, `02. Work ←` — the arrow is part of
  the label, kinetic on hover.
- prose capped at `max-w-[476px]`.

## The typography

Roobert, and exactly **two font sizes render on the entire page: 14px and
16px**. Hierarchy is done with color (#fff on #000, dimmed rows), numbering,
and position — never with size. That is the boldest choice on the site and
the reason it reads as a spec sheet rather than a portfolio.

Also: `.pixelImage { image-rendering: pixelated }` — thumbnails are allowed
to be pixels on purpose, which is cheaper than pretending they're photos.

## What we take (argued against CHECKLIST.md)

1. **Named eases as tokens.** We already run `ease(0.2,0,0.2,1)` + two
   durations. Adopted: `ease-text(0.3,0,0,1)` for anything *entering as
   text* — first applied to the pond's haiku reveal. The `slick` curve is
   noted for a future page transition, not sprinkled: on a quiet site a
   snap-stop everywhere would be noise (Hates #6, loud gestures in the quiet
   design).
2. **No middle durations.** Their 0.5→0.9 gap matches our 200/320ms split;
   long choreographies (pond dusk, sky crossfades) live seconds away from UI
   motion. Keep the gap deliberate.
3. **Hierarchy without size** is already our mono-label voice; kprkr proves
   it can carry a whole site. Reference point, not a to-do.

## What we leave

- **Lenis.** Smooth-scroll interception fights `prefers-reduced-motion`,
  trackpads, and find-in-page. Our pages are short; the win isn't there.
- **Two-font-size absolutism.** His art needs display type (Loves #1, #7);
  the spec-sheet look fits a designer selling restraint, not a painter.
- **opacity-0 until JS.** Our pages must read with no script at all (the
  pond degrades to a still painting; /today renders day one).
