# 013 — Give absolute favorite one Faun ritual

- **Status**: TODO
- **Commit**: `9474e4b`
- **Severity**: MEDIUM
- **Category**: rare delight, brand cohesion
- **Fal eligible**: texture overlay only

## Purpose

Absolute favorite is qualitatively different from keep. It is rare enough to deserve one memorable beat. The artwork remains unobscured and the action visibly creates a durable distinction.

## Visual concept

Faun notices the exceptional work; Gryphon archives it. A small Faun cameo is pressed into the lower-right paper mat, then a raspberry registration dot travels from that impression to the real favorite destination. The painting itself never moves, fades or receives an overlay.

## Composition

- Source cameo: `reference/faun-mark.webp`.
- Crop Faun’s face and horns only; do not include the Gryphon.
- Render as a 44–56px graphite halftone impression on desktop, 40–48px on mobile.
- Place entirely in the paper mat, never over image pixels.
- The persistent favorite thumbnail receives a small open pink arc, not a star or heart.

## Timeline: 460ms maximum

| Time | Event |
| ---: | --- |
| 0–90ms | cameo approaches paper from `scale(0.97)`, opacity 0 to 1 |
| 90–150ms | graphite impression lands; a 1px salmon ghost appears offset down-right |
| 150–260ms | salmon ghost registers into graphite; optional dry-ink impact texture dissipates within 12px |
| 220–340ms | existing raspberry registration point travels along a shallow curve toward the favorites destination |
| 340–460ms | real artwork thumbnail settles in favorites; card may clear right |

Use `cubic-bezier(0.23, 1, 0.32, 1)` for system responses. No bounce. The state update begins at 90ms and never waits for the ritual.

## Fal-generated raw material

Generate only `favorite-ink-impact-alpha`: a 0.46-second, 768×768 localized dry graphite/salmon pressure texture on a flat keyed background. No Faun, Gryphon, circle, icon or card in the generated video.

### Prompt

```text
Locked overhead macro view of a tiny hand-printed ink impact on warm matte archival paper. One restrained graphite dry-ink pressure bloom, no larger than twelve percent of the frame, lands once near the center. A much smaller muted salmon misregistration appears one pixel down-right and settles into the graphite. The rest of the frame remains perfectly still and empty. Fine real paper absorption, fractured ink edge, no liquid splash, no smoke, no camera movement, no light change. Finish fully still.
```

### Negative prompt

```text
face, person, animal, bird, horn, logo, text, symbol, heart, star, check mark, confetti, glitter, liquid splash, blood, smoke cloud, explosion, growing stain, camera motion, changing paper grain, glossy paper, 3D stamp
```

Remove the background and transfer only the approved alpha texture. Composite the exact Faun cameo separately from the source.

## Failure and undo

- If persistence fails, the Faun impression remains faint with a 2px graphite misregistration and clear `couldn’t save · retry` copy.
- Undo removes the destination arc and thumbnail immediately. The cameo fades over 120ms without reversing the entire ritual.

## Reduced motion

Display the Faun impression and favorite thumbnail immediately with a 120ms opacity change. Do not move the registration point.

## Acceptance

- The painting remains 100% visible and unchanged.
- The event unmistakably feels rarer than keep.
- The Faun source geometry is pixel-stable.
- No generated imagery covers the cameo.
- The entire event completes within 460ms.
- Triggering favorite twice quickly never stacks two rituals.

