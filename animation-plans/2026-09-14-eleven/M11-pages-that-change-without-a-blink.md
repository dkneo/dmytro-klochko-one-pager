# M11 — Pages that change without a blink (native cross-document view transitions)

- **Status**: TODO (optional, decide after M01–M10)
- **Commit**: bb2e3f5
- **Severity**: LOW–MEDIUM (additive; the one motion the site has none of)
- **Category**: 8. Missed opportunities · 1. Purpose (spatial consistency)
- **Estimated scope**: `src/styles/global.css` (one at-rule + two names), `src/layouts/Layout.astro`, `src/components/eidos/EidosHeader.astro` (one attribute each); zero JavaScript

## Problem

Every navigation on the site is a hard cut: `/` → `/press/` → `/eidos/` each flash to the ground colour and repaint. Inside a page the site spends real care on continuity (two easel buffers so a memory "cannot teleport in", 900ms scene crossfades); between pages it has none. The greats the homepage was measured against (rauno.me, paco.me) keep the wordmark still while the page changes under it.

## Target

The native, JavaScript-free cross-document View Transitions API. Where the browser supports it (Chrome 126+, Safari 18.2+), the old page crossfades into the new one over 180ms and the wordmark stays put; everywhere else nothing changes.

```css
/* target — src/styles/global.css */
@view-transition { navigation: auto; }
::view-transition-old(root), ::view-transition-new(root) { animation-duration: 180ms; animation-timing-function: var(--ease-out); }
::view-transition-group(masthead) { animation-duration: 220ms; animation-timing-function: var(--ease-in-out); }
@media (prefers-reduced-motion: reduce) {
  ::view-transition-group(*), ::view-transition-old(*), ::view-transition-new(*) { animation: none !important; }
}
```

```html
<!-- src/layouts/Layout.astro:149 — the masthead keeps its place across pages -->
<a class="masthead" href="/" style="view-transition-name: masthead">dmytro klochko</a>
<!-- src/components/eidos/EidosHeader.astro:9 -->
<a class="ep-wordmark" href="/eidos" style="view-transition-name: masthead" …>
```

The homepage has no masthead (the hero is the masthead); the name will therefore fade with the page there, which is right: leaving home is leaving the poster. `view-transition-name` must be unique per page — only one element carries `masthead`.

## Repo conventions to follow

- No new dependencies and no Astro `<ClientRouter />`: the site's scripts (`is:inline` egg handlers, the scene choreography) are written for full document loads and would double-bind under a SPA router. The native API keeps full loads.
- Reduced motion: the block above nulls every transition; the hard cut returns, which is the correct fallback.
- Tests: add to `tests/pages.test.mjs` that exactly one element per built page has `view-transition-name: masthead`, and that `global.css` carries `@view-transition`.

## Steps

1. Add the at-rule and pseudo-element rules to `global.css`.
2. Add the attribute to the two wordmarks.
3. Build; suite; test in Chrome and Safari: navigate `/press/` → `/learning/` → `/eidos/` → back.

## Boundaries

- Do NOT add `view-transition-name` to anything else in this plan (a persisted header rail can come later, once the crossfade has lived for a week).
- Do NOT touch the in-page motion.

## Verification

- **Mechanical**: suite green; DevTools → Animations shows a `::view-transition` pseudo tree on navigation in Chrome.
- **Feel check**: click "press" in the header: the wordmark holds still while the page dissolves under it in under 200ms; click the browser back button: same in reverse. In Firefox: a plain load, no artefacts. With reduced motion: a plain load.
- **Done when**: navigation between any two chrome-bearing pages is a dissolve, the wordmark never moves, and unsupported browsers see exactly what they see today.
