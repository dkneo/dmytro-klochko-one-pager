# Eidos Product Rebrand: Design Specification

**Date:** 2026-09-08  
**Status:** proposed for Dmytro's review  
**Scope:** `/eidos`, `/eidos/inbox`, their secondary views, and the bridge to a future standalone product

## Design read

A public self-discovery product expressed as an archaic-future naturalist's field guide. It should feel tender, curious, collectible, and unusually alive. It must not feel like a museum database, a personality quiz, a generic swipe app, a Roman luxury brand, or an AI mascot product.

The first release is Dmytro's own living taste portrait. It proves the product by being a compelling object in its own right. The next release lets other people discover and publish their own.

Design dials:

- Design variance: 8/10
- Motion intensity: 6/10
- Visual density: 4/10
- Reading tone: intimate, direct, observant
- Interface tone: tactile editorial object with precise modern controls

## The problem with the current experience

The current Eidos contains valuable material and strong machinery, but it presents several different products at once:

1. `/eidos` is a complete public archive of 99 shelved things.
2. `/eidos/inbox` is Dmytro's private collection and annotation tool.
3. `/eidos/deck` is an early consumer taste quiz.
4. `/eidos/map` is both a public visualization and a private teaching surface.
5. `/eidos/orbit` repeats the map in a less readable form.
6. `/eidos/embed` is a shareable statistical portrait.

The result explains the database before it communicates the idea. A new visitor sees counts, forms, rooms, maps, filters, and Greek etymology before they understand the simple promise: what you choose reveals a shape, and that shape can become a public portrait of you.

The redesign must turn the existing archive and curation machinery into one legible product story without weakening the underlying vault.

## Product frame

### One-sentence promise

Keep what pulls you in. Over time, it becomes a portrait of your taste.

### What the first release is

Dmytro's public profile is the product demonstration. It combines paintings, poems, songs, films, people, objects, buildings, posters, and links into a living cultural portrait. It says what he returns to, shows the evidence, and invites exploration.

The page should make a visitor think three things in order:

1. I understand this immediately.
2. I want to explore Dmytro's taste.
3. I would like a version of this for myself.

### What the next release becomes

A person discovers culture through a finite, enjoyable stream of choices. The product learns from explicit keeps and passes, optional notes, comparisons, and revisits. It produces:

- a public taste profile
- changing archetype titles that remain grounded in choices
- a readable summary of recurring attractions and tensions
- collections across media
- recommendations with visible reasons
- social objects worth sharing without reducing taste to a score

### Naming boundary

Faun is the guide, not the product name. Gryphon is the archivist, not the product name.

The product name must make discovery, taste, or self-portrait legible without explanation. The existing `eidos` route, KV keys, API paths, and build scripts remain as internal infrastructure during the first redesign. The public name and final route are a release gate, not a prerequisite for designing the experience. This prevents a cosmetic string replacement from becoming a risky data migration.

## The product's cast

### Faun: the guide

Faun appears at thresholds, moments of curiosity, and moments when the product reflects something back. Faun can invite, wait, notice, wonder, and celebrate. Faun never lectures, scores, nags, or becomes a floating chatbot.

Primary placements:

- hero illustration
- first-run invitation
- loading or thinking state
- the moment a new thread in the portrait becomes visible
- empty states that need warmth

### Gryphon: the archivist

Gryphon appears around provenance, filing, retrieval, and durable records. Gryphon can stamp, carry, guard, index, and return. Gryphon never acts like a security mascot or corporate badge.

Primary placements:

- source and attribution drawer
- saved-to-profile confirmation
- archive and collection headers
- import and sync states
- private curator controls

### Relationship

Faun helps you notice. Gryphon helps you keep. They should rarely appear together outside the hero, onboarding, and major completion moments.

## Information architecture

The experience has four concepts. Only two are primary.

### 1. Portrait

The public, shareable expression of a person's taste. This is the new `/eidos` front door.

### 2. Discover

The card experience through which a person makes choices. In the current personal release, the private inbox is the working version of this experience. In the later product release, discovery becomes public and user-specific.

### 3. Collection

