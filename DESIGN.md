---
name: dmytro klochko — the session
description: a terminal in deep space. monospace, near-black, one pink accent, ASCII art that is drawn accurately rather than invented.
colors:
  void: "#0e0a11"
  deck: "#171120"
  bone: "#e9e5d8"
  dim: "#9b90a4"
  faint: "#6b6076"
  rule: "rgb(233 229 216 / 9%)"
  cold: "#d8cfe0"
  hot: "#ff6fae"
typography:
  mono: "ui-monospace, SF Mono, SFMono-Regular, Menlo, Consolas, Liberation Mono, monospace"
  serif: "Iowan Old Style, Baskerville, Times New Roman, serif"
  scale:
    t-xs: "0.72rem"
    t-sm: "0.84rem"
    t-md: "0.98rem"
    t-lg: "clamp(1.15rem, 1.5vw, 1.45rem)"
    display: "clamp(1.9rem, 4.6vw, 3.9rem)"
  raster:
    art-cell-sm: "0.55rem"
    art-cell-lg: "1.05rem"
spacing:
  sp-1: "0.5rem"
  sp-2: "1rem"
  sp-3: "1.75rem"
  sp-4: "3rem"
  sp-5: "clamp(4rem, 7vw, 6.5rem)"
  gutter: "clamp(1.25rem, 5vw, 5rem)"
  measure: "min(100%, 74ch)"
motion:
  ease: "cubic-bezier(0.2, 0, 0.2, 1)"
  dur: "200ms"
  dur-slow: "320ms"
---

# Design System: dmytro klochko — The Session

## Overview

A terminal in deep space. Near-black ground, bone type, one pink accent, a
starfield flying past, and ASCII art. Monospace carries every structural role.

This document describes what shipped, not what was intended. It replaces an
earlier system entirely — cream paper, a serif display face, riso ink bands,
duotone photographs — none of which exists any more. If something here
contradicts an older commit message, this file is right.

## Colors

Five neutrals and two accents. That is the whole palette.

- `--void` `#0e0a11` — the ground. Warm near-black, not neutral: a flat
  neutral black read as "just black" and had no light in it.
- `--deck` `#171120` — behind images and frames, one step up from the void.
- `--bone` `#e9e5d8` — body type. Warm off-white, never pure white.
- `--dim` `#9b90a4` / `--faint` `#6b6076` — secondary and tertiary type.
- `--rule` 9% bone — the few hairlines that survive.
- `--cold` `#d8cfe0` — ASCII art at rest.
- `--hot` `#ff6fae` — the single accent. Section numbers, current nav item,
  the sign-off, art on hover.

### Named Rules

**The One Accent Rule.** `--hot` appears at most twice per section: once on the
section number, once on whatever is interactive. It is the only saturated
colour on the site and it stops being an accent the moment it is common.

**The Warm Black Rule.** The ground is never `#000` and never neutral. A page
lit only by a starfield needs its black to have a temperature or the whole
thing reads as an unstyled document.

## Typography

Monospace does everything structural: navigation, section cards, the register,
labels, captions, body copy. The serif appears **twice on the entire site**,
both times for a poem, because that is the only voice here that is not the
terminal's.

Five sizes. A monospace system does not need more. The previous system had
eight and read, in the client's words, as a circus — which was never the
fonts, but two families pretending to be five roles.

### Named Rules

**The Two Voices Rule.** Mono is the site speaking. Serif is Dmytro speaking.
There is no third voice, and the serif is rationed hard enough that its
appearance is an event.

**The Raster Is Not Type Rule.** ASCII art is sized from `--art-cell-*`, which
sits deliberately outside the reading ramp. A drawing made of characters is an
image sized to its drawing, not a reading size. Two steps exist because a small
drifting object and a mark that anchors a column are different problems. This
rule has been rediscovered three times by pushing art onto the type ramp and
watching it either crop or float in an empty box; it is written down now so it
stops being rediscovered.

**The Advance Is Not 0.6em Rule.** Cell sizes are stated, never solved from an
assumed monospace advance. `100cqi / (cols * 0.6)` looks principled and was
wrong in practice: the ship drew 292px against a 224px target. Related, and
worse: `pre` carries `font-family: monospace` from the UA stylesheet, and that
beats inheritance, so art must set `font-family` explicitly or it is not drawn
in the site's font at all.

