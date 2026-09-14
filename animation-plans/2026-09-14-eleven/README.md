# Eleven — the performance and motion plan for dmklochko.com

- **Written**: 14 Sep 2026, at commit `bb2e3f5`
- **Scope**: the homepage (`/`) and the eidos product (`/eidos`, `/eidos/inbox`, `/eidos/reads`, `/eidos/map`), with `/press` measured alongside
- **Rule for every plan**: performance may only go up, and nothing visible may get worse. Where a plan trades one for the other it says so in words, and the trade is the reader's to accept.
- **Method**: Lighthouse 12 (mobile + desktop, four pages), runtime probes in the browser (animations at rest, transfer by type, fonts, DOM, long tasks), four independent read-only audits against the eight-category playbook (purpose/frequency, easing/duration, physicality/origin, interruptibility, performance, accessibility, cohesion/tokens, missed opportunities), every finding re-read at its cited line before it became a plan.

## Where it stands, and where it has to be

| measure | now | done means |
| --- | --- | --- |
| Lighthouse performance, home (desktop / mobile) | 94 / 91 | ≥ 98 / ≥ 95 |
| Lighthouse performance, eidos (desktop / mobile) | 88 / 73 | ≥ 97 / ≥ 92 |
| Lighthouse performance, press · reads (mobile) | 91 · 95 | ≥ 95 · ≥ 97 |
| LCP, eidos mobile | 7.7 s | ≤ 2.5 s |
| CLS, home mobile | 0.065 | ≤ 0.01 |
| JavaScript on the homepage (gz) | 134 KB, of which three.js 129 KB | ≤ 20 KB |
| Main-thread script evaluation, home desktop | 837 ms | ≤ 150 ms |
| Render-blocking stylesheet requests | 2–3 per page | 0 |
| Infinite CSS animations at rest on `/` | 43 (16 of them invisible snow) | ≤ 15 in the fire act, 0 when the tab is hidden |
| Media cache TTL (fonts, video, images) | 0 s, must-revalidate | 1 y immutable / 1 y / 1 d + 30 d stale |
| Controls with press feedback on eidos | 0 | all of them |
| Hand-typed easing curves outside the token file | 16 | 0 |
| Keyboard-initiated actions that animate | reads room (4), skip link, two focus reveals | 0 |
| Reversible UI driven by `@keyframes` | 7 | 0 |
| Transitions on layout properties | 6 (+1 documented exception) | 0 (+1) |
| Reduced motion | kills every keyframe, keeps every movement | drops travel, keeps every opacity/colour feedback |
| Open/close events with no motion | lightbox, 2 dialogs, compass, deal, gate | 0 |
| Cross-page navigation | hard cut | 180 ms dissolve, wordmark still (where supported) |

The 11/10 is not a feeling; it is the right-hand column, all of it, plus the feel checks in each plan passing on a trackpad and on a phone.

## The plans

| # | title | severity | status |
| --- | --- | --- | --- |
| P01 | Retire three.js from the petal field; keep every petal | HIGH | TODO |
| P02 | Metric-matched fallbacks so type never shifts the page | HIGH | DONE |
| P03 | Inline the stylesheets so no request blocks first paint | MEDIUM | TODO |
| P04 | Cache the media that never changes | MEDIUM | DONE |
| P05 | Serve every picture at the size it is seen, in the format that costs least | HIGH | DONE |
| P06 | An ambient budget: pay only for motion that is on screen | HIGH | DONE |
| M01 | The reading room answers keys instantly, like discover already does | HIGH | DONE |
| M02 | A swipe that knows how fast the hand moved | HIGH | TODO |
| M03 | Every control answers the finger (and shows its focus) | HIGH | DONE |
| M04 | One motion vocabulary: tokens, curves, budgets | MEDIUM | DONE |
| M05 | Reversible things use transitions, not keyframes | MEDIUM | TODO |
| M06 | Only transform and opacity move | MEDIUM | TODO |
| M07 | Reduced motion keeps the feedback and drops only the travel | HIGH | DONE |
| M08 | Crossfades that do not double-expose; entrances that arrive one by one | MEDIUM | TODO |
| M09 | Things appear from where they came: the deal, the lightbox, the dialogs | MEDIUM | TODO |
| M10 | The rare moments get their delight budget | LOW–MEDIUM | TODO |
| M11 | Pages that change without a blink (native view transitions) | optional | TODO |

