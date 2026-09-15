# Self-audit of the failed animation pack

## Verdict

The previous still art direction was usable. The motion pack was not. Overall score against the requested “sleek 2026 / Apple-award” bar: **3/10**. Motion craft alone: **2/10**.

## What I got wrong

| Failure | Evidence | Why it mattered | Correction |
| --- | --- | --- | --- |
| Wrong tool for the job | Full 720×900 opaque videos were generated for keep, pass and card arrival | A prerecorded movie cannot originate from the real card, react to velocity, target the real collection, or be interrupted | Build interaction motion in CSS/WAAPI/Rive; use Fal only for texture material |
| Preservation existed only in prose | The hero prompt said “no morphing,” yet the Gryphon turns into a black silhouette | Generative models do not obey pixel locks merely because the prompt asks | Restore every locked pixel from the source after generation; reject before export |
| No real loop gate | Hero desktop first-to-last SSIM is `0.724170`; mobile is `0.768344` | A seamless loop should end almost exactly where it begins | Require composite first-to-last SSIM ≥ `0.995`; target `1.000` outside the motion mask |
| Wrong aspect pipeline | Desktop master is 1536×1024 (3:2), while the rendered video is 1920×1080 (16:9) | The model had to reinterpret or crop the composition before motion even began | Create the exact output canvas first by extending paper only; never resize or redraw characters |
| Semantics were decorative | Save creates a pink dot on Gryphon’s forehead; pass creates unrelated blotches | Neither action communicates “file this artwork” or “move on” | Move the real artwork toward its real destination; pass simply follows the dismissal gesture |
| Timing contradicted UI state | Feedback clips last 533–833ms; the next card appears after 240ms | Feedback describes an action after the interface has already advanced | High-frequency feedback ≤160ms; card exit ≤220ms; rare favorite ritual ≤460ms |
| The asset set had no state model | `open-next-card` and `loader-circle` are unused; swipe overlays live only on the legacy deck | A list of clips is not a motion system | Define idle, loading, dragging, threshold, committed, favorite, error and reduced-motion states |
| Opaque compositing | Every MP4 is `yuv420p`; Studio shrinks reaction clips to 9rem and uses `mix-blend-mode:multiply` | The result looks like a tiny pasted movie, not a material response | Deliver alpha overlays or deterministic layers; never a paper rectangle inside another paper rectangle |
| Character motion was overused | The same Faun/Gryphon card back fronts unrelated actions | Mascots displaced the art and flattened meaning | Faun guides; Gryphon archives; paintings dominate every routine action |
| No economical review gate | Full generations were produced before contact-sheet approval | Prompt quality was mistaken for output quality and approximately $25 was wasted | Generate two low-resolution auditions, calculate drift, show contact sheets, then stop |

## Measured first-to-last drift

Measured from the delivered MP4 files with FFmpeg SSIM. Higher is closer to a true loop.

| Asset | First-to-last SSIM | Verdict |
| --- | ---: | --- |
| hero ambient desktop | 0.724170 | catastrophic morph, reject |
| hero ambient mobile | 0.768344 | catastrophic morph, reject |
| loader circle | 0.919726 | visible discontinuity, reject |
| open next card | 0.835666 | not a stable transition, reject |
| pass card | 0.960956 | visually closer, semantically wrong |
| save to profile | 0.971617 | visually closer, semantically wrong |
| swipe keep overlay | 0.734522 | major frame mutation, reject |
| swipe pass overlay | 0.901656 | discontinuous and unclear, reject |

## Keep, salvage, delete

- **Keep**: the four source stills, palette, paper texture, open circle, Faun portrait and Gryphon illustration.
- **Salvage as inspiration only**: the notion of dry ink, registration offsets and an archival ritual.
- **Delete from product use**: all eight rendered clips.
- **Never repeat**: blinking, feather “breathing,” full-scene image-to-video for high-frequency UI, arbitrary particles, mascot cutaways, post-hoc trimming used to invent interaction timing.

## Why the prompts failed despite sounding detailed

The prompts described what not to do but did not constrain where pixels could change. They also combined mutually hostile requests: exact facial geometry plus a blink; exact feather structure plus feather movement; exact paper texture plus animated fibers. A generative model resolves those contradictions by redrawing the scene. The new pipeline gives motion a literal mask, restores locked pixels and judges the output before encoding.

