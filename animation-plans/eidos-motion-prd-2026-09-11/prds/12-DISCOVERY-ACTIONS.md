# 012 — Make discovery motion belong to the artwork

- **Status**: TODO
- **Commit**: `9474e4b`
- **Severity**: HIGH
- **Category**: physicality, frequency, interruptibility
- **Fal eligible**: no

## Purpose

Keep, pass and next are the highest-frequency actions in Studio. They must feel immediate, physical and obvious. They do not earn mascot cutaways, decorative ink clouds or prerecorded reactions.

## Card stack

- The next real artwork is already rendered beneath the active card.
- The lower sheet is offset 8px right and 8px down, rotated `0.8deg`, with a subdued olive paper edge.
- Removing the active card reveals the real next artwork. Never play an “open next card” movie.
- The painting fills the available stage with `object-fit: contain`; no crop is introduced by motion.

## Direct swipe

### While dragging

- Horizontal translation follows the pointer 1:1.
- Rotation is `clamp(-4deg, dx / cardWidth * 8deg, 4deg)`.
- Vertical movement remains 0.
- Keep cue appears at the card’s right paper edge; pass cue appears at its left paper edge.
- Cue opacity equals normalized commitment progress from 0.35 to 1.0 of threshold.
- The cue uses the current artwork’s sampled dominant color mixed with raspberry for keep and graphite for pass.
- No shadow growth, blur or scale.

### Commit threshold

Commit when either is true:

- distance exceeds 18% of card width; or
- horizontal release velocity exceeds `0.11 px/ms` after at least 45px movement.

At threshold crossing, compress the relevant edge cue to `scale(0.97)` for 100ms. This is the only discrete feedback before release.

### Release above threshold

- Carry current velocity.
- Exit in the chosen direction over 180–220ms with `cubic-bezier(0.23, 1, 0.32, 1)`.
- Cap exit rotation at 6deg.
- Permit the next card immediately after state persistence begins; never wait for a video.

### Release below threshold

- Return from the current transform using spring `{ duration: 0.5, bounce: 0.2 }`.
- The spring is interruptible; grabbing again retargets from the current position.

## Keep

The action communicates filing, not praise.

1. Card exits right.
2. A 32–44px clone of the actual artwork thumbnail appears in the session rail at the moment the persistence request begins.
3. The thumbnail settles from `translateY(6px) scale(0.97)` to rest over 160ms with strong ease-out.
4. If persistence fails, the thumbnail receives an error edge and exposes retry. It does not disappear silently.

No Faun, Gryphon, check mark, heart, confetti, particles or separate animation video.

## Pass

The action means only “show me another.”

1. Card exits left.
2. Nothing flies out of it.
3. Nothing is left behind.
4. The next artwork is immediately ready.

No X, trash icon, blotch, smoke, feather or emotional character reaction.

## Button and keyboard behavior

- Button press: `scale(0.97)` over 120ms, then immediate state update.
- Keyboard shortcuts: no ornamental transition. Replace the active item immediately, retain a persistent session record and announce it to assistive technology.
- Never play the pointer-release choreography for a keyboard action.

## Next card arrival

There is no standalone arrival animation. The next card exists physically underneath. If data is not ready, it shows the artwork-derived loader from PRD 011 in that same location.

## Reduced motion

- No translation or rotation.
- Current card changes through a 120ms opacity transition.
- Keep still adds the real thumbnail to the session rail.
- Pass still advances immediately.

## Acceptance

- A swipe can be interrupted and reversed without a jump.
- Direction and destination remain obvious with all text removed.
- Spamming keyboard shortcuts never queues animation.
- The next painting is visible within 220ms of pointer release and immediately for keyboard.
- No video decode occurs during keep, pass or next.
- At 390px, effects never leave a persistent strip outside the viewport.

## Boundaries

- Do not alter candidate data, verdict storage or artwork ordering.
- Do not add a motion library solely for these interactions.
- Do not use Fal.

