# Scout School: Taso's Field Manual

Private, authenticated five-day course for Anastasia (Taso), the Replika UGC
scout. It is a working manual, not a marketing landing page.

## Direction contract

**FORM seed:** user-pinned direction 1, `taso-field-manual`, approved
2026-08-20. This is a code-led surface inside the established dmklochko.com
world; there is no approved page comp.

**WORLD:** a working five-day course printed on warm paper, cut with deep
petrol, seal red and Taso's own visual motifs. Editorial, tactile and direct.
Taso is the protagonist in three commissioned collage illustrations derived
from her supplied photographs. No stock person and no generic dashboard art.

**FIRST VIEWPORT:** state the job, show the five-day promise, keep one clear
start or continue action, expose the whole route and keep Taso visibly central
at both 1366x774 and 390x844.

**VISITOR PATH:** one sentence, see it, know it, choose, do it, repeated daily.
The rhythm is claim, concrete screen or example, explained choice, action.

**SIGNATURE INTERACTION:** the sticky field strip remembers progress and moves
the reader between lessons while the scout desk turns learning into real
pipeline work. The desk remains useful after the course and stores work locally
with honest save, export and restore states.

**HONEST RISK:** the image-rich editorial treatment cannot make the course
slower. Media stays compressed, private, dated, captioned and subordinate to
the next action.

## Constraints

- All private media uses authenticated `/scout/media/*`; nothing enters
  `public/` or `dist/`.
- One reveal animation only. Motion must stop under reduced motion.
- Warm paper is the page itself, never a floating readability panel over art.
- Body text clears 4.5:1, standalone targets clear 24px, and 390px has no page
  overflow. Wide tables announce their own horizontal scroll.
- Claims are blunt but scoped. No magic engagement rate, invented platform
  limit, universal performance promise or unsourced rate promise.
- Screenshots name the tool, query and capture date. Video has controls and a
  captions track. External examples stay source-linked when republishing them
  would be misleading or brittle.

## Tokens

- paper `#f1ead7`, paper deep `#dfd3b8`
- ink `#172927`, ink soft `#3d4a45`
- petrol `#102f33`, petrol raised `#1c4145`
- seal `#9f3f2c`, seal on petrol `#ff876e`
- mist `#c8d1c1`, rain `#48666a`
- caution gold `#6d582f`, evidence blue `#668da1`
- hair `rgba(23,41,39,.22)`, hair on petrol `rgba(241,234,215,.25)`
- prose Newsreader 400/600; display Zodiak 400/400 italic; explanation system
  sans; controls and state system mono

## Shipped world

Ground truth is `contents/scout-school.html`, accepted with a ship verdict on
2026-08-20. Preserve the direction contract above; the record below captures
what the built surface resolved.

### Type and hierarchy

- Body copy is Newsreader at 18px/1.58 on desktop and 17px on mobile. Reading
  passages cap near 69ch.
- The hero is Zodiak at `clamp(3.4rem, 5.5vw, 4.8rem)` and 0.88 line-height.
  Lesson titles are Zodiak at `clamp(2.4rem, 5vw, 4.5rem)` and 0.94.
- System sans explains compactly. System mono marks course labels, navigation,
  controls, source captions and live state.

### Layout and material

- The desktop hero is a two-part cover with a minimum 660px field. At 960px
  it stacks with Taso's collage first.
- Lessons cap at 76rem with a 12.5rem label rail, a reading lane capped at
  44rem and a 28–72px seam. Two-column media may span the spread.
- Under 700px, the rail becomes ordinary reading order, gutters are 22px, the
  six-stop strip becomes a 3×2 grid and the tracker defaults to cards.
- Warm paper is the page. Deep petrol bands divide chapters. Near-paper cards
  use 2px corners, one-pixel edges and low green-black ambient shadows. Pills
  are reserved for actions; small circles are reserved for state.

### Components and state

- The primary start or continue pill is 48px high on desktop and 44px on
  mobile. Tracker toolbar actions clear 40px; course checks clear 36px with
  24px boxes; no standalone control falls below 24px.
- The sticky six-stop course strip is 68px high on desktop and 44px per stop
  on mobile. Paper-deep marks the current stop; a seal dot marks completion.
- Choice cards lift 2px on hover. Answering gives the correct card a green
  edge and inset rule while muting an incorrect selection.
- Wide tables carry a visible `scroll →` cue. The tracker changes to mobile
  cards below 700px, with an explicit table/card view switch.
- The desk exposes saved, saving, warning and blocked states. It exports CSV,
  backs up and restores JSON, asks before merge or replace, and gives deletion
  an eight-second undo toast.

### Motion and media

- The one entrance animation is Taso's 900ms image clip reveal using
  `cubic-bezier(.16, 1, .3, 1)`. Hover lifts and transient feedback may
  transition only to explain state.
- Reduced motion removes the reveal, smooth scrolling and component
  transitions.
- All commissioned collages, screenshots and video stay under authenticated
  `/scout/media/*`. Screens and examples are captioned evidence, never the
  protagonist.

### Durable rules

**The Field Manual Is Its Own World Rule.** Do not import dream skies, bebop
ASCII or the public mode toggle.

**The Paper Is The Ground Rule.** Paper may be the page and a working card. It
may not become a floating readability slab over art.

**The Work Survives The Lesson Rule.** Local persistence must name its limit,
offer portable backup and stay honest and usable when storage is blocked.

**The One Reveal Rule.** One authored entrance belongs to Taso's hero image.
Everything after it moves only to explain hover, navigation, feedback or
recovery.
