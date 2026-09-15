# UI-02, UI-03 and UI-06: discovery motion

## Purpose

Discovery is a high-frequency judgment surface. The painting must occupy the stage and follow the user's hand. Brand motion stays at the edge.

## Card stage

- Active art uses the largest possible contain-fit box.
- The next real work is already rendered beneath it.
- The lower mount is offset 8px right and 8px down with a 0.7-degree rotation.
- Faun lives in the left rail as a quiet registration gauge, never over the artwork.

## Left-rail Faun

- Idle: exact black key plate, completely still.
- Drag right: a pink plate moves into registration in direct proportion to drag progress.
- Drag left: any temporary pink plate withdraws; the black plate stays calm.
- Keep release: the pink plate catches the black key in 140ms, then rests.
- Pass release: temporary color clears in 100ms. No disappointment, recoil or sad face.
- Absolute favorite: a rare pink and salmon second pass lands in 320ms with one orange registration point.
- Keyboard and reduced motion: switch directly to the correct resting state with no travel.

Faun's expression, crop, face, horns and silhouette never change. This is a printing-state indicator, not a mascot performance. See `storyboards-v3/06-studio-faun-feedback.png`.

## Drag

- Horizontal movement follows pointer 1:1.
- Rotation: `clamp(-4deg, dx / cardWidth * 8deg, 4deg)`.
- Do not change vertical position.
- Do not scale the artwork.
- Do not grow blur or shadow.
- Keep cue develops along the right paper edge.
- Pass cue develops along the left paper edge.
- Cues begin only after 10 percent width movement and reach full strength at the commit threshold.

## Threshold

Commit when either is true:

- horizontal distance exceeds 18 percent of card width;
- release velocity exceeds `0.11 px/ms` after at least 45px movement.

At the first threshold crossing, the relevant paper-edge cue compresses to `scale(0.97)` for 100ms. No haptic assumption is baked into the visual.

## Keep

1. Card continues right with release velocity.
2. Persistence begins immediately.
3. A 36 to 44px clone of the real artwork appears in the visible session rail.
4. The clone settles from `translateY(6px) scale(0.97)` over 160ms.
5. The next card is available within 220ms.

The routine keep action does not add a new fragment to the hero portrait every time. The portrait may refresh after a session or milestone.

## Pass

1. Card continues left with release velocity.
2. No object, ink, X or character remains behind.
3. The next card is ready within 220ms.

Pass is neutral. Do not make Faun disappointed.

## Button input

- Press: `scale(0.97)` over 100ms.
- Update state immediately on activation.
- Card completion uses 180ms strong ease-out.

## Keyboard input

- No ornamental card flight.
- Replace immediately.
- Persist the session history and announce the result.

## Undo

- Undo restores the exact prior card and session state.
- For pointer or button input, the card returns from the corresponding edge over 180ms.
- For keyboard input or reduced motion, use a 120ms opacity replacement.
- Undo never replays favorite or archival rituals.

## Write failure

- Do not advance silently.
- Keep the card or session thumbnail present.
- Add a 2px graphite misregistration edge and `couldn’t save · retry`.
- Retry reuses the same payload.
- No shake.

## Exact tokens

```css
--press: 100ms;
--feedback: 160ms;
--card-exit: 200ms;
--ease-out: cubic-bezier(0.23, 1, 0.32, 1);
--ease-register: cubic-bezier(0.77, 0, 0.175, 1);
```

Return below threshold uses an interruptible spring with `{ duration: 0.5, bounce: 0.2 }`.

## Acceptance

- The card can be re-grabbed during return without a jump.
- Direction is obvious without reading button labels.
- Repeated keyboard judgments do not queue motion.
- No prerecorded media is decoded for a routine action.
- The image remains uncropped and larger than every decorative element.
