# Eidos motion rebuild: read this first

- **Status**: production brief, ready for controlled audition
- **Commit audited**: `9474e4b`
- **Date**: 2026-09-11
- **Owner**: Dmytro Klochko
- **Production principle**: living print, not living character

## The blunt correction

The previous pack used generative video as if it were an interaction-design tool. It produced attractive still frames, unstable characters, unclear symbols and opaque little movies detached from the interface. The prompts said “preserve exactly,” but the pipeline never enforced preservation.

This pack reverses that mistake:

1. The painting or poster remains the protagonist.
2. Every interaction moves the real card, thumbnail, control or destination.
3. Faun appears sparingly as a guide and in the rare absolute-favorite ritual.
4. Gryphon signifies memory only when something is actually archived.
5. Fal may generate organic ink texture. It must not invent UI motion.
6. Locked artwork and character pixels are restored from the source during compositing.

## What Grokbot must deliver

Read every document before spending anything. Then deliver:

- one controlled hero ink overlay in desktop and mobile crops;
- one transparent dry-ink impact texture for the favorite ritual;
- one transparent paper-fiber/dust texture, if and only if it survives the QC gate;
- deterministic loader, card, swipe, keep, pass, favorite and error prototypes built from the supplied stills and real UI state;
- a six-frame contact sheet and a slowed 25% preview for every candidate;
- a manifest containing model, endpoint, seed, request ID, actual cost, source hash and rejection reason;
- final WebM plus MP4 fallbacks only after the audition gate passes.

## Spend gates

- **Gate A, auditions**: maximum **$4 total**. Two candidates per Fal-eligible asset, 720p or lower.
- **Gate B, finals**: maximum **$8 cumulative total**, including Gate A.
- Do not upscale, interpolate or generate extra variants before Dmytro selects a Gate A candidate.
- If two attempts violate a locked region, stop prompting. Use deterministic compositing.
- Never spend money generating pass, keep, card-arrival or loader videos. Those are runtime interactions.

## Execution order

1. Read `00-SELF-AUDIT.md` so the failure cannot repeat.
2. Read `01-MOTION-SYSTEM.md` for the shared grammar.
3. Read `02-REFERENCES.md` for the quality bar.
4. Follow `03-FAL-RUNBOOK.md` exactly.
5. Execute the PRDs in numerical order.
6. Apply `90-QC-SCORECARD.md` before presenting anything.
7. Use `GROKBOT-SINGLE-PROMPT.md` as the controlling instruction.

## Non-negotiable outcome

If a clip is beautiful without the interface but unclear inside the interface, it fails. If a frame alters Faun, Gryphon or an artwork outside the named motion mask, it fails. If a high-frequency action makes the user wait, it fails.

