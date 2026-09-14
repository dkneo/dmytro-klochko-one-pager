# Eidos taste intelligence

## Product promise

Eidos helps one person discover visual art, understand why it stays with them,
follow the artists and ideas behind it, and watch a living portrait of their
taste become more precise. The artwork leads. Every explanation is traceable
to a judgment, a note, or a sourced fact.

## Boundaries

- Preserve every verdict, favorite, comparison, candidate, and vault note.
- Paintings, prints, and posters are the primary product.
- Words remain available in their own quiet room and outside the primary path.
- Never publish generated website art as collected artwork.
- Never infer a personal preference from a search query or a single answer.
- Never invent museum facts, movements, media, subjects, or locations.
- Keep the existing Faun and Gryphon art direction. Faun guides discovery;
  Gryphon keeps the archive.
- Fable owns motion and performance infrastructure on its separate branch.
  This branch owns product logic, information architecture, and data truth.

## Delivery sequence

### 1. Preserve and clean the taste ledger

- Plan imports from live verdicts without mutating KV.
- Collapse editions of the same work into one canonical artwork.
- Retain every original verdict id as provenance.
- Block records without a maker, source, or usable image instead of publishing
  incomplete attribution.
- Pull ready keeps into the vault and build their image derivatives.

### 2. Give every artwork a useful record

- Carry source, licence, favorite state, collection, city, dimensions, and the
  owner's own note from vault markdown into the product data.
- Add `/eidos/work/[id]` pages for collected visual works.
- Show the full uncropped work, factual record, personal note when one exists,
  related works by the same artist, and evidence-backed nearby works.
- Make moodboard plates open these records without losing the fast lightbox.

### 3. Replace random discovery with an explainable session

- Build a deterministic session planner from candidates, verdict history, the
  archive, artist coverage, and canonical work identity.
- A ten-work sitting contains deepen, contrast, bridge, stretch, and revisit
  positions only when the data supports them.
- Every card names why it is being shown in plain language.
- Artist diversity and duplicate prevention remain hard constraints.

### 4. Build living constellations

- Start with evidence sets, not personality scores: recurring artists,
  favorite works, repeated visual subjects, and repeated comparisons.
- A constellation remains proposed until the owner confirms, renames, merges,
  or rejects it.
- Never turn the eight weathers into percentages or public personality claims.
- Store constellation decisions append-only so the portrait can evolve without
  rewriting its own history.

### 5. Make the portrait useful

- Add `/eidos/portrait` as an evidence-backed view of what recurs, what is new,
  and what remains unresolved.
- Each observation opens the exact works behind it.
- Give the next discovery sitting a concrete learning intention based on a thin
  or uncertain part of the portrait.

### 6. Make the map literal

- `/eidos/map` becomes the museum geography of located works.
- Group works by city and institution; show status dates and uncertainty.
- Keep unlocated works visible as research needed, never guessed onto a map.
- Retire the abstract weather geometry from the primary product path.

### 7. Finish the product surface

- Primary doors: moodboard, discover, portrait, map.
- The moodboard keeps its default chromatic flow and visible museum labels.
- Validate desktop first, then mobile, then tablet.
- Merge Fable's reviewed motion foundation after product behavior is stable.
- Build, run the complete suite, inspect rendered `dist`, and ship only through
  `scripts/ship.sh` after the branch is approved.

## Acceptance

- Every live verdict remains addressable after migration.
- No canonical artwork appears twice in the moodboard or discover queue.
- No unattributed artwork is silently published.
- Every recommendation explains itself from real evidence.
- Every portrait statement opens its evidence.
- All artwork facts point to a source or are clearly marked unknown.
- No horizontal overflow at 390px or 1366px; controls remain at least 24px.
- Existing public routes keep working or redirect deliberately.