The browsable evidence behind the portrait. It contains the full archive and its filters. It is part of the profile, but it is not the first screen.

### 4. Atlas

The optional spatial view of relationships, currently `/eidos/map`. It is a deeper lens for interested visitors and a useful teaching tool for Dmytro. It must not be necessary to understand the product.

### Route plan for the personal release

| Route | Role after redesign | Visibility |
|---|---|---|
| `/eidos` | Dmytro's portrait, highlights, collection, and product premise | shareable, unlisted from the main foyer |
| `/eidos/inbox` | private discovery and curation studio | gated |
| `/eidos/map` | optional atlas and advanced placement tool | unlisted secondary view |
| `/eidos/embed` | compact shareable portrait card | unlisted utility |
| `/eidos/deck` | legacy prototype redirected to the new discovery entry when that entry exists | retired after parity |
| `/eidos/orbit` | redirect to the atlas after its useful interactions are accounted for | retired |

The main dmklochko.com header does not gain an Eidos link. Inside the product, the inherited site header is replaced by a small product header so the experience feels like a coherent standalone world.

### Future standalone route model

The route structure should be able to become:

- `/@dmytro` for a public profile
- `/discover` for the personal discovery stream
- `/collection` for the person's archive
- `/atlas` for relationships
- `/settings` for privacy, imports, and exports

This future structure informs component boundaries now, but it is not built in the personal release.

## Navigation model

### Product header

The product header contains:

- the eventual product wordmark
- `portrait`
- `collection`
- `atlas`
- a restrained `make yours` affordance in the personal release
- `dmytro klochko ↗` as the route back to the parent site

On `/eidos/inbox`, the header becomes a workbench header:

- `incoming`
- `kept`
- `passed`
- `archive`
- current sync or save state

The private header never leaks into the public profile. The public header never exposes studio controls.

### Mobile navigation

Use a compact top bar with the wordmark and one menu button. The menu opens a native-feeling sheet with the same destinations. Do not use a permanent bottom tab bar for the personal release because the experience is still mostly a single profile page, not a multi-tab app.

## `/eidos`: the public portrait

### Page job

Show Dmytro's cultural taste as an intelligible, desirable portrait, then let a visitor enter the evidence without facing the entire archive at once.

### Opening frame

Use a 65 to 75svh desktop hero rather than a full marketing viewport. The approved Faun and Gryphon illustration occupies roughly two thirds of the visual field. The copy occupies the remaining third without covering the characters.

Proposed working copy:

> a living portrait, made from choices
>
> # what i love, and what it says about me.
>
> i keep paintings, poems, films, songs, people and objects. the patterns become a portrait. this one is mine. later, you can make yours.

Primary action: `enter my collection`  
Secondary action: `how it works`

The final public product name replaces the kicker or wordmark, not this explanatory promise.

### Hero behavior

- The static master ships first and is complete without motion.
- The eventual ambient hero loop replaces only the illustration layer, never the layout.
- Faun is still or gently breathing. Gryphon is alert but not theatrical.
- The pink circle may drift or breathe subtly. It remains the composition's anchor.
- Copy is always readable without a scrim that turns the page into a dark panel.
- Reduced motion receives the static master.
- Data saver receives the static master.

### Section 1: the reading

Replace the current long computed paragraph and dashboard-like counts with a short, human portrait grounded in the same vault data.

Structure:

1. A changing title derived from observed patterns, presented as a hypothesis rather than a diagnosis.
2. Two short paragraphs that explain the strongest recurring attraction and one productive tension.
3. A strip of six to eight representative works that act as evidence.
4. A quiet link: `why this reading` opens a drawer showing the exact works and signals behind each statement.

The reading must never claim personality, politics, mental health, or biography from taste. It describes choices, visual patterns, makers, media, and recurrence.

The current counts remain available as small archival metadata near the end of the profile, not as the opening argument.

### Section 2: the pulls

Show three to five recurring pulls. Each pull is a human phrase, not a chart axis. Examples of the grammar:

- quiet things with a charged edge
- human figures that keep their distance
- warmth that arrives through restraint
- objects that feel used, not styled

