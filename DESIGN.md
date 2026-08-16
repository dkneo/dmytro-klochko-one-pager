---
name: dmytro klochko — dream / bebop
description: two art directions over one markup. bebop: a terminal in deep space — monospace, near-black, one pink accent, ASCII art. dream: his own paintings full-bleed behind smoked glass, behind the toggle.
modes:
  dream:   # v4 — bebop's bones, his paintings for a sky
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
    ember-deep: "#f08a54"  # the ember's molten core; the sunpulse's warm mid-stop
    hot-lit: "#ffd3df"     # petal highlight — hot where the light hits
    lane: "smoked glass — backdrop brightness(0.48) saturate(0.92), never a colour over the art"
    # Three literals the ramps do not cover, documented rather than left as
    # drift: the glow at the heart of the fire, the scrim over the scene, and
    # the deep shadow under a lifted print.
    firelight: "rgb(255 186 110 / 55%)"
    firelight-core: "rgb(255 186 110 / 62%)"
    scene-scrim: "rgb(24 28 46 / 24%)"
    shadow-deep: "rgb(6 9 18 / 45%)"
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
  serif: "Newsreader (self-hosted, latin subsets), Iowan Old Style, Baskerville, Georgia"
  display: "Zodiak 300/400/400i (self-hosted, Fontshare) — dream display voice"
  scale:
    t-xs: "0.75rem"
    t-sm: "0.875rem"
    t-md: "0.98rem"
    t-lg: "clamp(1.15rem, 1.5vw, 1.45rem)"
    display: "clamp(1.9rem, 4.6vw, 3.9rem)"
    # The map is one svg with a 1000x760 viewBox, so these two are viewBox
    # units and scale with the drawing. Off the rem ramp on purpose: a rem
    # here would not scale with the diagram it labels.
    map-label: "15px"
    map-label-narrow: "20px"
  # dream reads editorial on bebop's own shell:
  dream-prose: "1.13rem / 1.66"
  dream-prose-sm: "1rem"
  dream-lede: "clamp(1.45rem, 2vw, 1.65rem) italic"
  dream-fact: "1.22rem"        # hero fact values: a step above prose, below the lede
  dream-display: "clamp(2rem, 3.4vw, 2.9rem)"      # Zodiak italic, real headings
  dream-display-card: "clamp(1.5rem, 2.4vw, 2.1rem)"  # timeline chapter titles
  dream-display-hero: "clamp(3.4rem, 7vw, 6rem)"   # a poster's title
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
localStorage under a versioned key (`mode2`). **Dream is the default**;
bebop stays whole behind the toggle. Storage is written only on a toggle
click, so a stored mode is always a deliberate choice and outranks the
default. This file describes both; where a rule names no mode, it holds in
both.

Everything the earlier version of this file recorded about The Session —
the named rules, the failures they were earned from — still applies inside
bebop mode, and most of it (the spacing scale, the type discipline, the
target sizes, the Found Object rule) applies everywhere.

## Dream Mode (the default) — The Journey

His own paintings (Seedream, 4K, chosen and named by him) run full-bleed
as fixed scenes — **one painting per URL**: the swimmer under the orange
sun holds every section of `/`, the pale estuary holds `/taste`, and each
future page claims one of its own. The scene machinery is more general
than the mapping: sections carry `data-scene`, an IntersectionObserver
with a centred band (−42% top and bottom) hands the sky to the section
nearest mid-viewport, and scene layers crossfade over 900ms — so a page
*could* change skies mid-scroll, but as shipped no page does, and the sky
never cuts mid-read. The painting is alive rather than static: it
breathes (scale 1.04 → 1.1 over 70s, alternating) and parallaxes against
scroll (−4vh over the first viewport) and cursor (eased, −14px/−9px),
compositor transforms and opacity only. Idle preloading of the other
scenes runs **only in dream** — bebop visitors pay nothing until they
toggle, at which point a MutationObserver on `data-mode` re-arms the
warm-up.

### Readability — Smoked Glass

