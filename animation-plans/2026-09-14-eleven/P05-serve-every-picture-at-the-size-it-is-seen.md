# P05 — Serve every picture at the size it is seen, in the format that costs least

- **Status**: TODO
- **Commit**: bb2e3f5
- **Severity**: HIGH (performance: eidos LCP 7.7s on phones)
- **Category**: Performance — images
- **Estimated scope**: `src/components/eidos/EidosHero.astro`, `src/components/eidos/EidosHeader.astro`, `src/pages/eidos/inbox.astro` (faun guide), `src/pages/press.astro`, `src/pages/index.astro` (5 images), `scripts/image-build.mjs` (new recipes), `public/images/**` derivatives

## Problem

Lighthouse, 14 Sep 2026:

```
eidos mobile   LCP 7.7 s   LCP element: picture.ep-hero-poster > img   "Properly size images: 609 KiB"
eidos desktop  LCP 2.4 s   hero-desktop-poster.webp 1536×1024, 608 KB, waste 467 KB
reads mobile   faun-mark.webp 720×720, 149 KB, rendered ~44 px, waste 148 KB
press mobile   LCP 3.3 s   times-radio-studio.webp 1600×1200, waste 64 KB
home desktop   pirate-flag-mark.png (23 KB waste, not modern), lynch.jpg, journey/lecture.jpg,
               cv-meta-poster.jpg, busking-poster.jpg (jpg → webp saves ~57 KB); wall w04/w05/w13 no `sizes`
```

The eidos hero image carries the wrong intrinsic size too:

```html
<!-- src/components/eidos/EidosHero.astro:16 — current -->
<img src="/images/eidos/product/hero-desktop-poster.webp" width="1920" height="1080" alt="…">
```

The file is 1536×1024 (3:2), not 1920×1080 (16:9). The ratio lie is small but it is a lie.

## Target

No picture loses a pixel of visible quality. Every picture is offered at 1×, 2× and, where it is large, 3× of its rendered size, in AVIF with a WebP fallback, encoded at a quality where a side-by-side at 200% zoom shows no difference (AVIF q 63, WebP q 82 for photographs; WebP lossless for the faun mark, which is line art).

### Eidos hero (the LCP)

```html
<!-- target -->
<picture class="ep-hero-poster">
  <source media="(max-width: 680px)" type="image/avif"
          srcset="/images/eidos/product/hero-mobile-poster-480.avif 480w, /images/eidos/product/hero-mobile-poster-960.avif 960w" sizes="100vw" />
  <source media="(max-width: 680px)" type="image/webp"
          srcset="/images/eidos/product/hero-mobile-poster-480.webp 480w, /images/eidos/product/hero-mobile-poster-960.webp 960w" sizes="100vw" />
  <source type="image/avif"
          srcset="/images/eidos/product/hero-desktop-poster-768.avif 768w, /images/eidos/product/hero-desktop-poster-1152.avif 1152w, /images/eidos/product/hero-desktop-poster-1536.avif 1536w"
          sizes="(min-width: 1200px) 58vw, 100vw" />
  <img src="/images/eidos/product/hero-desktop-poster-1152.webp"
       srcset="/images/eidos/product/hero-desktop-poster-768.webp 768w, /images/eidos/product/hero-desktop-poster-1152.webp 1152w, /images/eidos/product/hero-desktop-poster-1536.webp 1536w"
       sizes="(min-width: 1200px) 58vw, 100vw"
       width="1536" height="1024" fetchpriority="high" decoding="async" alt="…same alt…" />
</picture>
```

Measure the real rendered width of `.ep-hero-art` at 1440 and at 390 before writing `sizes`; the values above are the expected ones from `eidos-product.css:156` (`minmax(38rem, 1.5fr)` column) and must be confirmed.

### Faun mark

Header renders it at ~44 px, the inbox rail guide at ~180 px. Two derivatives, lossless WebP: `faun-mark-96.webp` and `faun-mark-384.webp`, with `srcset="…-96.webp 96w, …-384.webp 384w"` and `sizes="44px"` in the header, `sizes="180px"` in the rail. Keep the `width="720" height="720"` ratio attributes (they only fix the box shape).

