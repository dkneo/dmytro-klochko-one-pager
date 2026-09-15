# 014 — Finish and fail with clarity

- **Status**: TODO
- **Commit**: `9474e4b`
- **Severity**: MEDIUM
- **Category**: state feedback, rare delight, error handling
- **Fal eligible**: no

## Session completion

Completion is the one place where the collection itself can become the spectacle.

### Concept

The thumbnails the user actually kept rearrange from the session rail into a small color-ordered moodboard. Faun remains as a static guide at one edge. Gryphon’s open circle traces only the occupied arc and remains visibly open. Nothing fictional is introduced.

### Timeline

1. `0–160ms`: controls recede through opacity; interaction remains available through the destination link.
2. `80–520ms`: kept thumbnails travel from their real session positions into the moodboard using FLIP transforms and 40ms stagger, maximum eight animated thumbnails.
3. `420–680ms`: remaining kept works appear directly in their final positions without travel.
4. `560–760ms`: a small Faun portrait and literal copy appear: `you kept {n} works · see the moodboard`.

No autoplay navigation. No confetti, particle shower, score, personality percentages or invented summary.

### Reduced motion

Show the finished moodboard and copy immediately through a 160ms opacity change.

## Image-load error

- Keep the paper mat and title visible.
- Stop all loader motion immediately.
- Show literal copy: `couldn’t load the painting` and a `retry` button.
- Retry returns to the artwork-derived loading state.
- Do not show a sad Faun or broken Gryphon.

## Verdict-write error

- Do not advance invisibly.
- Keep the session thumbnail or current card in place.
- Add a graphite offset edge of 2px and literal copy: `couldn’t save · retry`.
- Retry reuses the original verdict payload and removes the offset when confirmed.
- No shake animation. The user already understands an error from the copy and retained state.

## Empty session

If no works were kept, show Faun at rest beside: `nothing stayed this time · keep looking`. No animation is required.

## Acceptance

- Every moving thumbnail corresponds to a work the user actually kept.
- Completion cannot delay navigation.
- Errors never erase or contradict the user’s latest choice.
- A user understands every state from copy alone.
- No Fal-generated content is required.

