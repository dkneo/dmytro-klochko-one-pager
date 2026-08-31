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

## House rules — surfaces, spacing, shape

Written after an audit of the homepage and press on 1 Sep 2026 found ten
different treatments for what are really three kinds of object, nine widths
of the one framing material, seven corner radii and sixteen gap values
against a scale that documents five. None of it was decided; all of it was
arrived at, one component at a time. These are the rules that stop it
happening again. Each is a token, so it can be checked rather than argued.

### 1. Three kinds of object, three radii

  --r-print  2px   a photograph, in a mat or bare. Paper is square.
  --r-panel  3px   a surface holding something: a film, a plate, a screen.
  --r-row    6px   something that lights under the pointer.

The print inside a mat is 1px — one pixel inside the paper's own corner,
the way a cut window sits inside its board. That is the only fourth value,
and it is a property of the mat, not a radius of its own.

Never write a radius as a number. If a new thing does not fit these three,
it is probably not a new thing.

### 2. One mat, two widths

The cream mat is the site's single framing material, and only its width
varies — with the size of the print, the way a real mat does.

  --mat-snapshot  0.45rem   a photograph in a stack or a rail
  --mat-print     0.6rem    a single plate given its own room

A screenshot is not a photograph: no mat, no tilt, panel radius. A brand
campaign is not a photograph either — the mat says "out of a shoebox", and
saying that about advertising makes it look like holiday prints.

### 3. Pictures keep their own shape

Never impose a shared aspect-ratio on a set of photographs to get them onto
one baseline. Three stills were once cropped to a common 4:3; the portrait
among them lost a face at the frame edge. Alignment is not worth that. Give
a video the ratio of its own encode — a 16:9 film in a 16:10 box letterboxes,
and then someone draws a border around the bands to tidy them up.

### 4. The ladder, all of it

  --sp-hair   0.25rem   inside one line: a mark and its word
  --sp-1      0.5rem
  --sp-tight  0.75rem   inside one component: the rows of a card
  --sp-2      1rem
  --sp-3      1.75rem
  --sp-4      3rem
  --sp-5      clamp(4rem, 7vw, 6.5rem)

The old ladder started at 0.5rem, so everything that needed less invented
its own: 0.1, 0.4, 0.55, 0.6, 0.8, 0.9, 1.1rem. Two rungs were missing, not
eleven. A gap that is not on this ladder needs a sentence saying why.

### 5. One gesture, one control

Every job on the CV opens the same way, so every job's control says the same
words in the same type in the same place. The lead's once said "what i did
at replika" over a notes count beside a pink orb — five differences from the
five below it for an identical action.

A control belongs to what it opens. Right-aligning the lead's control lined
it up with the others but parked it in open ground under three press quotes;
it belongs under the last line of the paragraph it expands.

### 6. Hover and chosen are different weights

Hover is a whisper at 5.5% bone; chosen is a statement at 14% hot. Equal
weights and the reader cannot tell what is under the pointer from what is
actually selected. Hover is always inside `(hover: hover) and (pointer:
fine)` — touch fires a false hover on tap and the row stays lit. Reduced
motion drops the transition and keeps the colour: the chosen row must still
look chosen.

If a whole row lights, the whole row must be clickable. A highlight that
covers three columns of dead space is a lie about where to click.

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
