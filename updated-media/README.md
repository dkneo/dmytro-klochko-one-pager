# updated-media

Drop new photos and video here. I read the filename to know which slot it
replaces, then process it into `public/images/` and wire it up.

Anything in this folder is gitignored (only this README is tracked), so drop
full-resolution originals. Don't pre-crop or pre-resize; I do that per slot.

## Naming

`slot-name.ext` — the slot name is the prefix, anything after a `--` is ignored:

```
hero-center.jpg
hero-center--alt2.jpg      also fine, I'll ask which you prefer
about.jpg
```

If a name doesn't match a slot below, I'll ask rather than guess.

## Slots

| filename          | where it lands                | shape it gets cropped to |
| ----------------- | ----------------------------- | ------------------------ |
| `hero-left`       | hero collage, left, tilted    | tall-ish portrait        |
| `hero-center`     | hero collage, centre, largest | portrait                 |
| `hero-right`      | hero collage, right, tilted   | portrait                 |
| `about`           | about me, on near-black       | portrait (~0.9)          |
| `career`          | career now, beside the story  | landscape (~1.3)         |
| `childhood-chess` | upbringing, "first obsession" | landscape                |
| `childhood-piano` | upbringing, "second obsession"| landscape                |
| `now`             | upbringing, "now"             | portrait                 |
| `vlog-1`          | watch, first card             | portrait                 |
| `vlog-2`          | watch, middle card            | landscape (~1.34)        |
| `vlog-3`          | watch, third card             | tall portrait (~0.8)     |
| `interview`       | watch, the documentary still  | landscape (~1.75)        |
| `taste`           | taste, the museum photo       | landscape (~1.15)        |
| `cutout`          | contact, large cutout         | PNG, transparent bg      |
| `cutout-reading`  | contact, small cutout         | PNG, transparent bg      |
| `og`              | the link-share card           | 1200x628, I'll compose it|

## What makes a frame work here

- **No burned-in subtitles, timestamps, mute icons or player chrome.** Four of
  the originals were video screenshots and it showed. If it only exists as a
  frame in a video, give me the video and I'll pull a clean one.
- Cutouts need a real transparent background, not white.
- Faces read better than crops without one, especially in the hero.

## Video

- Short muted loops, a few MB, `.webm` or `.mp4`. I'll set them
  `autoplay muted loop playsinline`.
- Anything longer goes to YouTube or Vimeo and gets embedded through a
  lightweight facade, so no heavy player JS loads up front.
- **The host caps a single file at 25 MB.** Don't commit anything bigger; give
  me the source and I'll compress or link it out.
