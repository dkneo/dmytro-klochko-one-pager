# Prompt for Grokbot

Rebuild Eidos motion from this v4 handoff. Read `README-FIRST.md`, files 00 through 06, every PRD and `90-QC-SCORECARD.md` before touching the product.

## Non-negotiable idea

The artwork is the color plate. Faun is the black key plate. The user supplies pressure by choosing.

One exact artwork remains large and readable. It colors the exact Faun mask. The exact graphite Faun registers last. Do not visualize the collection as thumbnail fragments, orbiting cards, halos, swatches or a collage.

## What to build first

1. Reproduce the actual desktop product composition in `storyboards-v3/05-desktop-hero-in-product.png`; use `01-living-portrait-storyboard.png` only for the plate construction.
2. Compose mobile separately from `storyboards-v3/04-mobile-product-storyboard.png` at 390px. Do not center-crop desktop.
3. Reproduce the Studio placement and left-rail Faun states in `storyboards-v3/06-studio-faun-feedback.png`.
4. Implement direct keep, pass, undo and next-card behavior from `prds/13-DISCOVERY-MOTION.md`.
5. Implement the delayed 56px loader from `prds/12-LOADERS.md`; `03-loader-storyboard.png` is an enlarged construction diagram, not the product scale.
6. Implement absolute favorite from `prds/14-FAVORITE-AND-PORTRAIT-GROWTH.md`.
7. Add Gryphon only to map and provenance after the above passes.

## Technology boundary

Use HTML, CSS masks, WAAPI or canvas. All user-driven motion must be interruptible and stateful. Keep the next artwork decoded beneath the current one. Keep text live. Preserve exact Faun and artwork pixels.

Do not use generated video for UI. Default Fal spend is $0. If Dmytro approves the deterministic implementation but explicitly requests a more physical ink edge, the only allowed paid task is the isolated material texture in `prompts/11-INK-EXPOSURE.md`, maximum $4 total.

## First checkpoint

Return only after you can provide:

- desktop and mobile product recordings, not standalone clips;
- normal speed, 0.25x and reduced-motion versions;
- exact viewport dimensions and overflow measurements;
- source-lock difference images;
- dropped-frame and layout-shift evidence;
- a blunt score from `90-QC-SCORECARD.md`;
- `spend.json`, even when spend is zero;
- every rejected attempt and the precise reason.

Reject your own work if the art is not the largest object, the product is not understandable in five seconds, or the motion resembles a reward animation. Do not report completion because files exist. View the rendered product at 1366px and 390px before asking for review.
