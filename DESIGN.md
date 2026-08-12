---
name: dmytro klochko — dream / bebop
description: two art directions over one markup. bebop (default): a terminal in deep space — monospace, near-black, one pink accent, ASCII art. dream: a woodblock emaki being rebuilt behind the toggle.
modes:
  dream:   # v3 — the quiet column
    void: "#262b44"
    ground: ["#232840", "#262b44", "#2a3050"]   # barely-there vertical drift
    deck: "#2f3554"
    bone: "#ece6d9"
    dim: "#a9aecb"
    faint: "#7d82a6"
    rule: "rgb(236 230 217 / 12%)"
    cold: "#7fd4d9"
    hot: "#ff9bc0"     # kawase cloud pink — his favourite colour
    seal: "#c3452e"    # saitō's hanko
    mat: "#fbf3e2"     # print borders, peek prints, portrait
    ember: "#ffd2a3"   # spark highlight in the fire act's weather
    lane: "smoked glass — backdrop brightness(0.5), never a colour over the art"
  bebop:
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
    t-xs: "0.75rem"
    t-sm: "0.875rem"
    t-md: "0.98rem"
    t-lg: "clamp(1.15rem, 1.5vw, 1.45rem)"
    display: "clamp(1.9rem, 4.6vw, 3.9rem)"
  # dream v3 reads at letter scale in a 42rem column:
  dream-prose: "0.99rem / 1.62"
  dream-prose-sm: "0.9rem"
  dream-lede: "1.12rem italic"
  dream-display: "1.25rem"      # section titles: a word beside a stamp
  dream-display-hero: "clamp(1.7rem, 3vw, 2.1rem)"
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
  measure: "min(100%, 62ch)"
motion:
  ease: "cubic-bezier(0.2, 0, 0.2, 1)"
  dur: "200ms"
  dur-slow: "320ms"
---

# Design System: dmytro klochko

## Two Modes, One Markup

The site ships two complete art directions over the same HTML, switched by
`data-mode` on the root, chosen before first paint, persisted in
localStorage under a versioned key. **Bebop is the default** while dream
is rebuilt; dream stays whole behind the toggle. This file describes both; where a rule
names no mode, it holds in both.

Everything the earlier version of this file recorded about The Session —
the named rules, the failures they were earned from — still applies inside
bebop mode, and most of it (the spacing scale, the type discipline, the
target sizes, the Found Object rule) applies everywhere.

## Dream Mode (behind the toggle) — The Journey

His own paintings (Seedream, 4K, chosen and named perfect-N by him) run
full-bleed as fixed scenes in **three night acts**: the swimmer under the
orange sun opens (name → before replika), the campfire carries the middle
(how i work → on camera), the snowlit village closes (say hi); taste keeps
the pale estuary alone — one painting per URL there, and per future page.
The section nearest mid-viewport claims the sky (IntersectionObserver,
centred band); scenes crossfade 900ms and parallax against scroll and
cursor, compositor transforms only. Idle preloading of the remaining
scenes runs **only in dream** — bebop visitors pay nothing until they
toggle.

### Readability — Smoked Glass

The reading lane is `backdrop-filter: brightness(0.5) saturate(0.9)` over
the left side of the viewport, masked to feather rightward: it dims the
painting itself under the column, never lays colour over the art. Light
scenes darken exactly enough for cream text; dark scenes barely change.
Phones use brightness(0.58) full-width. Gradient fallback where
backdrop-filter is unsupported.

### Layout — The Left Column

One ~40rem column, anchored left (`margin-inline: max(gutter, 5vw) auto`)
because his paintings put their subjects centre-right — the swimmer, the
sun, the village — and the open right wing belongs to them. Letter-scale
type (the dream ramp in frontmatter). Section numbers are gone in dream;
titles stand alone. Grids stay symmetric: reel 2-up, sheet 3-up, wall a
centred pyramid when its count is odd, the painting gallery breaking out
of the lane to 72rem with rows that resolve to equal heights.

### Voice

Serif speaks sentences — titles (italic, lowercase), ledes, prose,
quotes, the sign-off. Mono keeps the machinery. Highlights are the pink
marker swash — never wavy underlines, never em-dashes; spaced en dashes.

### Scene Weather & Eggs

When the campfire holds the sky, ten embers rise and die mid-air; when
the village does, sixteen snowflakes fall — pure CSS, gated by scene,
faded on the scenes' own 900ms clock, hidden under reduced motion. Six
petals fall always. Typing l-i-s-a showers sixteen more. Clicking an
email copies it and the label whispers "copied ✓".

### Photographs

The portrait sits at 200px in a deep cream mat beside the words, its
caption carrying a breath of dusk shadow because it lands outside the
lane on open water. Childhood snapshots keep their alternating tilt.
Video plays in colour.

### Named Rules (dream)

**The Sampled/Derived Sky Rule.** Every colour traces to his paintings;
all art is his or a professional's. Nothing figurative is invented here —
five rejections carved this in stone.

**The Subject Owns The Wing Rule.** Text placement follows the paintings'
composition, not habit: the column sits wherever the artwork's subject
is not.

**The Glass Never Paints Rule.** Readability comes from dimming the art
through smoked glass, never from panels, veils, or colour laid on top.

## Bebop Mode

The Session, unchanged: warm near-black, bone monospace, one pink accent,
starfield flight, ASCII drawn accurately from real sources. See git history
of this file for the full original document; its Named Rules (Raster Is Not
Type, Advance Is Not 0.6em, Writing Sets The Row, No Free Hairlines,
Rectangle Is The Problem, Found Object, Bloom Is Not A Text Shadow, Frame
Slice) all still bind inside bebop, and several bind everywhere.

## Cross-Mode Rules

**The Arrow Is Inline Rule.** `.arw` is plain inline with a relative-offset
hover hop, never inline-block: an inline-block creates a break opportunity
after itself even with no whitespace, which once stranded a period alone on
its own line after "vienna↗".

**The Peek Rule.** Words naming something real may lift a small stack of
photographs above the cursor (`data-peek`). Hover-and-fine-pointer only, so
phones see plain text, never a half-working version. Prints in dream, hard
b/w stills in bebop. The reveal rides a timeout, not requestAnimationFrame,
which is throttled in embedded contexts.

**Target size.** Every standalone link ≥24px tall (WCAG 2.5.8); inline
prose links exempt.

**One spacing scale, one gap per seam.** Unchanged from The Session.

## Don't

- Don't write copy nobody asked for. Every invented caption on this site
  has been cut, usually angrily.
- Don't hand-draw figurative art (ASCII or icons). Derived, sampled, or
  made by professionals — four rejections earned this rule.
- Don't desaturate family photographs.
- Don't reach for a hairline to separate things.
