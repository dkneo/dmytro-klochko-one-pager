# Eidos motion system, production handoff v4

- Status: ready for review before implementation
- Working product name: Eidos
- Core idea: **the artwork is the color plate; Faun is the black key plate**

## Read this before spending anything

The previous pack was wrong. It turned the collection into small fragments around a mascot and asked generated video to create polish. That made the artwork decorative, the product meaning vague and the motion impossible to interrupt.

This pack replaces that premise.

One real artwork remains large and readable. Keeping it presses its color through Faun. The black Faun plate registers last, so the person becomes visible through a work they chose without the work shrinking into a badge or thumbnail. Every product response uses the same physical sequence:

1. contact;
2. pressure;
3. ink transfer;
4. black key registration;
5. settle.

## What to build

1. One desktop hero and one separately composed mobile hero using the exact Faun and one exact artwork at a time.
2. A delayed, non-looping Faun registration loader made in CSS or canvas.
3. Direct, interruptible keep, pass, undo and next-card motion.
4. A rare absolute-favorite response: a second pink ink pass, then the next work.
5. A restrained Gryphon response for provenance and map only.
6. Reduced-motion, slow-network, error and immediate-interruption states.

Do not build three generic portrait states. Do not animate a pile of saved thumbnails. Do not use generated video for interface motion.

## Spend rule

Default Fal spend is **$0**. The supplied source assets and storyboards are enough to build the interface deterministically. If the deterministic prototype is approved but one isolated dry-ink texture still feels synthetic, spend at most **$4 total** on material auditions. The generated output may contain texture only, never Faun, artwork, text or UI.

No paid call happens before Dmytro approves the v4 product storyboards.

## Review these first

1. `storyboards-v3/01-living-portrait-storyboard.png`
2. `storyboards-v3/02-absolute-favorite-storyboard.png`
3. `storyboards-v3/03-loader-storyboard.png`
4. `storyboards-v3/04-mobile-product-storyboard.png`
5. `storyboards-v3/05-desktop-hero-in-product.png`
6. `storyboards-v3/06-studio-faun-feedback.png`
7. `01-CREATIVE-SYSTEM.md`
8. `02-PRODUCTION-ARCHITECTURE.md`
9. the PRDs in `prds/`
10. `90-QC-SCORECARD.md`

## Automatic rejection

- More than one artwork competes for attention in the hero.
- The artwork becomes a thumbnail, texture patch, orbit, halo or scrapbook fragment.
- Faun's face, horns, silhouette or expression change.
- Blue is used as Faun's or Gryphon's dominant color.
- Paper grain crawls, the camera drifts or the character acts.
- A routine response lasts more than 220ms.
- A loader appears before 700ms, loops forever or blocks ready content.
- Motion must finish before a new input can be accepted.
- Text is baked into generated media.
- The result is more impressive as a clip than useful inside the product.