## Spacing

One five-step scale. Every vertical gap is one of them. `--gutter` is the page
margin and `--measure` the reading width; neither is a vertical rhythm value.

The scale exists because an audit found seven unrelated top-margins (4, 12, 14,
22, 26, 40, 48px) sharing no rhythm. Two values outside the scale survive as
optical baseline nudges on the register mark and the section number; both are
alignment, not rhythm.

### Named Rules

**The Writing Sets The Row Rule.** In a two-column `.bay`, the copy determines
the row height and the picture fills it. The reverse — a picture sizing itself
and stretching the row — left 724px of empty column beside a 304px bio, and
was the single largest layout defect the site has had.

**The No Free Hairlines Rule.** There is no rule above a section, above a list,
or under a list row. There were nine of them and they were the reason the page
read as a template. Space and a numbered title do the separating. Hairlines
survive only where scanning genuinely needs a boundary.

## Shapes

Hard-edged. No border radius anywhere, on anything.

Photographs are a **contact sheet**: small, uniform, square, indexed, in a
strip, with the index number in `--hot`. One exception, `.plate`, for the
opening portrait, at roughly twice a thumbnail.

### Named Rules

**The Rectangle Is The Problem Rule.** A full-colour photograph on a starfield
reads as a hole punched in the void, and no frame fixes it, because the frame
is not what is wrong. Photographs are therefore small and indexed — records
rather than features. Framing, vignetting and duotone were each tried and each
failed for this reason.

## Motion

All of it is CSS. The only JavaScript on the site is five lines that pause
autoplaying video under `prefers-reduced-motion`, and it removes motion rather
than adding it.

- **Flight.** Four starfield layers scale from the centre and fade at frame
  edge on staggered delays. The parallax is the rate difference. An earlier
  version drifted sideways and read as a screensaver, because sideways motion
  has no direction of travel.
- **The ship.** One drawing, one transform, masked at both edges so it sails in
  and out rather than popping.
- **The mark.** One drawing, a six-second breath.
- **Hover.** Colour to `--hot`, and a single radial bloom behind the art.

One easing curve, `--ease`, and two durations: `--dur` 200ms for feedback and
`--dur-slow` 320ms for reveals. Ambient motion — the starfield, the ship, the
breath — is measured in seconds and is not on this scale, because it is
atmosphere rather than response.

### Named Rules

**The Found Object Rule.** ASCII art on this site is drawn accurately from
something real — the Replika mark converted from its own logo file, Spike's
ship — and never invented freehand. Three hand-authored figurative pieces were
built and all three were rejected as ugly. What survives is accurate, not
imagined.

**The Bloom Is Not A Text Shadow Rule.** Glow goes behind art as one radial,
never on the glyphs. A `text-shadow` asked the compositor to blur roughly 1400
characters across forty stacked frames every paint, and hovering visibly
stuttered.

**The Frame Slice Rule.** For a frame-flipped animation of *n* frames, the
visible slice is `100/n` percent. Hardcoding 2.4% is correct only at forty
frames; at six a piece was blank 85.6% of the time and appeared to be missing.
No frame-flipped art currently ships, but the trap is worth keeping written
down.

## Do's and Don'ts

### Do

- Say what a section is. `replika`, `before replika`, `upbringing`, `say hi`.
- Let the build catch CSS. An invalid keyframe selector was silently dropped by
  the minifier, and a stray comment terminator killed the build outright;
  neither was visible in a screenshot.
- Verify in real Chrome. The embedded preview browser does not run lazy-loading
  reliably and reports `scrollY` as 0 while `scroll-behavior: smooth` animates.

### Don't

- Don't write copy nobody asked for. `what he is doing`, `the door is open`,
  `hover for colour`, `she is a projection` — every invented caption on this
  site has been cut, usually angrily. If a heading already says it, the
  subtitle is noise.
- Don't desaturate family photographs. It makes a childhood read as a memorial.
- Don't reach for a hairline to separate things.
