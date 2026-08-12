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

## Dream Mode (behind the toggle, being rebuilt)

Built from three paintings that hang on the taste page, not from a mood
board:

- **Katherine Bradford, Swimmers Under Orange Moon** — the dusk ground
  (`#2c3357`, sampled), the orange moon fixed in the corner sky, the warm
  cream of the type.
- **Hasui Kawase's twilight** — the pink cloud and turquoise water washes
  that drift behind the page, and the bokashi: the page ground is a graded
  wash like the sky of a woodblock print, viewport-fixed.
- **Kiyoshi Saitō's snow night** — the quiet, the star field, and his red
  hanko seal, which stamps every section number: vermillion block, cream
  numeral, rotated 3° off true the way a hand stamps.

### Voice

The Two Voices Rule inverts. Serif is everything spoken in sentences —
display titles (italic, lowercase), ledes, prose, quotes, the sign-off.
Mono retreats to the machinery: nav, numbers, labels, captions, the
register. Highlights are run over with a pink marker swash — never a wavy
underline, which reads as a spellcheck error, and never an em-dash in
prose; dashes are spaced en dashes.

### Art

The ASCII figures hide. Kawase's twilight IS the sky: full-bleed behind
the first screen of both pages like the title of a quiet japanese game,
breathing on a sixty-second clock, leaning with the cursor, its bottom
edge masked into the dusk. Bradford hangs only on taste; Redon's cyclops
still says hi. The bays that lost their art column collapse to one column
rather than keeping an empty grid track. The vinyl ASCII on taste keeps
spinning: the shader reads its palette live from CSS.

### Photographs

Mounted, not filed. The portrait hangs straight in a cream mat
(`--mat #fbf3e2`); the childhood snapshots keep a small alternating tilt,
because childhood photographs live in shoeboxes, not frames. Video plays
in colour — grayscale was the noir talking.

### Named Rules (dream)

**The Sampled Sky Rule.** Every dream colour traces to a specific painting
on the taste page. New colours enter by being sampled, not invented.

**The Seal Hugs Its Number Rule.** `.card-no` carries `width: fit-content`
because on a phone the number leaves the margin and becomes a block — the
stamp once stretched into a 351px red bar.

**The Moon Yields Rule.** The moon is `z-index: 0` scenery: it passes
behind photographs like a moon behind rooftops, and on phones it moves to
the corner above the wrapped nav, where it once sat on the toggle and read
"BEBOP M🌕DE".

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
