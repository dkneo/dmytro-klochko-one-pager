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
    # The pond (/pond) is a paper world by day: mat is its ground, and its ink
    # is sampled from Matsumoto Hoji's frog itself, not chosen. At night it
    # returns home to void/bone/ember.
    sumi: "#3c444c"        # Hoji's brush, mean of the frog's opaque dark pixels
    sumi-soft: "#6a6f76"   # quiet text on mat paper — 5.1:1, floor is 4.5
    sumi-wash: "rgb(60 68 76 / 50%)"   # ripple rings by day
    bone-wash: "rgb(236 230 217 / 40%)" # ripple rings by night
    firelight: "rgb(255 186 110 / 55%)"
    firelight-core: "rgb(255 186 110 / 62%)"
    scene-scrim: "rgb(24 28 46 / 24%)"
    shadow-deep: "rgb(6 9 18 / 45%)"
  workbench:   # the /learning artefact pages (ui-vernacular, terminal): light
               # paper tools, siblings of each other rather than of the site's
               # dream shell. Palette established by ui-vernacular and shared.
    bg: "#f5f2ec"
    paper: "#fbfaf7"
    ink: "#161616"
    ink-soft: "#3f3e3a"
    muted: "#6b6a66"
    line: "#d9d5cc"
    line-soft: "rgba(217,213,204,.75)"
    accent: "#ff4fa3"      # its own pink, hotter than dream's kawase
    accent2: "#7b61ff"
    good: "#147a55"
    focus: "#aaa4ff"
    focus-ring: "rgba(123,97,255,.12)"
    white: "#fff"
    topbar: "rgba(245,242,236,.88)"
    shadow: "0 18px 50px rgba(0,0,0,.08)"
    # workbench type is px utility steps, not the site rem ramp:
    # 10.5 11 12 12.5 13 13.5 14 14.5 15 17 18 21 22px, hero clamp(44px,6.5vw,88px)
    # and clamp(48px,7vw,100px). The hero gradient (accent→accent2 clipped to
    # text) is ui-vernacular's h1 treatment; the guides keep it for family.
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
  pond-haiku: "clamp(1.35rem, 2.6vw, 1.9rem) italic"  # the poem over the water, Newsreader
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

## Private Scout Surface

`/scout` deliberately does not inherit the public dream/bebop skin. It is
Taso's working field manual, not a public-facing variation or a marketing
page. Blush paper (`#fff7f3`) and paper-deep (`#f1dfe5`) are the ground; deep
aubergine (`#2b1d2b`) and raised aubergine (`#3c293a`) mark chapter changes.
Dark plum ink (`#2b2028`) and soft plum (`#5f4f58`) carry light sections.
Baby pink (`#ff9bc0`) is the primary voice on dark ground and owns the hero,
primary action, focus, selection and active wayfinding. Berry (`#96345f`) is
its contrast-safe text counterpart on paper; pink wash (`#f8cbdc`) marks the
current course stop. Green is reserved for successful answers and saved state,
never atmosphere. Gold (`#7a5c2d`) remains caution, never a second accent.

Newsreader carries instruction at 18px/1.58 on desktop and 17px on mobile.
Zodiak 400 carries the hero and lesson titles. The system sans supports compact
explanation and the system mono marks controls, progress, state and source
captions. The hero title runs at `clamp(3.4rem, 5.5vw, 4.8rem)` with a tight
0.88 line-height; lesson titles run at `clamp(2.4rem, 5vw, 4.5rem)`. Type gets
large only where it names the course or a lesson. Reading copy stays near
69ch.

The desktop hero is a two-part editorial cover, words beside Taso's derived
collage, with a minimum 660px field. Lessons use a 76rem spread: a 12.5rem
label rail, a minmax reading lane capped at 44rem, and a 28–72px seam. Media
may span the spread in balanced two-column compositions. At 960px the cover
and media stack; from 701–860px the lesson spread becomes one full reading
lane so content never falls into the 12.5rem label rail. Under 700px the label
rail becomes ordinary reading order, the six-stop strip becomes a 3×2 grid,
and the tracker defaults from its wide table to one-column cards. The page
keeps 22px mobile gutters and never asks the viewport to absorb a shrunken
desktop table.

Paper is the page itself, never a readability card laid over art. Aubergine
bands divide the course; near-paper blush cards (`#fff4f7`) sit inside them for
drills and threads. Containers use restrained 2px corners, one-pixel edges and
low plum ambient shadows. The deliberate exceptions are pill-shaped action
controls and small circular state dots. The primary start action is 48px high
on desktop. On mobile, course checks, copy actions, drill choices, tracker
actions, recovery and dialog controls all reach 44px while checkbox boxes stay
24px. Desktop tracker actions remain at least 40px, and standalone controls
never fall below 24px.

The sticky six-stop course strip is both navigation and progress: the current
lesson receives paper-deep, completed lessons receive a seal dot, and the hero
action advances to the first unfinished day. Choice cards lift 2px on hover,
then resolve to a green right state or a deliberately quieter wrong state.
Wide reference tables label their own horizontal scroll. The scout desk tells
the truth through saved, saving, warning and blocked states; it switches to
cards on mobile, supports CSV and JSON export, asks before merge or replace,
and keeps deletion recoverable through an eight-second undo toast.

Taso is the subject of every commissioned collage. Screens and examples remain
secondary evidence, captioned with their source and capture context. All
illustrations, captures and video stay behind authenticated `/scout/media/*`;
this surface never puts Taso's photographs in `public/` or `dist/`.

The only entrance animation is the hero image's 900ms clip reveal on the
standard emphatic curve (`cubic-bezier(.16, 1, .3, 1)`). Small hover lifts and
the transient toast may transition, but the course never runs ambient motion.
Reduced motion removes the reveal, smooth scrolling and all component
transitions.

### Named Rules (scout)

**The Field Manual Is Its Own World Rule.** Do not import dream skies, bebop
ASCII or the public mode toggle. This is a private operating surface with its
own paper-and-petrol grammar.

**The Paper Is The Ground Rule.** Warm paper may be the page and the material
of a working card. It may not become a floating readability slab over art.

**The Work Survives The Lesson Rule.** Progress, drills and tracker rows save
locally, but the interface names that boundary and always offers a portable
backup. A storage failure stays usable for the session and says exactly what
will be lost.

**The One Reveal Rule.** One authored entrance belongs to Taso's hero image.
Everything after it moves only to explain hover, navigation, feedback or
recovery.

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