Each pull includes:

- one large anchor work
- two or three supporting fragments
- a one-sentence observation
- a route into the relevant collection slice

These phrases must be derived from real records. The examples above define the voice only.

### Section 3: the field

Translate the eight weathers into a tactile horizontal field index. Preserve the existing names, palettes, and cold-to-warm order, but do not make visitors read eight repeated room introductions.

Interaction:

- hover or focus previews three representative marks
- selection filters the collection below
- the active weather remains visible while scrolling its collection slice
- a `show all` control clears the weather

The weather system remains Dmytro's distinctive taxonomy. It becomes a lens instead of the page's entire skeleton.

### Section 4: the collection

Show one mixed-media collection, not separate long walls for pictures, words, and reads.

Default order is editorial and varied:

- avoid adjacent items of the same form, maker, host, or era where possible
- preserve every picture's natural aspect ratio
- let words occupy deliberate typographic cards
- give songs, people, objects, and links their own honest forms
- never fake thumbnails for things that do not have them

Controls:

- weather
- form
- maker search
- `surprise me`

The first view shows 18 to 24 items. `keep exploring` reveals the next group without a route change. The complete archive remains reachable and countable, but the page does not front-load all 99 items.

### Section 5: traces

End with a compact view of recurrence:

- makers returned to more than once
- languages
- earliest and latest works
- forms currently underrepresented
- unfiled items, visible only if useful to the story

This is where the archivist voice and Gryphon belong. It replaces the current prominent statistics with a quieter record.

### Section 6: make yours

The personal release ends with a product promise, not a fake signup funnel.

Copy direction:

> this is mine. yours would look different.
>
> keep what stops you. leave what does not. over time, the pattern becomes a portrait you can share.

The call to action can initially open the legacy deck as a short demonstration. It must clearly say that the complete personal product is in development. Do not collect email unless there is a real follow-up system.

## `/eidos/inbox`: discovery and curation studio

### Page job

Make high-volume judging fast and pleasurable while preserving notes, provenance, keyboard control, undo, and server-truth verdicts.

The page should feel like the working side of the same product, not a separate dark utility assembled from another design system.

### Entry and gate

The gate becomes one centered paper folio with the Gryphon archivist mark. It explains only what is necessary:

> the archive is private. open it to continue.

The password, submit action, and alternate-tab recovery remain. Errors appear in place. No decorative background competes with the field.

### Desktop workbench

Use a wide stage with a maximum width around 80rem and three functional regions:

1. **Incoming rail:** progress, current content mix, and source queue.
2. **The card:** the thing itself, given most of the space.
3. **Field note:** Dmytro's note, filing information, attribution, and advanced details.

The card and note should still read as a two-page field folio, but the proportions respond to the content:

- visual work: 62/38
- article or link: 54/46
- poem or quote: 50/50
- portrait media remains portrait, with the surrounding paper shrinking to the necessary mat rather than producing a large empty rectangle

The stage uses paper, graphite, olive, salmon, raspberry, tobacco, and the pink circle accent. No cyan, teal, blue mythic character, blurred wallpaper, glass panel, or generic glowing input.

### The card

Every content type receives a purpose-built face.

**Visual work**

- full, uncropped image within available height
- title, maker, date, institution, source
- optional immediate note

**Poem or quote**

- English and original language with clear hierarchy
- maker, source, year, translator
- no fake image

**Song**

- title, artist, year, source
- optional album art only when the real source provides it
- playback is not implied unless playback actually exists

**Link**

- real source image when available
- title, site, author, summary, source URL
- Dmytro's note remains visually separate from the fetched summary

### Judging interaction

Keep all current input methods:

- drag right to keep
- drag left to pass
- arrow keys and `h`/`l`
- visible buttons
- undo and `cmd+z`
- direct source opening
- note field and `cmd+enter`

Improve their expression:

- the card follows the pointer with slight rotation and resistance
- the page underneath reveals salmon for keep and graphite for pass
- threshold feedback arrives through color, label, and a small physical snap
- release beyond threshold completes the throw
- release before threshold returns with an interruptible spring
- the next card is already visible as a thin paper edge
- only the current and next two cards are mounted