## Order, and why

1. **M04 first.** It creates the tokens (`--ease-out`, `--ease-in-out`, `--ease-drawer`, `--dur-fast`, `--dur-mid`) every later motion plan writes against. Half a day.
2. **P04, P03, P02** in one sitting: config and CSS only, no visual change, immediate Lighthouse gains. Verify with one Lighthouse run per page.
3. **P05** (pictures) and **P01** (petals) — the two big weights. Independent of each other; P01 is the harder one and the one that most changes the homepage's numbers.
4. **M01, M03, M07** — the three HIGH corrections that touch what the owner does a hundred times a day and what a reduced-motion visitor sees. M01 before M02.
5. **P06** and **M06** together: both are about what the compositor does at rest and during a deal.
6. **M05, M02, M08** — interruptibility and the gesture, then the crossfades.
7. **M09, M10** — the additive motion, only after everything above is green, so delight lands on a calm surface.
8. **M11** last, and only if the owner wants it; it is the one plan that adds motion between pages.

Dependencies: M02, M03, M05, M08, M09, M10, M11 use tokens from M04. M02 assumes M01's `onCancel` in the reading room. P06 assumes P01's renderer if P01 has landed (otherwise patch `petal-field.js:333` as written). M07 and M08 both touch the reduced-motion blocks; apply M07 first.

## The audit loop, so this is not one pass

After each group above, run all of it again and write the numbers into the table:

```bash
# performance, all four pages, both forms
for p in "/ home" "/eidos/ eidos" "/eidos/reads/ reads" "/press/ press"; do set -- $p; for f in mobile desktop; do
  npx lighthouse@12 "https://dmklochko.com$1" --quiet --output=json --output-path="lh/$2-$f.json" --only-categories=performance,accessibility $( [ $f = desktop ] && echo --preset=desktop ); done; done
# motion at rest, in the pane on /: document.getAnimations().length   (≤ 15; 0 with the tab hidden)
# suite
node --test tests/*.test.mjs
```

Then re-run the four category audits (the prompts are in the session that produced this plan; each is read-only and returns a findings table) and accept the work only when every audit returns an empty table for HIGH and MEDIUM. Two consecutive clean loops is the bar; one is a coincidence.

## Decided, and not planned

- **Moodboard plates stay 440 px.** Lighthouse flags them at 1× DPR; at 2× they are exactly right. Re-encoding would cost quality on every retina screen.
- **Fonts are not subset.** The library sets French, German, Polish, Japanese and Russian names and lines; a Latin subset would break glyphs the site is proud of. The metric-matched fallbacks (P02) remove the visible cost instead.
- **No SPA router.** The site's scripts expect full loads; M11 uses the browser's own cross-document transition instead.
- **Cloudflare Web Analytics beacon** (`static.cloudflareinsights.com`, 6 KB, third party) is injected by the Cloudflare account setting, not by the repo. Keep it if the numbers are read; switch it off in the dashboard if not. Either way it is not in this repo's power.
- **The three ambient tempos, the 0.9 s entrances, the 900 ms scene crossfade, the `.arw` hop on layout offsets, the `.gloss-note` popover, the easel's instant width** are all documented decisions in the code and stay as they are.

## Later, if wanted (LOW polish, exact values recorded so nobody has to re-audit)

- `.ep-nav a::after` underline from `scaleX(0)`: acceptable as a drawn rule; if changed, `clip-path: inset(0 100% 0 0)` → `inset(0)`.
- Loader proof line held at `scaleX(0)` for 234 ms: start at `scaleX(0.05)` with `opacity: 0` → 1.
- Atlas zoom limits: soft-clamp `limit + excess * 0.25` (in M06) — done there; here only the wheel-lag fix remains if M06 is split.
- `.em-tip` tooltip origin: `transform-origin: top center`, `translateY(-4px) scale(0.96)` → rest, 150 ms.
- `.in-edge` stamps riding the drag: in M02.
- Symmetric press/release on `eidos.css:799`, `dream.css:3089`, `dream.css:1654`: in M03.
