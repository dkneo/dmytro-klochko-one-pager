---
name: dmytro klochko — one-pager
description: art & technology, jaywalker at the intersection.
colors:
  paper: "#f7f6f2"
  near-black: "#050505"
  true-black: "#000000"
  blush-grey: "#e9e3e2"
  ink: "#11120f"
  soft-ink: "#343630"
  muted: "#707067"
  muted-on-dark: "#a7a79f"
  rule: "#cfcfc5"
  overcast-blue: "#a7cbe8"
  ink-navy: "#202f62"
  olive-fatigue: "#6b7648"
  dusty-rose: "#d7a1bb"
  worn-ochre: "#90672d"
  personal-heading-pink: "#ba688f"
typography:
  display-hero:
    fontFamily: "Iowan Old Style, Baskerville, 'Times New Roman', serif"
    fontSize: "clamp(3.4rem, 7.5vw, 8rem)"
    fontWeight: 400
    lineHeight: 0.8
    letterSpacing: "-0.075em"
  display-section:
    fontFamily: "Iowan Old Style, Baskerville, 'Times New Roman', serif"
    fontSize: "clamp(3.2rem, 6.5vw, 6.5rem)"
    fontWeight: 400
    lineHeight: 0.86
    letterSpacing: "-0.065em"
  statement:
    fontFamily: "Iowan Old Style, Baskerville, 'Times New Roman', serif"
    fontSize: "clamp(1.9rem, 3vw, 2.9rem)"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "normal"
  lede:
    fontFamily: "Iowan Old Style, Baskerville, 'Times New Roman', serif"
    fontSize: "clamp(1.5rem, 2.4vw, 2.2rem)"
    fontWeight: 400
    lineHeight: 1.25
    letterSpacing: "normal"
  quote:
    fontFamily: "Iowan Old Style, Baskerville, 'Times New Roman', serif"
    fontSize: "clamp(1.2rem, 1.6vw, 1.5rem)"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  body:
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif"
    fontSize: "clamp(1rem, 1.05vw, 1.12rem)"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "normal"
  small:
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif"
    fontSize: "0.88rem"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "normal"
  label:
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif"
    fontSize: "0.78rem"
    fontWeight: 650
    lineHeight: 1
    letterSpacing: "0.08em"
rounded:
  none: "0px"
  pill: "999px"
components:
  menu-toggle:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0.62rem 1rem"
  menu-toggle-open:
    backgroundColor: "{colors.ink}"
    textColor: "#ffffff"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0.62rem 1rem"
  label-chip:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0.55rem 0.8rem"
  text-link:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    padding: "1rem 0"
---

# Design System: dmytro klochko — one-pager

## Overview

**Creative North Star: "The Scrapbook Dossier"**

The system reads as a personal archive treated with the confidence of a press kit. Photography is collaged like a scrapbook — small individual rotations, overlapping z-index, thick solid-color "frames" standing in for tape or a mount board — while the type doing the actual talking is enormous, quiet, and precisely tracked: huge serif headlines at regular (400) weight, never bold, letting scale carry authority instead of decoration. The voice is wry, literary, and quietly confident: lowercase copy throughout, two original poems set in italic serif, and section labels that stay small, uppercase, and heavy (650 weight) in contrast to the headlines above them — the loudest elements in the system are the smallest ones.

The page moves like a sequence of full-bleed magazine spreads rather than a scrolling list of cards: each section is its own tall "page" (min-height set in clamp(), often 50–95rem), and the background alternates deliberately — paper, near-black, paper, navy, paper, a dusty blush-grey, paper, true-black — so the scroll itself has editorial rhythm. Section headlines sit indented from the page edge (16.66% / 8.33% margins) rather than flush-left, another small press-layout tell.