The generated save and pass animations may accompany the result, but they do not replace direct manipulation. Input response stays code-driven and immediate.

### Field note behavior

- autosave the draft locally as it is typed
- show `saved locally`, `saving`, `saved`, or `could not save`
- verdict submission includes the current note exactly as it does now
- `escape` returns focus to the card
- the note leaf can collapse for rapid binary judging
- the advanced metadata drawer is collapsed by default

### Throw in a link

Move the composer into an `add something` action in the incoming rail. Opening it reveals:

- one URL field
- the result of the fetch before it enters the queue
- clear failure reasons
- `add to incoming`

The product should not imply that it understands a link until the title, source, image, and summary have actually arrived.

### Queue and history

The current page says how many items remain but gives no usable sense of history. Add a small session trail:

- last five verdicts
- thumbnail or glyph
- keep or pass
- note indicator
- undo on the most recent item only

This is not a permanent analytics dashboard. Durable history belongs to the archive.

### Mobile studio

The card occupies the viewport above a fixed action shelf. Metadata and the note live in a bottom sheet opened by `note` or by pulling the page edge upward.

- visual works remain uncropped
- text works scroll inside their own reading surface only when necessary
- swipe remains primary
- buttons remain at least 44px on mobile
- source, note, undo, and progress remain reachable with one thumb
- no desktop side rail is squeezed into a narrow layout

## The atlas

`/eidos/map` survives because it has a distinct job: showing relationships and teaching placement. It is not a competing home page.

The redesign should:

- use the paper field-guide palette
- open with a one-sentence explanation and the map itself
- move `ask it` and `teach it` into explicit secondary modes
- separate public exploration from private writes
- keep filters and direct mark inspection
- preserve the visible unfiled ring
- offer a readable list fallback

`/eidos/orbit` is retired. Any unique zoom, hover, or relationship behavior worth keeping moves to the atlas first. Then `/eidos/orbit` redirects to `/eidos/map`.

## Visual system

### Core composition

- warm fibrous paper as the main ground
- graphite or carbon-black Faun
- olive-khaki, salmon, raspberry, tobacco, and small orange accents for the Gryphon and system marks
- one large open pink circle as a recurring compositional device
- no hard rectangular frame around the primary illustration
- edges may tear, misregister, smudge, or reveal paper
- imagery stays materially imperfect while controls stay geometrically precise

### Color tokens

Initial product tokens, subject to contrast measurement against their actual backgrounds:

| Token | Value | Use |
|---|---:|---|
| paper | `#f2e2c9` | primary ground |
| ink | `#292723` | text and Faun |
| archive olive | `#777443` | Gryphon core and archival states |
| salmon | `#dc6a63` | keeps, warmth, emphasis |
| raspberry | `#a8425d` | deeper accent and active states |
| tobacco | `#60412f` | rules, provenance, secondary ink |
| circle pink | `#ff9bc0` | signature circle and focus accent |
| index orange | `#ff5f24` | rare index marks and alerts |

Avoid teal, electric blue, mythic cyan, violet SaaS gradients, green success UI, and black luxury-brand backgrounds.

### Type

Use three voices only:

1. A sharp modern grotesk for the product wordmark, actions, and large declarative titles.
2. A literary serif for readings, poems, and reflective copy.
3. A restrained typewriter or monospaced face for provenance, field labels, counts, and controls.

Handwritten marks appear only as sparse annotations in prepared assets. Do not render core interface copy in a decorative handwriting font.

### Shapes

- paper sheets and images may have 0 to 3px corners
- controls may use small precise corners
- avoid a page full of rounded cards and pills
- the open circle is a composition, not a button container
- dividers resemble index rules, registration marks, or paper folds rather than generic one-pixel dashboard borders

### Images

- preserve natural aspect ratios
- never crop a face, artwork, or original frame to satisfy a grid
- use object-fit `contain` for primary viewing
- use deliberate editorial crops only for small previews and only when the subject survives
- declare width and height in markup
- keep responsive derivatives and sharpness checks

## Motion system

