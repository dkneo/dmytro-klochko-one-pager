# UI-01: delayed registration loader

## Rule

A fast response shows no loader. A slow response shows progress through one finite printing action, then holds. Ready content always replaces it immediately.

## Timeline

| Time | State |
| ---: | --- |
| 0 to 700ms | nothing |
| 700ms | faint Faun relief appears |
| 760ms | pink plate lands 3px high and 2px right |
| 860ms | black key catches the pink plate |
| 960ms | pressure increases through opacity only |
| after 1040ms | resolved mark holds, completely still |

Visible size is 56 to 72px in product. The storyboard enlarges it only to show construction.

`storyboards-v3/06-studio-faun-feedback.png` shows the loader at its actual 56px product size inside the artwork stage.

## Finish

- If content becomes ready at any point, resolve from the current state in at most 90ms and replace the loader in 90 to 120ms.
- Do not wait for the printing sequence.
- For operations longer than two seconds, show one literal label such as `loading the painting` or `saving your note`.

## Failure

Keep the relevant preview and show `couldn’t load · retry`. Stop all motion. Do not damage the character, shake the surface or invent a sad state.

## Reduced motion

After 700ms, show the resolved Faun at 8 percent opacity. Replace immediately when ready.

## Implementation

- CSS mask or canvas from the exact Faun source;
- no video, spinner, looping arc, bouncing dots or artwork rectangles;
- pause timers in hidden tabs;
- `aria-live` only for meaningful copy changes.

## Acceptance

- no flash for responses under 700ms;
- no cycle after the mark resolves;
- can finish cleanly from every state;
- negligible main-thread work;
- looks intentional at 56px, not only in the enlarged storyboard.