### Press portrait

`times-radio-studio.webp` → `-800`, `-1200`, `-1600` WebP + AVIF; `sizes="(min-width: 861px) 40vw, 100vw"`; the lead portrait keeps `fetchpriority="high"`.

### Homepage

- `pirate-flag-mark.png` → `pirate-flag-mark.webp` (lossless) sized to 2× its rendered box; or, if the source is vector, an inline SVG.
- `lynch.jpg`, `journey/lecture.jpg`, `video/cv-meta-poster.jpg`, `video/busking-poster.jpg` → WebP q82 at their current pixel size (same dimensions, same look, ~40% lighter). Update every `src`/`poster` reference (grep the four basenames across `src/`).
- Wall prints (`/images/wall/w01…w15.webp`, 474 px): add `sizes="(min-width: 861px) 23vw, 46vw"`; they are already right for 2× screens — no re-encode.

### Moodboard plates

The 440 px plates are displayed at ~250 px in the `columns: 5 14rem` grid. Lighthouse counts them as oversized at 1× DPR; at 2× they are exactly right. **Leave the plates alone.** Record this as the reason in the plan status so the next audit does not re-report it.

## Repo conventions to follow

- Derivatives are made by `scripts/image-build.mjs` (recipes at lines 28–90: `recipeFor({ width, height, fit, quality })`, `responsive/today` already emits `[480, 960]` widths). Add recipes there, run `node scripts/image-build.mjs --apply` **after** `astro build`, then build again (AGENTS.md: apply reads `map.json`). Never hand-edit files in `public/images/responsive/`.
- `image-build --check` runs in `npm run build` and fails when a derivative is missing — that is the test.
- `tests/lookbook.test.mjs` shows the pattern for asserting `width`/`height` attributes match the file on disk; copy it for the hero and the faun.
- House rule: screenshots and UI captures are not matted; photographs are. Do not change markup around images beyond the attributes named here.

## Steps

1. Add AVIF output to `image-build.mjs` (sharp: `.avif({ quality: 63, effort: 6 })`) beside the existing WebP output for a new `responsive/eidos` recipe with the widths listed above, and a `lossless` recipe for the faun mark.
2. Build once, `node scripts/image-build.mjs --apply`, build again. Confirm the files exist under `public/images/eidos/product/` (or wherever the recipe's `out` puts them — follow the existing `responsive/today` convention).
3. Rewrite the hero `<picture>` as in Target, with the corrected `width="1536" height="1024"`.
4. Header and inbox faun: `srcset` + `sizes` as above.
5. Press portrait: `srcset` + `sizes` + `<picture>` with AVIF source.
6. Homepage: convert the five raster files, update references, add `sizes` to the wall.
7. Add a test (`tests/pictures.test.mjs`): every `<img>` on `/eidos/`, `/press/`, `/` with `width`/`height` matches the file; every hero/portrait has `srcset`; no `.png`/`.jpg` is referenced from the homepage HTML except the OG image.

## Boundaries

- Do NOT re-encode the 440 px plates or the wall prints.
- Do NOT lower any quality below the values stated; if a side-by-side shows a difference, raise the quality and re-measure rather than accept it.
- Do NOT touch the lookbook (it has its own normaliser, `scripts/lookbook-images.mjs`).

## Verification

- **Mechanical**: `npm run build` green (the `--check` step proves every derivative exists); the new test green; Lighthouse eidos mobile LCP ≤ 2.5 s and "uses-responsive-images" ≤ 20 KB total on every page.
- **Feel check**: open the eidos hero at 1440 and at 390 next to the current one at 200% zoom: identical detail in the graphite hatching and the salmon edges; no banding in the pink field. Faun mark in the header: crisp on a 2× screen.
- **Done when**: eidos mobile Lighthouse performance ≥ 92 and no page lists an image with more than 20 KB of waste.
