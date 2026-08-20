# Rebuilding /scout as Taso's field manual

**Date:** 2026-08-20 · **Status:** approved

## Problem

The current page has strong material and a distinct world, but it reads like a
5,169-word document with exercises added to it. The important actions are buried,
the two most practical days are the longest, three promised screenshots are
missing, and the tracker is not safe enough for real work. Its accessibility also
breaks where the visual treatment matters most: the day-four answer cards drop as
low as 1.44:1 contrast, generated tracker fields have no accessible names, result
messages are not announced, and narrow screens hide the width of the tracker.

The source and live page are private. Anastasia's reference photographs and every
portrait derived from them must stay private too. Putting them under `public/`
would bypass the `/scout` password even if the HTML remained gated.

## Direction

Build **Taso's field manual**: a five-day editorial course that behaves like a
small working product. Keep the established pale paper, deep petrol and seal-red
world. Tighten its typography and contrast, replace the uninterrupted vertical
scroll with visible daily wayfinding, and let every chapter teach through a real
screen, a short demonstration, a decision and one concrete output.

The voice stays blunt, warm and practical. It does not turn into policy copy.
Claims either carry a reliable source, state their uncertainty, or disappear.
Advice can still be opinionated.

## First viewport

The hero introduces the job, the five-day promise and Anastasia at once.

- A stylized editorial portrait of Anastasia anchors the right side on desktop
  and becomes a wide scene behind or below the title on mobile.
- The title remains `find the people the ads are made of`.
- A compact progress strip exposes all five days, the graduation task and the
  scout desk. Each item shows done, current or untouched state.
- The first action is `start day one`; returning visitors get `continue day N`.
- Time, outcome and saved-state truth appear together. No vague promise that
  browser storage is permanent.

The hero should feel like the cover of a field notebook, not a dashboard and not
a landing page.

## Visitor path

Each day uses the same five-part learning rhythm:

1. **One sentence:** the lesson's argument.
2. **See it:** an annotated screenshot, diagram or short walkthrough.
3. **Know it:** the minimum explanation needed to make the example legible.
4. **Choose:** a quiz, thread drill or comparison with an explained answer.
5. **Do it:** a small output that belongs in the real scouting workflow.

Long tables become ranked cards on narrow screens. Large reference tables keep a
scrollable desktop-like view only when comparison across columns is the lesson.
Every horizontal region carries an explicit visual scroll cue and keyboard access.

Day lengths should converge. Day three and day four currently carry 1,049 and
1,318 words; both should lose repetition and move reusable copy into the shelf.
No chapter should require more than roughly twelve minutes of reading before its
exercise.

## Illustrations and instructional media

Create three portrait-led illustrations from the supplied photographs. They are
recognizably Anastasia, flattering without beauty-filter plastic, and treated as
editorial art rather than cartoon avatars.

1. **The scout:** red jacket, night petrol ground, phone and contact-sheet marks;
   used in the hero.
2. **Fit beats followers:** Anastasia holding the large black-and-white cat;
   playful chapter break for creator judgment.
3. **The operator:** Anastasia at a table with a phone, tracker cards and the
   keychain detail as a small personal motif; used near graduation.

The visual treatment is limited-palette gouache and cut-paper editorial print:
paper grain, dark ink contours, seal red, petrol, warm skin and restrained pink.
It must preserve face shape, brows, hair and expressions from the references.

Add at least six current, annotated instructional captures:

- Meta Ad Library search and ad card anatomy;
- TikTok Creative Center / Top Ads;
- TikTok One creator search;
- Fiverr UGC results and listing anatomy;
- a good creator profile checklist;
- partnership or Spark permission mechanics.

Add three short, captioned, muted walkthroughs recorded from official interfaces:
finding a competitor ad, reading a creator card and moving a creator through the
tracker. Creator videos remain source-linked examples instead of copied assets.
Every media item has a poster, transcript or equivalent written steps, dimensions,
lazy loading below the fold and a useful caption naming what to notice.

## Private media delivery

Store derived portraits, captures and walkthroughs in the existing Cloudflare KV
namespace under `scout:media:<slug>`. Serve them through
`/scout/media/<slug>` only after the same `SCOUT_PASSWORD` cookie check used by
the page.

