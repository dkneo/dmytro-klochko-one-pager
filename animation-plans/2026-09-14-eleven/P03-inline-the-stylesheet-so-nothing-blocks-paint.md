# P03 — Inline the stylesheets so no request blocks first paint

- **Status**: TODO
- **Commit**: bb2e3f5
- **Severity**: MEDIUM (performance: FCP/LCP on phones)
- **Category**: Performance — render-blocking resources
- **Estimated scope**: 1 file (`astro.config.mjs`), verify 1 test

## Problem

Every page waits on two or three external stylesheets before it can paint:

```
home mobile   Layout.css 557ms + global.css 249ms   (Lighthouse: "Est savings of 310 ms")
eidos mobile  EidosHeader.css 509ms + global.css 181ms
reads mobile  eidos-studio.css 481ms + EidosHeader.css 481ms + global.css 168ms
press mobile  Layout.css 615ms + press.css 165ms + global.css 465ms
```

The files are small (5–13KB gzipped) — the cost is the round trips, not the bytes. Astro's default `inlineStylesheets: "auto"` inlines only stylesheets under 4KB, so the large layout sheet is always external.

```js
// astro.config.mjs — current
export default defineConfig({
  site: "https://dmklochko.com",
  output: "static",
});
```

## Target

```js
// astro.config.mjs — target
export default defineConfig({
  site: "https://dmklochko.com",
  output: "static",
  build: { inlineStylesheets: "always" },
});
```

Trade, stated so it is a decision and not an accident: each HTML grows by its CSS (home 13KB → ~24KB gzipped; eidos 32KB → ~44KB) and CSS is no longer cached across pages. For a site of a dozen pages served from Cloudflare's edge, one fewer blocking round trip on every first visit outweighs a cross-page cache that most visitors never reuse.

## Repo conventions to follow

- Tests read CSS from both inline `<style>` blocks and `dist/_astro/*.css` through the `styles()` / `allCss()` helpers in `tests/` (see `tests/reading-room.test.mjs` and `tests/house-rules.test.mjs`); they were written for exactly this switch. `tests/homepage-motion.test.mjs` "fingerprinted bundles can stay cached while the html remains fresh" checks `_headers`, not that CSS is external — read it before assuming.

## Steps

1. Edit `astro.config.mjs` as in Target.
2. `npm run build`. Confirm `dist/index.html` contains `<style>` and that `dist/_astro/` holds no `Layout.*.css`.
3. `node --test tests/*.test.mjs`. If a test reads only `dist/_astro/*.css`, switch it to the `allCss()` helper rather than reverting the config.

## Boundaries

- Do NOT hand-inline critical CSS or split "above the fold" CSS; the whole sheet goes inline or nothing does.
- Do NOT change `_headers`.

## Verification

- **Mechanical**: Lighthouse home mobile and eidos mobile: "render-blocking-resources" lists no stylesheet; FCP improves by ≥ 150ms in each.
- **Feel check**: hard-reload `/` on a phone over a slow connection: the dark ground and the serif title appear together, with no unstyled flash.
- **Done when**: no `.css` request appears in the Network panel on any page and the suite is green.