**Key Characteristics:**
- Enormous, regular-weight serif display type paired with tiny, heavy-weight uppercase sans labels — the weight hierarchy is inverted from convention.
- Rotated, overlapping photo collages framed with a solid-color "mount," not a drop shadow.
- Full-bleed section backgrounds alternate paper / dark / paper to punctuate the scroll.
- A single recurring micro-interaction: the outbound-link arrow (↗) nudges up-right on hover/focus, everywhere it appears.
- Pill shape reserved for exactly two things (menu toggle, label chip); everything else is hard-edged.

## Colors

A warm off-white paper ground carries most sections; five muted, slightly desaturated accents each own exactly one section's emphasis color, and three near-black/black surfaces punctuate the scroll.

### Primary
- **Aged Paper** (`#f7f6f2`): the default page background across most sections and the "frame" color boxed around collaged photos on light sections.

### Secondary
- **Ink Navy** (`#202f62`): the hero's `<em>` highlight color, and the full-bleed background of the "ways of working" section — the only accent promoted to a section background.
- **Overcast Blue** (`#a7cbe8`): `<em>` highlight in the "about" and "ways" sections; also the selection (`::selection`) highlight color's near-neighbor family (selection actually uses Dusty Rose, see below).
- **Olive Fatigue** (`#6b7648`): `<em>` highlight in "watch & listen," and the color of the italic press caption. Darkened from the original `#717c4c` (4.14:1 on paper) to `#6b7648` (4.51:1) to clear WCAG AA at smaller text sizes.
- **Dusty Rose** (`#d7a1bb`): the text-selection color and the color of the decorative scribble shapes. The "favorites/taste" heading `<em>` uses a distinct, unrelated deeper pink (`#ba688f`, see below) — not this token.
- **Worn Ochre** (`#90672d`): `<em>` highlight in the press section, and the italic pull-quote caption color there. Darkened from the original `#cc9d5d` (2.27:1 on paper — a hard AA failure even at the large-text threshold) to `#90672d` (4.66:1).

### Neutral
- **Deep Ink** (`#11120f`): primary text color and the default border/rule color for hard edges (pills, dividers, focus outlines).
- **Soft Ink** (`#343630`): the quiet-but-readable text weight. Used for the two poems on Blush Grey (9.64:1), where Faded Graphite would fail AA at body size (3.94:1).
- **Faded Graphite** (`#707067`): secondary/muted text — captions, sub-heads under section titles, timeline index numbers. Darkened from `#737369` (4.43:1) to `#707067` (4.62:1) to clear the 4.5:1 AA threshold at the small sizes it's actually used at.
- **Faded Graphite on Dark** (`#a7a79f`): the muted counterpart used only on the near-black "about" section, for the rotated "still curious. still moving. still making." aside. Measures 8.42:1 on Near Black. Faded Graphite itself is unreadable on that ground, so this is a genuine second token rather than a variant.
- **Personal-Heading Pink** (`#ba688f`): a one-off, distinct from Dusty Rose, used only for the "favorites/taste" heading `<em>`. Darkened from `#bd6f94` (2.82:1 on Blush Grey) to `#ba688f` (3.03:1) — sufficient since this usage is always huge display text (large-text AA threshold is 3:1).
- **Hairline Grey** (`#cfcfc5`): all light-mode divider and border-bottom rules (timeline rows, text-link rows).
- **Near Black** (`#050505`): the "about" section's full-bleed background.
- **True Black** (`#000000`): the "social" section and footer's full-bleed background.
- **Blush Grey** (`#e9e3e2`): the "personal / taste-shelf" section's full-bleed background — the one warm neutral surface that isn't Aged Paper.

### Named Rules
**The Inverted Weight Rule.** Headlines are always font-weight 400 regardless of size (up to 13rem); only small uppercase labels and chips get font-weight 650. Never bold a headline; never regular-weight a label.

**The One Accent Per Section Rule.** Each full-bleed section gets exactly one accent color for its `<em>` emphasis — never mix two accents in the same headline.

## Typography

**Display Font:** Iowan Old Style, with Baskerville and "Times New Roman" as serif fallbacks
**Body Font:** Helvetica Neue, with Helvetica and Arial as sans fallbacks
**Label Font:** the same Helvetica Neue stack as body, distinguished only by weight, size, and letter-spacing, not family

