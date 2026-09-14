# P02 — Metric-matched fallbacks so type never shifts the page

- **Status**: TODO
- **Commit**: bb2e3f5
- **Severity**: HIGH (performance: CLS, perceived LCP)
- **Category**: Performance — layout stability and text rendering
- **Estimated scope**: 1 file (`src/styles/global.css` @font-face block), 2 layouts (preload lines)

## Problem

Lighthouse home mobile: CLS 0.065, the single shifting element is the hero print pile (`div.hero-side > div.hero-stack > figure > span.cell`). Nothing in the pile changes size; what moves it is the text above it swapping from the fallback face to Zodiak and Newsreader, whose metrics differ from the system fallback. Every face is `font-display: swap` with no metric overrides:

```css
/* src/styles/global.css:45-51 — current */
@font-face {
  font-family: "Zodiak";
  font-weight: 300;
  src: url("/fonts/zodiak-300.woff2") format("woff2");
  font-display: swap;
}
```

LCP on both home and press is the `h1`, with a render delay of 1.2–1.7s on the simulated mobile: the block is waiting on stylesheets (see P03) and then repaints when the real face lands.

## Target

Keep `font-display: swap` (the words must appear at once). Add one metric-matched local fallback per text face so the swap is invisible in layout: same line heights, same wrap points within a glyph or two. Values below were computed with fontpie against the actual woff2 files in `public/fonts` on 14 Sep 2026; copy them exactly.

```css
/* target — add after the existing @font-face blocks in src/styles/global.css */
@font-face {
  font-family: "Zodiak Fallback";
  src: local("Times New Roman");
  ascent-override: 82.66%;
  descent-override: 20.87%;
  line-gap-override: 7.51%;
  size-adjust: 119.77%;
}
@font-face {
  font-family: "Zodiak Fallback Italic";
  font-style: italic;
  src: local("Times New Roman");
  ascent-override: 77.91%;
  descent-override: 22.04%;
  line-gap-override: 7.08%;
  size-adjust: 127.07%;
}
@font-face {
  font-family: "Newsreader Fallback";
  src: local("Times New Roman");
  ascent-override: 70.13%;
  descent-override: 25.29%;
  line-gap-override: 0%;
  size-adjust: 104.80%;
}
@font-face {
  font-family: "Newsreader Fallback Italic";
  font-style: italic;
  src: local("Times New Roman");
  ascent-override: 75.44%;
  descent-override: 27.20%;
  line-gap-override: 0%;
  size-adjust: 97.43%;
}
```

and the stacks become:

```css
--serif: "Newsreader", "Newsreader Fallback", "Times New Roman", serif;
--display: "Zodiak", "Zodiak Fallback", "Times New Roman", serif;
```

(Find the current `--serif` / display token names in `src/styles/global.css` and keep them; only the fallback entries are added.)

Preload the two italics the hero uses on first paint alongside the two already preloaded, so the pink italic accents do not arrive a beat late:

```html
<!-- src/layouts/Layout.astro:55-56 — add -->
<link rel="preload" as="font" type="font/woff2" crossorigin href="/fonts/zodiak-400i.woff2" />
<link rel="preload" as="font" type="font/woff2" crossorigin href="/fonts/newsreader-400i.woff2" />
```

## Repo conventions to follow

- Tokens live in `src/styles/global.css` near line 90 (`--mono`) and the `@font-face` blocks at lines 18–75. Add the fallback faces right after the last real `@font-face`.
- Preloads live in `src/layouts/Layout.astro:55-56` (two lines already there); `src/layouts/EidosLayout.astro:26-27` preloads Newsreader 400 and Zodiak 400 for the eidos surfaces — add the same fallback stacks there through the shared `global.css`, no change needed to that layout unless it declares its own stacks.

## Steps

1. Add the four fallback `@font-face` blocks exactly as in Target.
2. Insert the fallback family names into the serif and display font stacks wherever they are declared (grep `"Newsreader"` and `"Zodiak"` in `src/styles/*.css` and `src/styles/pages/*.css`; there should be one token each; if a stack is repeated inline, update every copy identically).
3. Add the two italic preloads to `Layout.astro`.
4. Build and run the suite.

## Boundaries

- Do NOT switch to `font-display: optional` (the site's words must render immediately, in the fallback if need be).
- Do NOT subset or re-encode the woff2 files in this plan.
- Do NOT add Google Fonts or any remote font host.

## Verification

- **Mechanical**: `npm run build`; `node --test tests/*.test.mjs`; Lighthouse home mobile CLS ≤ 0.01 and "layout-shift-elements" no longer lists `.hero-stack`.
- **Feel check**: DevTools → Network → throttle "Slow 3G", disable cache, reload `/`. Watch the hero title and the print pile: the pile must not move when the real faces arrive; the title's line breaks may change by at most one word. Repeat on `/press/`.
- **Done when**: CLS on home mobile is under 0.01 in two consecutive Lighthouse runs and the pile is still in the swap.