Motion has four purposes only: invite, orient, confirm, and reveal relationship.

### Ambient motion from Fal

- hero breath or circle drift
- faint paper or ink life in the background
- Faun waiting or noticing
- Gryphon indexing or stamping

### Microinteractions from Fal

- generation or long fetch loader
- opening a new card
- save to profile
- pass or deny
- profile receives a new mark
- major completion or portrait reveal

### Code-driven interaction

- drag and swipe
- card return spring
- keyboard focus movement
- drawers and sheets
- filter transitions
- collection reflow
- progress movement

### Motion rules

- no loop may compete with reading
- no ambient loop above 8 to 12 seconds should have an obvious reset
- action feedback begins within 100ms
- layout transitions should usually complete within 220 to 420ms
- generated confirmation clips must never block the next action
- all motion has a reduced-motion equivalent
- animation slots reserve dimensions before media loads

## Data and system architecture

### Preserve now

- the vault remains canonical
- `map-build.mjs` remains the source of the public map payload
- `eidos:verdicts`, `eidos:bookmarks`, `eidos:placed`, `eidos:pairs`, and portrait records remain unchanged
- `/api/eidos/*` remains the internal API namespace
- `eidos-pull.mjs` remains the bridge from keeps to vault notes
- all existing attribution and local-image safeguards remain

### Add

Create one derived view-model layer that converts the raw map into product-facing concepts:

- representative works
- recurring pulls
- profile summary evidence
- editorial collection order
- maker recurrence
- form and weather slices
- archival counts

This layer must be pure and testable. It may not write to the vault or guess missing data.

### Separate public and private state

Public profile pages read compiled static data. Private curation routes read and write through the existing gated worker endpoints. No public component imports a write endpoint or ships curator controls.

### Naming migration later

When the public product name is chosen:

1. add the new route as the canonical public URL
2. keep `/eidos` as a redirect
3. preserve API and KV names through at least one stable release
4. update OG, embed, canonical tags, and internal links
5. migrate internal names only if there is a concrete maintenance benefit

## States that must be designed

### Public portrait

- complete profile
- small profile with few choices
- empty profile
- one dominant medium
- no images
- long translated poem
- missing source image
- loading ambient media
- static or reduced-motion mode

### Discovery studio

- locked gate
- checking access
- queue loading
- active visual card
- active word card
- active link card
- dragging below threshold
- dragging beyond keep threshold
- dragging beyond pass threshold
- submitting verdict
- undo available
- queue empty
- image failed
- network failed
- local note saved but server save failed
- link fetching
- link fetch failed

## Accessibility and performance floors

- text contrast is at least 4.5:1 against the actual paper or image treatment
- desktop focus states are always visible
- standalone targets are at least 24px, and mobile action targets are at least 44px
- all gestures have button and keyboard equivalents
- the reading order remains logical without CSS
- generated motion never contains required text
- no horizontal overflow at 390px or 1366px
- no auto-playing audio
- initial public profile should not require the entire collection or any generated animation to become readable
- only the active and next two discovery cards load primary media
- images declare intrinsic dimensions

## What is deliberately removed

- Greek etymology as the opening explanation
- all 99 items before the visitor understands the profile
- dashboard counts as the central portrait
- separate long picture, word, and read corridors on the front page
- the orbit as a separate competing visualization
- blurred candidate artwork as the entire inbox background
- cyan and blue character treatments
- glowing SaaS-style input decoration
- generic rounded cards and excessive pills
- personality claims unsupported by choices

Nothing is deleted from the vault. The archive changes presentation, not truth.

## Delivery sequence

### Phase 0: naming and copy lock

- choose the public product name
- choose the temporary route alias if one is needed before the new domain
- approve the hero promise and navigation labels
- approve the Faun and Gryphon roles

This phase does not block component architecture. It blocks canonical URL and final OG work.

### Phase 1: foundation and desktop shell

- introduce product-specific tokens and typography
- create the product header and paper ground
- add the static hero assets with stable motion slots
- build the shared card, folio, provenance, and drawer primitives
- keep the existing data and APIs untouched
- publish desktop for review

