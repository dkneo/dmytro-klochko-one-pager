# Production acceptance scorecard

No candidate reaches Dmytro unless every critical item passes. “The model mostly followed the prompt” is not a pass.

## Critical gates

| Gate | Method | Pass |
| --- | --- | --- |
| Source identity | difference matte outside named motion mask | exact equality after compositing |
| Loop closure | first versus final composite SSIM | ≥0.995; target 1.000 outside mask |
| Aspect integrity | compare prepared master and delivery canvas | no subject scaling, crop or redraw |
| Semantic clarity | view in actual UI at 100% speed | state is understood without decorative copy |
| Timing | `ffprobe` duration plus UI capture | routine ≤220ms; favorite ≤460ms; hero event ≤1.3s |
| Interruptibility | retrigger/reverse during motion | no restart flash, queued clip or blocked input |
| Painting priority | pixel coverage and visual review | painting remains largest and unobscured |
| Alpha/compositing | inspect over white, black and product paper | no rectangular video edge or muddy multiply blend |
| Reduced motion | system preference enabled | travel/rotation absent; state feedback remains |
| Spend | `spend.json` | audition ≤$4; total ≤$8 |

## Frame-level rejection checklist

Reject if any answer is yes:

- Did Faun’s expression, eye, nose, mouth, ear, hair or horn change?
- Did Gryphon’s eye, beak, silhouette or feather outline change?
- Did a painting or poster pixel change because of a generated effect?
- Did paper grain crawl, pulse or behave like fabric?
- Did the open circle close or change geometry?
- Did the frame gain an unrequested blotch, symbol, letter or object?
- Is there camera movement or generated depth?
- Does the effect look like blood, smoke, confetti or magic?
- Would the animation still make equal sense for the opposite action?
- Does a routine action make the next artwork wait?

## Required review artifacts

For each candidate:

1. source master;
2. normal-speed preview in actual UI context;
3. 25%-speed preview;
4. six-frame contact sheet at 0, 20, 40, 60, 80 and 100%;
5. difference heatmap;
6. locked-region overlay;
7. first-to-last SSIM result;
8. endpoint, request ID, seed and cost;
9. accept/reject line citing one exact criterion.

## Feel score

Only after critical gates pass, score each from 1–5:

- inevitable: motion feels like the only natural outcome of the action;
- immediate: response begins on the same frame as input;
- restrained: no element asks for attention twice;
- tactile: weight, pressure and direction are believable;
- branded: paper, ink, Faun and Gryphon roles remain coherent;
- quiet at scale: the 50th swipe feels as good as the first;
- beautiful paused: every sampled frame still looks intentional.

Minimum final score: **31/35**, with no category below 4.

## Device checks

- Desktop: 1366×768 and 1920×1080, mouse and keyboard.
- Mobile: real 390px viewport, touch drag and reduced motion.
- Slow network: 1.5s, 5s and 10s image delays.
- Save Data: hero remains a still and no ambient video downloads.
- Background tab: hero and loaders pause; resume without jumping.

## Final decision language

- **ACCEPT**: all critical gates pass and feel score is 31/35 or higher.
- **REVISE WITHOUT NEW GENERATION**: geometry is sound; timing, crop or compositing can be fixed locally.
- **REJECT**: any locked geometry changes, semantic state is unclear, or another Fal call would merely gamble on the same prompt.

