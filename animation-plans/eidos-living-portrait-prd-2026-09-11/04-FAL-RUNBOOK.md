# Fal runbook and cost protection

## Default decision

Do not call Fal. The previous spend failed because video generation was used for interface states that must preserve exact art, respond to real data and stop on user input. The v3 system is natively composited from locked sources.

## The only permitted paid experiment

After the deterministic prototype passes visual review, Fal may audition an isolated dry-ink alpha texture if the mask edge still feels too digital.

Requirements:

- monochrome texture only;
- transparent background;
- no Faun, Gryphon, artwork, text, symbol or UI;
- 1024px square is sufficient;
- maximum four outputs;
- maximum total spend `$4`;
- fixed seeds and one output per call;
- every call logged in `spend.json`.

Composite the texture only inside the existing source mask. It must never change the mask geometry.

## Stop rules

- Stop immediately if the output contains recognizable imagery.
- Stop after two outputs fail the same material test.
- Do not buy video to solve composition, easing, crop or interface-state problems.
- Do not upscale a rejected idea.
- Do not spend merely because credit remains.

## Required log

```json
{
  "currency": "USD",
  "hard_total_cap": 4,
  "spent": 0,
  "calls": []
}
```

Each call records timestamp, endpoint, request ID, seed, input hash, output hash, dimensions, cost and a blunt accepted or rejected reason.