The reading surface is a full-viewport fixed layer:
`backdrop-filter: brightness(0.48) saturate(0.92)` under a faint dusk
tint (`rgb(24 28 46 / 24%)`). It dims the painting itself under the text,
never lays opaque colour over the art: light scenes darken exactly enough
for cream text, dark scenes barely change. At ≤900px the filter runs
brightness(0.5). A left-weighted dusk gradient stands in where
backdrop-filter is unsupported.

### Layout — Bebop's Bones

Dream inherits bebop's layout wholesale and only reskins what sits on it:
the 78rem shell, the 6fr/5fr bays, the min(100%, 62ch) measure, the reel
2-up, the sheet 3-up — every grid is the same grid in both modes. Where
bebop hangs the Joi and Anakin ASCII, dream hides them and collapses
those bays to a single column; the vinyl ASCII survives on `/taste`,
recoloured to the dusk tokens. Section numbers are gone in dream — the
title stands alone on a flex line. Two dream-only breakouts: the painting
hang widens to `min(72rem, 100vw − 2×gutter)` with rows that resolve to
equal heights, and the taste wall centres four matted prints per row.

### Voice

Serif speaks sentences — prose, ledes, quotes, captions, the sign-off —
in Newsreader at 1.13rem/1.66. Zodiak (canela-blooded, 300 roman hero, 400 italic titles) is the display voice:
lowercase real headings at clamp(2rem, 3.4vw, 2.9rem), the hero name at
clamp(3.4rem, 7vw, 6rem). Mono keeps the machinery (nav, labels,
figcaptions on machinery objects). Highlights are pink italic — voice
change, nothing painted behind the words (the marker swash retired when
the elaya hero landed) — never wavy underlines, never em-dashes; spaced
en dashes. The hero name at clamp(3.4rem, 7vw, 6rem) became one spoken
sentence at clamp(2rem, 3.5vw, 3.35rem) with thin still underlines on the
words that go somewhere. The current nav page is held in pink parentheses
(bebop uses brackets).

### Ambient Life & Eggs

Six petals always fall, in front of everything (z-index above the glass).
When the swimmer holds the sky, the painted sun warms and cools on a 7s
soft-light pulse riding the same parallax so it stays on the sun, and
four light glints drift across the water (the glints also run on the
estuary). Film grain sits over everything at 4% overlay. Ember and snow
weather CSS still exists, gated on `data-scene="fire"` / `"snow"`, but no
shipped page names those scenes — it is dormant plumbing, not a current
behaviour. Typing l-i-s-a showers sixteen extra petals. Clicking an email
copies it and the label whispers "copied ✓". Every ambient system —
scenes' parallax, petals, weather, autoplaying video — goes still under
`prefers-reduced-motion`.

### Photographs

The portrait sits in its bay in a deep cream mat (8px border, 3px
radius), tilted 1.2°, straightening and lifting 3px on hover as its
shadow deepens; its caption carries a breath of dusk text-shadow because
it lands outside the darkest glass, on open water. Childhood snapshots
keep their alternating tilt in 5px mats; wall prints wear 4px. Video
plays in colour — dream strips bebop's filter.

### Named Rules (dream)

**The Sampled/Derived Sky Rule.** Every colour traces to his paintings;
all art is his or a professional's. Nothing figurative is invented here —
five rejections carved this in stone.

**The Subject Owns The Wing Rule.** Text placement follows the paintings'
composition, not habit: the column sits wherever the artwork's subject
is not.

**The Glass Never Paints Rule.** Readability comes from dimming the art
through smoked glass, never from panels, veils, or colour laid on top.

## Bebop Mode (behind the toggle)

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
phones see plain text, never a half-working version. Matted prints in
dream, hard b/w stills in bebop. The reveal rides a timeout, not
requestAnimationFrame, which is throttled in embedded contexts.

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
- Don't let art blur or pixelate: contained sizes or high-res sources only.
- Don't fix readability with cream/white panels — dim the painting itself.
