# Eidos Visual Studio: Design Specification

**Date:** 2026-09-09
**Status:** approved in conversation
**Scope:** `/eidos`, `/eidos/inbox`, the Eidos share card, and a sourced visit layer

## Product decision

Eidos is a visual moodboard first. Paintings, prints, photographs, objects,
buildings and people belong in the current public experience. Poems, quotes,
songs and bookmarks remain intact in the vault and on `/eidos/words`, but do
not enter the studio queue or its intake surface for now.

Faun is the guide at discovery thresholds. Gryphon is the archivist around
provenance, favorites and physical location. They do not decorate every state.

## Immediate repairs

- Recompose the social card so no headline glyph can enter the artwork column.
- Replace the auto-playing character overlay on studio entry with a restrained,
  niche loading mark that communicates progress without covering the work.
- Remove the link composer, bookmark fetch, word cards and field-note surface
  from the studio. No held data is deleted.

## Studio

The studio has three verdicts: pass, keep, and absolute favorite. Favorite is
rare by presentation, not by an artificial quota. It uses the `f` key and a
distinct Gryphon archive mark.

The incoming queue is divided into plain visual media shelves: paintings,
prints and posters, objects and buildings, photography, and people. Selecting
a shelf changes only the unjudged visual queue. The default is all visuals.

After twelve keeps or favorites in one sitting, the studio may interrupt once
with a two-work comparison. The user picks which stays with them more or skips
the comparison. This records a pair choice; it never exposes a score.

## Moodboard

The public wall has three comprehensible arrangements:

- salon: the existing editorial mixed hang
- by color: a continuous pigment drift computed from each local plate
- favorites: only items explicitly marked `favorite` in the vault

Natural image ratios remain untouched. A physical-scale mode is available only
for works with verified dimensions. Unknown dimensions remain normal rather
than receiving invented sizes.

## Place and visits

Every visual detail may show a `collection` value when the vault has one. This
means institutional home or owner, not a claim that the work is currently on
display.

The visit layer starts as a sourced institution index. `on view now` appears
only when an authoritative museum source says so and carries a last-checked
date. A later city itinerary can use only those verified records. Missing
location data stays visibly unknown.

## Constraints

- No visual source is cropped to fit a card.
- No fabricated dimensions, collection, exhibition or location claims.
- No field notes or annotation requirement.
- No scores or personality diagnosis.
- No em dashes in visible prose.
- Desktop is verified and published before mobile changes.
- All behavior changes begin with a failing test.

