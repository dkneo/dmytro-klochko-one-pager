# P04 — Cache the media that never changes

- **Status**: TODO
- **Commit**: bb2e3f5
- **Severity**: MEDIUM (performance: repeat visits)
- **Category**: Performance — caching
- **Estimated scope**: 1 file (`public/_headers`)

## Problem

Every font, image and video is served with `cache-control: public, max-age=0, must-revalidate` (verified live on 14 Sep 2026 for `/fonts/zodiak-300.woff2`, `/images/scenes/estuary.webp`, `/video/dokfest.mp4`, `/images/plates/vault/hokusai-wave.webp`). A returning visitor revalidates 30–50 requests per page. Lighthouse home desktop: "uses-long-cache-ttl: 7 resources found", all videos. Only `/_astro/*` is cached:

```
# public/_headers — current
/_astro/*
  Cache-Control: public, max-age=31536000, immutable
```

## Target

```
# public/_headers — add after the /_astro/* block
/fonts/*
  Cache-Control: public, max-age=31536000, immutable

/video/*
  Cache-Control: public, max-age=31536000, immutable

/images/*
  Cache-Control: public, max-age=86400, stale-while-revalidate=2592000
```

Fonts and videos never change under the same name (a new film gets a new filename, as `app-loop.mp4` did). Images can be regenerated under the same name by `scripts/image-build.mjs --apply`, so they get one day fresh and a month of stale-while-revalidate: the visitor sees the cached picture instantly and the edge fetches the new one behind it.

## Repo conventions to follow

- `_headers` already groups rules per path with a blank line between blocks; keep that shape. The `/*` security block at the top stays first.
- `tests/pages.test.mjs` "every route carries the four security headers" parses the `/*` block — do not move it.

## Steps

1. Add the three blocks to `public/_headers` exactly as in Target.
2. Ship. After deploy, `curl -sI https://dmklochko.com/fonts/zodiak-300.woff2 | grep -i cache-control` must show `immutable`.

## Boundaries

- Do NOT make `/images/*` immutable.
- Do NOT touch the `/*` block or the `X-Robots-Tag` blocks.

## Verification

- **Mechanical**: the three `curl -sI` checks (a font, a video, an image) show the new headers; Lighthouse "uses-long-cache-ttl" is clean on home.
- **Done when**: a second load of `/` in DevTools shows fonts and videos "(memory cache)" or "(disk cache)" with no 304s.