The response carries the stored content type plus private cache headers. Unknown
slugs return 404 only after authentication, so the route leaks neither the asset
list nor whether a specific portrait exists. Source photographs remain local and
gitignored. The repository may contain tests and a manifest of non-sensitive
slugs, but no photo, portrait or private screen capture bytes.

Test `/scout/media/x`, `/scout/media/x/`, case variants, encoded traversal and
direct KV-style guesses without a cookie. The worker continues to gate
`/scout`, `/scout/`, `/scout/index.html`, case variants and descendants.

## Content corrections

Keep the guide's strongest premise, but remove universal and invented claims.

- Creative is a major targeting and performance lever, not literally the only
  lever left.
- Creator-native ads can outperform brand-handle ads; they do not always do so.
- Ad age and repeated variants are useful spend signals, not proof of conversion.
- A creator's permission for a competitor does not transfer to Replika. It only
  proves that the creator has dealt with paid usage before.
- Manual first contact is allowed. Repeated unwanted commercial messages are the
  problem. Delete the unsupported automated rate-limit percentage, exact ban
  ladder and made-up daily ceilings. Keep the simple rule: no browser bots, no
  blasting, no automation from the brand account, and stop when someone does not
  engage.
- Email has laws, provider rules and reputation costs. It is not an unpoliced
  volume loophole.
- Label fictional creator handles as practice profiles. Keep the judgment calls;
  remove rate promises and arbitrary engagement thresholds unless internally
  sourced.
- Keep `$300/month` for Grok Bot, but name the qualifying SuperGrok Heavy tier
  and date the comparison. Do not imply every other eligible subscription costs
  the same.
- Describe Hermes as self-hostable. Do not promise that inbox content never
  leaves owned hardware unless the selected model and every connector are local.
- Preserve verified Replika and Tolan facts and date facts that will rot.

Put a compact `checked 20 august 2026` source drawer at the end. It supports the
guide without turning chapters into footnote soup.

## Scout desk

The tracker becomes a named workspace rather than an embedded demo.

- Autosave on input with a short debounce, plus save immediately on blur and
  before page exit where the platform permits.
- Show one of four states: saved, saving, storage blocked and unsaved changes.
- Detect quota/security failures and explain exactly what to do.
- Export CSV and JSON backup. Import JSON with preview and explicit merge or
  replace choice.
- Delete uses an undo toast. It never destroys a row on one irreversible click.
- Every input and select has a programmatic label based on row and column.
- Add creator, export, import and delete meet the 24px target floor and work from
  the keyboard.
- Mobile uses creator cards by default; the comparison table remains available
  behind a `table view` toggle.
- Example data is unmistakably a demo and never mixes silently with real rows.

Progress and quiz state use the same guarded storage wrapper. If persistence is
blocked, the page works for the session and says that completion will not survive
a reload.

## Accessibility and interaction

- All ordinary text clears WCAG AA against the actual background. The pale paper
  cards inside night sections use dark ink, never inherited night text.
- Result explanations and copy/save status use polite live regions.
- Focus styles are visible in both paper and night sections.
- Standalone controls meet the 24px minimum target; primary actions aim for 44px.
- Motion is small and interruptible: progress ticks, answer reveal, undo toast and
  chapter arrival. Reduced motion removes translation and looping media autoplay.
- Videos never autoplay with sound. Captions and written equivalents remain
  available without playback.
- No horizontal overflow at 390px or 1366px.

## Gate polish

The scout door says `scout school` in its document title and visible heading.
Password errors remain on the page with focus moved to the error. The password
field has autocomplete metadata and the form keeps a clear submit state.

## Verification

- Unit-test route classification, media authentication, content types and cache
  headers before changing the worker.
- Unit-test tracker serialization, migration, import/merge, storage failures and
  undo before wiring the UI.
- Build the exact KV source and render it from `dist` plus a local worker where
  necessary.
- Inspect desktop and 390px mobile captures, including hero, each media type,
  every answer state, tracker cards/table, storage failure and undo.
- Measure contrast, tap targets, overflow and accessible names in rendered DOM.
- Test with media blocked and storage blocked.
- Claim the `scout` KV lock immediately before the first write, upload media and
  page under that lock, verify the live password gate and every bypass variant,
  then release it.
- Commit and push worker and test changes before final live verification so CI
  cannot overwrite the deployed worker behavior.