**Character:** A classic editorial pairing — humanist serif for everything meant to be felt, and a plain grotesque sans for everything meant to be scanned (labels, nav, captions, uppercase chrome).

### Hierarchy

Eight steps, all declared as CSS custom properties on `:root` and referenced by name. This replaced an earlier sprawl of 33 ad-hoc `font-size` values that rendered as visually indistinguishable near-duplicates (eight different sizes between 0.61rem and 0.78rem alone).

- **Display Hero** (`--display-hero`, 400, clamp(3.4rem, 7.5vw, 8rem), line-height 0.8): the masthead wordmark, the hero `<h1>`, and the "about me" `<h2>`.
- **Display Section** (`--display-section`, 400, clamp(3.2rem, 6.5vw, 6.5rem), line-height 0.86, tracked to -0.065em): every other section `<h2>`.
- **Statement** (`--text-statement`, serif, clamp(1.9rem, 3vw, 2.9rem)): the largest in-section pull-quotes — the about-title line and the career lede.
- **Lede** (`--text-lede`, serif, clamp(1.5rem, 2.4vw, 2.2rem)): the about-section story line and the career marker.
- **Quote** (`--text-quote`, serif, clamp(1.2rem, 1.6vw, 1.5rem)): reserved for serif asides at mid scale. The two poems deliberately sit a step below this, at Body.
- **Body** (`--text-body`, sans, clamp(1rem, 1.05vw, 1.12rem), line-height 1.55): all running copy — career paragraphs and list, "ways of working," timeline entries, shelf list items. Floors at 16px; it was previously as small as 13.8px.
- **Small** (`--text-small`, sans, 0.88rem): hero notes, section sub-heads, the about-note aside.
- **Label** (`--text-label`, sans, 0.78rem, 650 weight, uppercase): section tags, nav, menu toggle, media chips, figure captions, text-link rows, footer.

### Named Rules
**The One Scale Rule.** Every `font-size` in the stylesheet references one of the eight `--text-*` / `--display-*` tokens. A literal `font-size` value is drift — add a step to the scale or reuse one, never inline a new number.

**The Label Never Grows Rule.** No label, chip, or nav item exceeds 0.78rem regardless of viewport; labels are the one typographic role that does not scale up on desktop.

## Layout

The grid is a `.page-shell` (`width: min(92vw, 90rem)`, centered) reused across sections, with a wider `96vw` variant for the header and a `90vw` variant at the small breakpoint. Within that shell, section grids are consistently asymmetric fractional splits — never 50/50 — for example `2fr 7fr 3fr` (hero copy), `5fr 7fr` (career), `2fr 5fr 5fr` (ways of working), `3fr 3fr 5fr` (taste shelf). Section headlines are indented from the shell's own edge by 16.66% or 8.33% margin-left, separate from where body content starts.

Spacing is fluid rather than a fixed step scale: nearly every gap and block padding is a `clamp()` (e.g. `clamp(2rem, 5vw, 5rem)` for section gaps, `clamp(5rem, 10vw, 9rem)` for section vertical padding), so rhythm compresses and expands continuously with viewport width instead of snapping between fixed sizes.

Each section is sized to feel like a full page rather than a compact block: `min-height` on major sections ranges from ~43rem to ~132rem via clamp(), stacking into a sequence of tall spreads. Two explicit breakpoints reshape this for smaller viewports — 900px mostly adjusts grid column ratios, and 680px collapses most grids to block/stacked layouts, hides secondary decorative photos, and shrinks headline scale substantially (down to `clamp(4rem, 18vw, 6.2rem)` territory). `prefers-reduced-motion` is respected globally — see Motion.

## Elevation & Depth

This is an **open gap, not a settled rule.** The system is flat by default — there is no drop-shadow used for hierarchy or lift anywhere in the base styles — but the two places `box-shadow` does appear pull in different directions and haven't been reconciled into one stated philosophy:

