# The Taste Checklist

What Dmytro likes and wants, distilled from one long night of building,
rejecting, and rebuilding. Every future change gets argued against this
list before it ships. Evidence in parentheses.

## Loves — protect these

1. **His own art, huge and visible.** The only unprompted "GOOD" of the
   night came when his paintings went full-bleed as the journey. The art
   is the site; the text visits it.
2. **Pink.** Favourite colour. Kawase cloud pink `#ff9bc0` carries accents.
3. **Sharpness.** Art must never blur or pixelate (two furious rounds).
   Contained sizes or high-res sources only.
4. **The survivors** — never once rejected across five redesigns: falling
   petals, pink marker swash on highlights, the peek (words lift photo
   stacks), serif voice for sentences / mono for machinery, tilted cream
   mats on snapshots, `copied ✓`, typing l-i-s-a.
5. **Quiet column, letter-scale type** (rauno.me / emilkowal.ski / the
   reference video he sent): ~40rem, small titles, tight rhythm.
6. **Symmetric, beautiful grids** for text and images; his photographs
   must look GREAT (his words, his caps).
7. **Video-game title-screen feeling**: the first screen is a world, not
   a document. Magic, whimsy, tenderness.
8. **Micro-interactions everywhere it makes sense**: hover lifts that
   settle, stamps that re-press, labels that whisper back.
9. **Bebop noir** as the stable home base — never break it while dream
   experiments.
10. **Meaningful scene mapping** — art tied to the story it accompanies
    (campfire = fellowship, boy fishing = childhood, snow village = say hi).

## Hates — never again

1. Blurry or stretched art ("it's just some PIXELS").
2. Art I invent — ASCII, SVG icons, generated landscapes: five rejections.
   Derive from his artifacts or professionals; never freehand.
3. Large empty space that asks for attention and gives nothing ("85%
   NOTHING").
4. Cream/white slabs and floating blocks ("WEIRD WHITE BLOCKS").
5. Wavy underlines (spellcheck vibes) and em-dashes in prose.
6. Poster-sized type and loud section numbers in the quiet design.
7. Broken or asymmetric grids, orphaned punctuation, spacing that doesn't
   explain itself.
8. Redundant art (the same painting twice, decorations without a job).
9. Copy that hedges or contradicts itself ("a very healthy obsession").
10. Beige/white text-background panels as the readability fix — the
    approved answer is smoked glass: dim the painting itself, never paint
    over it.

## Engineering non-negotiables

- Verify against built `dist/` on a static server (vite dev has served
  500s mid-recompile and poisoned screenshots).
- The embedded pane freezes CSS transitions and rAF; anchored headless
  captures render only the body colour. Test states with transitions
  disabled; trust fresh-load paints and DOM measurements.
- Both modes, both pages, 390 and 1440, every round. No horizontal
  overflow, no broken images, tap targets ≥24px, text contrast ≥4.5:1,
  `prefers-reduced-motion` silences all ambient motion.
- Every colour and size ships as a documented token (DESIGN.md + sidecar).
- Deploy = live byte-identical to dist, three consecutive matching reads.

## Open inputs (his side)

- The elaya X post — THE direction, still unseen. The omer hover post.
- Animated scene loops (offered): MP4/WebM, 2560px, 6–12s seamless, no
  camera motion.
- Photos for the taste wall: daft punk, jony ive, david foster wallace.
