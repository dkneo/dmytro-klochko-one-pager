# The Eidos motion system

## North star

**Living print, not living character.** Eidos feels like an exacting naturalist’s archive being handled by hand. Paper has weight. Ink has registration. Art never becomes decoration. Motion explains where something came from, where it went, or what state changed.

## Roles

- **The artwork** is the protagonist. It occupies the largest visual area and supplies the color.
- **Faun notices.** Faun may appear in navigation, guidance, first-use cues and the absolute-favorite ritual.
- **Gryphon remembers.** Gryphon may appear at archival destinations, never as generic approval confetti.
- **The open circle** means an unfinished, growing collection. It never closes into a seal.
- **Paper and ink** provide texture, not spectacle.

## Three motion materials

1. **Specimen**: the actual painting, poster, thumbnail or card. It follows the user’s hand and travels to a real destination.
2. **Ink plate**: graphite, olive, baby pink and a small orange registration point. Plates may offset by 1–3px and settle into alignment.
3. **Paper**: restrained pressure, shadow and fiber. No waving sheet, fake cloth physics or moving grain.

Anything outside these three materials is out of vocabulary.

## Interaction states

| State | Meaning | Motion |
| --- | --- | --- |
| idle | ready to inspect | none; hero may perform one rare ambient ink event |
| loading-short | under 350ms | no loader |
| loading | artwork data is pending | low-resolution artwork develops through three registration plates |
| dragging | direct manipulation | card follows pointer 1:1; rotation and edge cue derive continuously from distance |
| threshold | release will commit | one small tactile compression at the destination cue; no clip |
| keep | file the work | real thumbnail enters session rail; current card clears right |
| pass | continue looking | current card clears left; nothing decorative remains |
| favorite | rare archival distinction | Faun impression lands on the paper mat, then the actual thumbnail enters favorites |
| error | state did not complete | motion stops; clear retry copy appears beside the unchanged item |
| reduced motion | spatial movement disabled | opacity/color feedback remains; no travel, rotation or ambient loop |

## Timing and curves

Use these exact values in the eventual implementation:

```css
--motion-press: 120ms;
--motion-feedback: 160ms;
--motion-card: 220ms;
--motion-favorite: 460ms;
--ease-out: cubic-bezier(0.23, 1, 0.32, 1);
--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);
```

- Button press: 100–160ms.
- Card completion after a pointer gesture: 180–220ms, carrying release velocity.
- Return below threshold: spring `{ duration: 0.5, bounce: 0.2 }`, interruptible.
- Favorite: 460ms maximum because it is rare and deliberate.
- Hero ambient event: 900–1200ms within an otherwise still 10–14 second interval.
- No routine action waits for an animation to finish.

## Input-specific behavior

- **Pointer/touch swipe**: direct and physical. The card follows the finger and preserves velocity on release.
- **Button click**: 120ms press feedback, then immediate state update. No mascot movie.
- **Keyboard**: no ornamental animation. Replace the item immediately and update the session rail.
- **Hover**: only under `@media (hover: hover) and (pointer: fine)`; maximum 2px translation or color change.

## Layer architecture

Do not render one flattened movie. Preserve these layers independently:

1. static paper;
2. static Faun;
3. static Gryphon graphite linework;
4. static olive Gryphon plate;
5. static salmon/pink Gryphon plate;
6. static open-circle plate;
7. actual artwork or thumbnail;
8. optional alpha ink-texture overlay.

Fal may contribute only layer 8. Layers 1–7 remain exact source or runtime content.

## Frequency discipline

- Pass and keep can happen dozens of times in one session. They must become quieter with use, not louder.
- Favorite is rare and may carry delight.
- Session completion is rare and may carry a larger transition.
- Hero ambient is marketing motion, not task feedback. It pauses offscreen, under Save Data, and under reduced motion.

## Responsive behavior

- Desktop: cursor-linked parallax may move independently separated layers by at most 4px; never move the camera.
- Mobile: no continuous parallax. One touch-down pressure response only.
- The mobile hero gets its own composition, not a crop of desktop.
- Every action stays legible at 390px and does not place effects outside the viewport.

## Accessibility and clarity

- Motion is never the sole indicator. Keep, pass, favorite, loading and error retain text or persistent state.
- Reduced motion keeps a 120–160ms opacity or color change and removes travel, rotation and ambient effects.
- No audio by default. The system may expose optional sound hooks later, but this asset pack must be silent.

