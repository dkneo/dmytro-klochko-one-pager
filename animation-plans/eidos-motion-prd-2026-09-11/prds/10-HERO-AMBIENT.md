# 010 — Make the hero a living print

- **Status**: TODO
- **Commit**: `9474e4b`
- **Severity**: HIGH
- **Category**: cohesion, preservation, performance
- **Fal eligible**: yes, overlay only

## Purpose

The hero should feel alive after a moment of attention without behaving like an animated fantasy character. It communicates the product’s premise: a personal visual archive whose printed plates are still being assembled.

## Source

- Desktop: `reference/hero-desktop-master.png`
- Mobile: `reference/hero-mobile-master.png`
- Do not use any frame from the failed hero videos.

## Composition

- Prepare exact 16:9 and 9:16 canvases as specified in `03-FAL-RUNBOOK.md`.
- Preserve Faun and Gryphon at source scale and source pixels.
- Extend only blank paper.
- The circle remains open and the orange point remains fixed.

## Motion concept

One imperfect printing plate quietly re-registers. The character drawing does not animate.

### Eight-second asset timeline

| Time | Event |
| ---: | --- |
| 0.00–2.80s | exact stillness |
| 2.80–2.96s | a duplicate salmon feather underprint appears 1.5px right and 0.5px down at 18% opacity |
| 2.96–3.42s | the duplicate underprint settles into exact registration using strong ease-out |
| 3.18–3.78s | one 50–70° segment of the existing pink circle gains slightly denser dry ink; geometry does not change |
| 3.78–4.08s | ink density returns to the original plate |
| 4.08–8.00s | exact stillness |

The event occupies roughly 1.3 seconds. Most of the loop is genuinely still. No blink. No breathing. No moving paper fiber.

## Fal prompt

```text
This is a locked flat print plate, not a living scene. Keep the camera and every graphite contour absolutely fixed. Animate only two named pigment regions: the supplied salmon feather-underprint mask and the supplied open-pink-circle mask. Between seconds 2.8 and 4.1, a faint duplicate of the existing salmon ink appears 1.5 pixels to the right and 0.5 pixels down, then returns precisely into registration. During the same event, one short existing section of the open pink circle receives slightly denser dry ink and fades back to its original density. Preserve the exact paper grain. No character motion, eye motion, feather deformation, new strokes, new particles, lighting change or camera movement. The first and last frame are the supplied identical image.
```

## Negative prompt

```text
blink, breathing, morphing, melting, silhouette, black flood, moving face, moving eyes, moving horns, moving beak, feather growth, feather lift, liquid ink, smoke, dust storm, crawling grain, camera pan, zoom, parallax, focus pull, lighting change, new marks, closed circle, logo animation, 3D depth, glossy surface, cloth paper
```

## Runtime motion, not baked into Fal

On fine-pointer desktop only, separate static layers may respond to cursor position:

- circle: maximum 4px;
- Gryphon color underprint: maximum 2px;
- Faun and graphite linework: 0px;
- spring return: `{ duration: 0.5, bounce: 0.2 }`.

Disable this on touch, Save Data and reduced motion. Pause the ambient video whenever the hero is outside the viewport.

## Acceptance

- At 25% speed, Faun is pixel-stable.
- At 25% speed, Gryphon outline, eye and beak are pixel-stable.
- Paper grain does not crawl.
- Outside the two motion masks, every output pixel equals the source pixel.
- First-to-last composite SSIM ≥0.995.
- A viewer reading the hero notices life on a second glance, not a video competing for attention.

## Boundaries

- Do not change hero copy, layout or typography.
- Do not create a character blink variant.
- Do not add continuous floating particles.
- Do not generate more than two audition seeds.