### Phase 2: desktop public portrait

- replace the current front door with the new hero
- build the evidence-backed reading
- build recurring pulls
- build the weather field index
- build the mixed collection with progressive reveal
- build traces and make-yours ending
- update compact embed
- publish desktop for review

### Phase 3: desktop discovery studio

- redesign the gate
- build the wide workbench
- create content-specific card faces
- preserve and polish every current input method
- add local note draft status and session trail
- move link intake into the incoming rail
- publish desktop for review

### Phase 4: atlas and route cleanup

- restyle and simplify the atlas
- separate public viewing from private teaching
- move any unique orbit behavior worth preserving
- redirect orbit
- redirect the legacy deck after discovery parity exists
- publish desktop for review

### Phase 5: mobile

- adapt the public profile to a single reading column
- use the dedicated mobile hero asset
- build the mobile discovery card and note sheet
- measure overflow and tap targets in a real 390px viewport
- publish mobile fixes

### Phase 6: tablet

- tune intermediate breakpoints after desktop and mobile are stable
- verify portrait/landscape rotation and card proportions
- publish tablet fixes

### Phase 7: motion integration

- review every Fal output before use
- place ambient loops in reserved slots
- add generated confirmation moments without delaying input
- implement code-driven drag, filters, sheets, and transitions
- audit reduced motion and data saver behavior
- publish the completed motion layer

### Phase 8: standalone product

- create user accounts, privacy controls, and public profile routes
- replace the private shared-password model for user data
- add personal discovery state and recommendations
- support new media types only when their metadata and source rules are real
- move to the new domain

## Meaningful commit sequence

The implementation should use small commits that correspond to real reviewable changes:

1. `eidos: establish the product shell and paper tokens`
2. `eidos: give the portrait a clear opening promise`
3. `eidos: derive the reading from visible evidence`
4. `eidos: turn eight rooms into one field index`
5. `eidos: make the collection mixed, finite and expandable`
6. `inbox: rebuild the card as a responsive field folio`
7. `inbox: preserve notes, keys, undo and server truth`
8. `inbox: add session history and honest link intake`
9. `atlas: keep the useful map and retire the duplicate orbit`
10. `eidos: make the portrait and studio work at 390px`
11. `eidos: reserve and integrate the Faun and Gryphon motion`
12. `eidos: finish the share card, embed and route migration`

Each commit must build and pass the relevant tests. Commits are for coherent work, not artificial GitHub activity.

## Verification plan

### Structural

- every vault item appears in exactly one collection or archival state
- every portrait statement points to real evidence
- public pages contain no write endpoint or private controls
- existing verdict, note, undo, bookmark, placement, pair, and portrait API contracts remain covered
- old routes redirect only after feature parity is verified

### Visual

- inspect desktop from built `dist/` at 1440x900 and 1366x768
- publish desktop and review the live page after CI
- inspect mobile through a real 390px iframe and measure overflow before trusting a headless capture
- publish mobile fixes and review live
- inspect tablet only after desktop and mobile approval
- check natural media ratios, declared dimensions, and missing-image states

### Interaction

- pointer, keyboard, and buttons produce the same verdict
- a held key cannot submit twice
- a drag under threshold returns cleanly
- a drag over threshold cannot count twice
- undo restores the correct card and note
- local note recovery survives refresh
- link intake never claims success before metadata is present
- reduced motion preserves every state change

### Performance

- compare initial bytes and LCP with the current `/eidos`
- verify that the hero static asset is the initial visual
- verify that ambient motion is deferred or skipped by preference and connection
- verify that only three discovery cards load primary media
- verify responsive derivatives for every public image

## Approval decisions

Execution can begin when Dmytro approves these five decisions:

1. `/eidos` becomes a product-shaped personal portrait, not a complete archive on first paint.
2. `inbox` remains private but becomes the product-grade discovery and curation studio.
3. the eight weathers remain, but become a lens and index rather than eight repeated page rooms.
4. `/eidos/orbit` is retired after any unique value moves to the atlas.
5. the new paper, Faun, Gryphon, open-circle system replaces the inherited dark dream skin inside Eidos.

