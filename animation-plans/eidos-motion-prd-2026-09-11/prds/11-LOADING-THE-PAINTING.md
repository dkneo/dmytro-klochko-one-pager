# 011 — Load the painting by developing its plate

- **Status**: TODO
- **Commit**: `9474e4b`
- **Severity**: HIGH
- **Category**: purpose, state feedback, clarity
- **Fal eligible**: no video generation

## Problem

The current loader is three broken circles rotating at 1.8, 2.2 and 2.6 seconds. It is technically a spinner but says nothing about an artwork arriving. The failed Fal loader is also unused and cannot react when loading completes.

## Target

The actual incoming artwork develops from a small local preview into the full painting through three visibly misregistered print plates. The loader is specific to the content, explains the wait, and can finish the instant the high-resolution image is ready.

## Required data

- low-resolution candidate thumbnail or dominant-color placeholder;
- full artwork URL;
- title and artist for plain-language status copy;
- image-ready and image-error events.

## State machine

| State | Trigger | Result |
| --- | --- | --- |
| hidden | request <350ms | no loader flashes |
| enter | still pending at 350ms | paper mount fades in for 120ms |
| registering | image pending | three color separations converge in a 960ms interruptible loop |
| ready | image decoded | plates snap into register and full image resolves in 210ms |
| error | 8s timeout or error | all motion stops; retry appears |

## Registering loop

Derive three monochrome layers from the real thumbnail. Never invent imagery.

| Time | Graphite plate | Olive plate | Pink/orange plate |
| ---: | --- | --- | --- |
| 0ms | x −3px, y +1px, opacity 0.24 | hidden | hidden |
| 180ms | x −2px | x +3px, y −1px, opacity 0.18 | hidden |
| 360ms | x −1px | x +2px | x 0px, y +3px, opacity 0.14 |
| 540ms | x 0px | x +1px | y +2px |
| 760ms | registered | registered | registered |
| 960ms | hold registered or finish immediately | hold | hold |

Use `cubic-bezier(0.77, 0, 0.175, 1)` while plates move. If loading continues, separate by only 1px and repeat. Do not rotate anything.

## Completion

1. Any active plate motion retargets from its current value.
2. All plates reach exact registration in 90ms.
3. The full image replaces the preview through opacity over 120ms.
4. Status copy disappears over the same 120ms.
5. The user can act immediately; completion never waits for a loop boundary.

## Copy

Use literal language: `loading the painting`.

If title is available: `loading “{short title}”`.

Never use “registering plate” as the only explanation. The metaphor can live in the motion; the words must remain clear.

## Fallback when no thumbnail exists

Use the exact `reference/faun-mark.webp` as a two-tone halftone at 48px. Graphite appears first, pink circle second, then both fade to 35% and repeat. This fallback must remain rarer than the artwork-derived loader.

## Fal allowance

Grokbot may use Fal image generation for one static dry-ink texture sheet only if the current source texture cannot tile. It may not call image-to-video for this loader.

## Acceptance

- No loader appears for cached/fast images.
- A stranger can say “the artwork is loading” without reading documentation.
- Completion interrupts the loop immediately.
- The preview remains recognizable throughout.
- Nothing rotates, pulses, bounces or displays a mascot movie.
- Reduced motion shows the preview at 35% opacity with the same clear copy, then crossfades to full opacity in 120ms.