- A solid-color "frame" (`box-shadow: 0 0 0 Xrem var(--paper)`, or white on dark sections) is wrapped around every collaged photo, functioning as a mount/border rather than a shadow.
- Two isolated soft shadows exist outside that pattern: the nav dropdown menu (`0 0.8rem 2rem rgb(17 18 15 / 12%)`) and the color swatches (`0 0.4rem 1rem rgb(17 18 15 / 9%)`) — both read as conventional UI elevation, inconsistent with the frame-not-shadow treatment used everywhere else.

Depth otherwise comes entirely from rotation, overlap, and `z-index` layering of collaged elements, not from shadow. Resolve the nav/swatch shadows deliberately (either extend real elevation to more UI chrome, or convert them to the frame treatment) rather than treating their current form as precedent.

## Shapes

Photos are never plain rectangles: each sits in an overlapping, individually rotated collage (roughly -5° to +5°), varying aspect ratio per image (0.62–1.75), giving a hand-arranged scrapbook feel rather than a grid of uniform tiles. The one soft, organic shape in the system is the decorative "scribble" — an irregular blob built from extreme border-radius percentages (e.g. `48% 53% 46% 55%`) doubled with a rotated `::after` layer to look hand-drawn; it's purely decorative, never a container.

Everything else is hard-edged. Rounding is reserved for exactly two functional shapes: the fully pill-shaped menu toggle and label chip (`border-radius: 999px`), both with a 1px solid ink border. Lists, dividers, and link rows use hairline borders with zero radius.

The second decorative mark is the hand-drawn arrow (↗) that points out of the childhood collage, set in the serif at `--glyph-arrow` (4rem) and rotated -22°. It carries a size token of its own because it is a drawn mark scaled to its collage, not text — it is deliberately outside the `--text-*` ramp, and The One Scale Rule does not govern it.

### Named Rules
**The Pill Exception Rule.** Only the menu toggle and label chips get `border-radius: 999px`. No other interactive element, card, or container is rounded.

## Components

### Menu Toggle
- **Shape:** pill (`border-radius: 999px`), 1px solid ink border.
- **Default:** paper background, ink text, uppercase label typography.
- **Open state:** inverts to ink background, white text — the only place in the system that flips background/foreground on interaction.

### Label Chip (media captions)
- **Shape:** pill, 1px solid ink border, transparent background.
- **Use:** sits under each featured vlog thumbnail; label text plus a trailing arrow glyph.

### Text Link (outbound link rows)
- **Style:** flat row, label left / arrow (↗) right, hairline border-bottom (`var(--rule)`, or a low-opacity white on dark sections).
- **Hover / focus:** only the arrow glyph moves — `translate(0.16rem, -0.16rem)` over `--dur` (200ms). This exact micro-interaction is reused on every arrow glyph in the system and is its signature tactile detail.

### Media Card (featured vlog thumbnails)
- **Shape:** image block above a label chip; no border or radius on the image itself.
- **Hover / focus:** the whole card lifts `translateY(-0.5rem)` while the image scales to `1.025` — a confident, deliberate two-part motion (card lifts, image breathes) rather than a single flat hover state.

### Timeline / Numbered List (upbringing timeline, book/record shelves)
- **Style:** top-ruled (`border-top: 1px solid ink`), hairline row dividers (`var(--rule)` or 25% black), zero radius.
- **Index treatment:** small muted sans numerals, zero-padded (`01`, `02`, …), set apart from the row's body copy.

### Navigation
- Native `<details>/<summary>` disclosure doubles as the menu, even on desktop — no JS-driven dropdown.
- Nav links inside the open panel are label-typography rows with a hairline bottom border, last item unbordered.

## Motion

Two layers, kept strictly apart: micro-interactions respond to the pointer, scroll-driven motion responds to the scroll. Both are `transform`/`translate`/`opacity` only, so everything stays on the compositor.

