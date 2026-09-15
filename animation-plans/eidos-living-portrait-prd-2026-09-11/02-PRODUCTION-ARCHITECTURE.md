# Production architecture

## One runtime system, not a video pack

The hero, loader and feedback are deterministic compositions of exact source assets. Build them with HTML, CSS masks, canvas or WebGL only if canvas cannot keep 60fps. Generated video is not a dependency.

## Source layers

1. static paper texture;
2. one exact artwork image, contain or intentional documented crop;
3. artwork-through-Faun color mask;
4. exact graphite Faun key plate;
5. open pink registration circle;
6. one orange registration point;
7. live HTML copy and metadata.

No `art-window-01..14` layer stack exists. The current artwork is the visual field.

## Required locks

- Faun uses `reference/brand/faun-mark.webp`; no generative redraw.
- Artwork uses exact source pixels with one stable crop per viewport.
- Typography is live HTML and never enters image generation.
- Paper texture is static and cannot crawl between frames.

## Hero implementation

Use a luminance mask derived from the exact Faun. The active artwork fills the mask. Add the exact graphite source above it as the key plate. The reveal may be authored with CSS mask position, clip path or a short sprite sequence, but its resting state is always a normal responsive composition.

Do not autoplay a video to explain the product. On first load, the still is present at first paint; a single color-to-key registration may occur after stability. Subsequent artwork changes happen only because content or user state changed.

## Product motion

- Use WAAPI or CSS transitions for controls and card movement.
- Persist state immediately; visuals never delay writes.
- Keep the next artwork decoded beneath the active one.
- Interrupt and retarget from the current transform.
- Pause all nonessential work offscreen and in hidden tabs.

## Delivery

```text
eidos-motion.css
eidos-motion.js
eidos-motion-tokens.json
faun-mask.webp
hero-desktop-poster.webp
hero-mobile-poster.webp
storyboards/
motion-tests/
spend.json
rejections.json
```

If one optional generated ink texture is approved, deliver it as a transparent monochrome overlay with source, model, seed, cost and license recorded. It may not contain recognizable subject matter.
