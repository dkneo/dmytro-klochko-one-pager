# Fal production runbook

## Tool boundary

Fal is a texture and atmospheric-motion renderer in this project. It is not responsible for state, gesture physics, destinations, timing logic, typography or composition.

### Fal-eligible

- hero ink-pressure overlay;
- favorite dry-ink impact texture;
- optional microscopic paper-fiber overlay, only if it remains genuinely microscopic.

### Never send to image-to-video

- loader logic;
- card arrival;
- keep or pass motion;
- swipe physics;
- actual painting movement;
- Faun’s face, eyes or horns;
- Gryphon’s eye, beak, silhouette or feather geometry;
- buttons, text, labels or navigation.

## Current endpoint choice

Use `fal-ai/ltx-2.3-22b/image-to-video` for low-cost hero auditions. The current Fal endpoint accepts both an image and an end image, so pass the exact same prepared master as both. Disable generated audio. Use the smallest frame count that represents the event.

Official endpoint: <https://fal.ai/models/fal-ai/ltx-2.3-22b/image-to-video>

Do not use the old `fal-ai/ltx-2.3/image-to-video` path from the failed manifest. Do not use reference-to-video or a cinematic model merely because it is newer. The source image is a print plate, not a scene.

If LTX alters locked geometry on two seeds, stop. Do not escalate to an expensive model. Produce the requested overlay deterministically.

## Prepare exact masters before generation

1. Desktop delivery canvas: 1920×1080.
2. Mobile delivery canvas: 1080×1920.
3. Extend only the warm paper outside the original canvas. Use texture synthesis from empty paper regions.
4. Paste the original Faun, Gryphon, foliage, circle and dots back at original pixels. Do not scale the characters to fill.
5. Save a SHA-256 hash of every prepared master.
6. Create binary masks for:
   - locked Faun;
   - locked Gryphon graphite geometry;
   - allowed salmon/olive feather underprint;
   - allowed open-circle segment;
   - locked dots and foliage;
   - blank paper.

## Audition settings

- Resolution: 720p or lower.
- Audio: false.
- Start image: prepared master.
- End image: the identical prepared master.
- Candidates: exactly two seeds per Fal-eligible asset.
- No interpolation or upscaling.
- Keep the complete generation. Do not hide a bad generation by selecting a lucky 0.5-second crop.

## Mandatory postprocessing

The model output is raw material, never the final asset.

1. Stabilize every frame to the prepared master. Reject if stabilization requires scale, rotation or perspective correction.
2. Replace all pixels in locked masks with the exact source pixels on every frame.
3. Compute a difference matte against the source.
4. Remove every difference outside the explicitly allowed motion mask.
5. Feather the allowed matte edge by at most 0.5px at delivery resolution.
6. Export the allowed motion as an alpha layer where possible.
7. Composite it over the exact still and inspect at 25% playback speed.
8. Require first and final composite frames to match with SSIM ≥0.995; target exact equality outside the motion mask.

Fal offers video background removal with transparent WebM output, but use it only for isolated particle material. It does not replace the source-lock masks: <https://fal.ai/models/bria/video/background-removal/api>

## Cost control

Create `spend.json` before the first call:

```json
{
  "audition_cap_usd": 4,
  "final_total_cap_usd": 8,
  "spent_usd": 0,
  "approved_for_final": []
}
```

Before every call:

1. calculate the quoted cost;
2. add it to projected spend;
3. refuse the call if projected spend exceeds the active gate;
4. log request ID, endpoint, seed, dimensions, frames and exact cost;
5. retain rejected outputs and record the violated rule.

## Audition handoff gate

After Gate A, stop and provide only:

- one contact sheet per asset with start, 20%, 40%, 60%, 80% and end frames;
- a 25% speed preview;
- a source-versus-output difference heatmap;
- first-to-last SSIM;
- the real spend total;
- one sentence per candidate: accept or reject, and why.

No final render begins until Dmytro selects a candidate.

## Final exports

### Hero overlay

- Desktop: 1920×1080, 24fps, 8 seconds, transparent WebM VP9 if available.
- Mobile: 1080×1920, 24fps, 8 seconds, transparent WebM VP9 if available.
- MP4 fallback may be a full composite over the exact prepared master.
- Desktop WebM target ≤1.8MB; mobile WebM target ≤1.2MB.

### Texture overlays

- 768×768, 24fps, 0.46 seconds for favorite impact.
- Alpha WebM VP9 plus transparent PNG sequence.
- WebM target ≤180KB.

## Automatic rejection

Reject without asking if any one occurs:

- a face, horn, ear, eye, beak, feather outline, foliage contour or artwork pixel moves outside its mask;
- paper grain crawls or boils;
- the Gryphon becomes darker, larger or more dominant;
- the open circle closes;
- camera motion appears;
- new marks, letters or symbols appear;
- the event cannot be identified in context at normal playback speed;
- the last frame cannot return cleanly to the exact still;
- a microinteraction exceeds its PRD duration;
- the file is an opaque paper rectangle intended to be layered over another paper rectangle.