**Tokens.** One easing curve, `--ease` `cubic-bezier(0.2, 0, 0.2, 1)`, and three durations: `--dur-fast` 160ms, `--dur` 200ms, `--dur-slow` 250ms. No transition in the stylesheet may invent its own timing.

### Micro-interactions
- **Arrow nudge** (`--dur`): the signature. Every arrow glyph is `<span class="arrow">` and translates `0.16rem, -0.16rem` on hover/focus.
- **Row acknowledgement** (`--dur`): link rows, nav items and the footer link dim to `opacity: 0.65` on **hover only** — not on `:focus-visible`, because the focus ring is `outline: 2px solid currentColor` and would dim with it.
- **Media card** (`--dur-slow`): the card lifts `translateY(-0.5rem)` and the image scales to `1.025` staged 60ms behind it, so it reads as two motions rather than one.
- **Menu toggle** (`--dur`): the one colour transition in the system. A bordered pill needs a real affordance; dimming it reads as disabled.

### Scroll-driven
No JavaScript. Gated on both `@supports (animation-timeline: scroll())` and `prefers-reduced-motion: no-preference`.

- **Section headings** slide up 1.25rem across their `entry` range.
- **Hero photos** drift differentially (1.5 / 2.75 / 0.9rem, left / centre / right) across their `cover` range, so the collage separates as the hero scrolls past. The photos use the independent `rotate` property so `translate` can animate without clobbering their tilt.

### Named Rules

**The Section Announces Itself Rule.** A section's heading arrives; its contents are simply there. One reveal per section, never more. An earlier version animated 32 hand-picked elements with no statable rule — three sections treated heading and body differently from one another, and because the range is a percentage of element height the fade length varied 6.75x.

**The Never Animate Opacity On A Timeline Rule.** Scroll-driven animations may drive `translate` only. `@supports` proves a browser *parses* `animation-timeline`, not that it *advances* it; a timeline that attaches but reports out-of-range progress makes `animation-fill-mode: both` pin the element at its `from` keyframe permanently. This shipped 30 of 32 content blocks at `opacity: 0` in production. With `translate` the worst case is a 20px offset; with `opacity` it is invisible content. Re-introducing a fade requires a runtime probe, which means JavaScript.

**The Feedback Survives Reduced Motion Rule.** `prefers-reduced-motion: reduce` neutralises movement but deliberately preserves `opacity`, `background-color`, `color` and `border-color` transitions at 120ms. A blanket `transition-duration: 0.01ms` also destroys the feedback that tells a keyboard user where focus is. Any control whose only affordance is a transform needs an opacity fallback under `reduce` — the media cards do.


## Do's and Don'ts

### Do:
- **Do** keep every headline at font-weight 400 no matter how large it gets (up to 13rem) — scale carries emphasis, not boldness (The Inverted Weight Rule).
- **Do** frame collaged photos with a solid-color box-shadow "mount" and a small individual rotation (-5° to 5°); never lay collage photos flush or axis-aligned.
- **Do** reserve font-weight 650 and uppercase tracking for labels, chips, and nav only — never for headlines or body copy.
- **Do** animate the outbound-link arrow (↗) with the same `translate(0.16rem, -0.16rem)` nudge on hover/focus everywhere it appears.
- **Do** alternate full-bleed section backgrounds (paper / near-black / paper / navy / paper / blush-grey / paper / true-black) so no two consecutive sections share a background.
- **Do** indent section `<h2>` headlines from the page-shell edge (8.33% or 16.66% margin-left) rather than flush-left.

### Don't:
- **Don't** add a conventional drop-shadow for elevation or hierarchy — this system conveys depth through rotation, overlap, and z-index, not shadow (see Elevation & Depth for the two existing exceptions that still need reconciling).
- **Don't** round corners on anything except the menu toggle and label chips (The Pill Exception Rule) or the decorative scribble.
- **Don't** set display or headline letter-spacing to normal or positive — serif display type is always tracked tight/negative (-0.065em to -0.075em).
- **Don't** mix two accent colors in a single section's emphasis — one accent owns one section (The One Accent Per Section Rule).
