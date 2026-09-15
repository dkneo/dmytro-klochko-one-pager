# LP-01 and LP-02: living portrait

## Purpose

Explain Eidos without product jargon: what you keep becomes part of how you see yourself.

The artwork must remain desirable in its own right. Faun supplies the product identity, not a second competing subject.

Use `storyboards-v3/05-desktop-hero-in-product.png` as the desktop product composition. `01-living-portrait-storyboard.png` is only the enlarged plate-sequence explanation.

## Resting composition

- One active painting or poster at a time.
- Exact source pixels and a deliberate crop recorded by viewport.
- Artwork occupies at least 58 percent of the desktop visual field and 62 percent of mobile.
- Exact Faun occupies 62 to 82 percent of visual height.
- The active work fills Faun as a color plate.
- Graphite Faun registers above it as the key plate.
- One open baby-pink circle and one optional orange registration point.
- No Gryphon, thumbnails, small fragments, generic swatches or invented symbols.

## Desktop

- Design at 1920 by 1080 and test from 1366 to 2560px.
- Copy may use the left 34 to 40 percent.
- Visual owns the remaining field and may bleed beyond the right edge.
- Preserve the active work's identifiable subject inside both the full visual and the Faun mask.
- Fill must exceed 60 percent; no dead paper rectangle beside the art.

## Mobile

- Compose separately at 1080 by 1920 and test at 390px CSS width.
- Put the visual before secondary explanation.
- The art/Faun composition occupies 48 to 58svh above the first detailed content.
- Keep headline, primary action and an identifiable artwork region in the first viewport.
- Do not center-crop the desktop asset.

## First-load reveal

The poster is complete at first paint. If motion is allowed:

| Time | Event |
| ---: | --- |
| 0 to 180ms | hold the complete artwork and faint Faun relief |
| 180 to 420ms | artwork color is revealed through the Faun mask from one edge |
| 360 to 650ms | pink plate lands 2 to 3px out of register |
| 560 to 900ms | black key plate catches and sharpens |
| 900 to 1200ms | one orange point appears; rest completely still |

Run once per session, never on every return. Do not loop. The page is interactive throughout.

## Changing the active work

Only a real state change may replace the artwork. Crossfade the full work in 140ms while the color plate changes in the same direction. Re-register the black key over 180ms. Do not animate the archive accumulating.

## Reduced motion and data saving

- Show the final still immediately.
- No automatic artwork replacement.
- Serve responsive images; do not decode a hero video.

## Acceptance

- A viewer names both “artwork” and “Faun” in a five-second test.
- The artwork, not the headline or mascot, owns the most pixels.
- The composition is strong with motion disabled.
- Faun and artwork source-lock differences are zero in every resting frame.
- At 390 and 1366px there is no overflow, text collision or anonymous crop.
- The first interaction is available before animation finishes.
