---
target: src/pages/index.astro
total_score: 19
max_score: 24
na_heuristics: 5,7,9,10
p0_count: 1
p1_count: 3
timestamp: 2026-08-07T16-03-51Z
slug: src-pages-index-astro
---
Method: dual-agent (A: a6a441a2949701e24 · B: a907ca6389e33f3f4)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | No active-section indicator while scrolling past 8 sections |
| 2 | Match System / Real World | 3 | Undefined jargon ("mau", "gtm") and untranslated aside ("sans voir") could snag journalist-type readers |
| 3 | User Control and Freedom | 3 | Mobile `<details>` nav has no Escape-to-close and stays open after a nav link is clicked (confirmed live) |
| 4 | Consistency and Standards | 3 | DESIGN.md admits the nav-dropdown/swatch shadows contradict the page's own no-shadow rule — detector independently flagged the same shadow as `gpt-thin-border-wide-shadow` |
| 5 | Error Prevention | n/a | Zero forms/destructive actions exist |
| 6 | Recognition Rather Than Recall | 4 | All nav/labels are text, nothing icon-only |
| 7 | Flexibility and Efficiency | n/a | Persuade/Experience surface, no repeat-task workflow |
| 8 | Aesthetic and Minimalist Design | 3 | Coherent aesthetic, but the shadow inconsistency and very tall sections keep it from feeling fully resolved |
| 9 | Error Recovery | n/a | No error states are reachable |
| 10 | Help and Documentation | n/a | Not needed for a linear scroll with no tasks |
| **Total** | | **19/24** | **Good (79%)** |

## Design Specificity Verdict

**LLM assessment**: Highly specific — verbatim biographical strings, a bespoke rotation-collage system, an inverted type-weight rule, and a single-accent-per-section system that's literally echoed as a swatch row later on. None of this is templated; the one mildly generic trope (pill nav toggle + arrow-link pattern) is used as connective tissue, not identity.

**Deterministic scan**: `detect.mjs` against all 7 markup files (index.astro + 5 components + layout) returned exit 0, zero findings — no structural/component-level anti-patterns. This corroborates the specificity verdict: nothing reads as boilerplate at the markup level.

**Browser overlay**: Console injection succeeded (42 anti-patterns reported by the mechanical detector, full breakdown below); the live-server used to serve the detector script was stopped afterward per protocol, so there's no persistent visible overlay left open in a tab right now — these are point-in-time console findings, not a standing visual overlay you can go look at.

## Where the two assessments agreed, disagreed, and diverged

- **Agreement — contrast**: Both independently measured WCAG AA failures on the same color tokens. LLM found 3 (ochre 2.27:1, muted 4.43:1, poem deep-rose 3.82:1); detector found 5, including two the LLM missed (personal-heading em `#bd6f94` at 2.8:1, olive `#717c4c` at 4.1:1). Detector caught more instances here — treat as one confirmed issue, expanded scope.
- **Agreement — shadow rule**: LLM flagged (via DESIGN.md's own admitted gap) that the nav-dropdown/swatch shadows contradict the site's stated no-shadow rule. Detector independently flagged the exact same element mechanically (`gpt-thin-border-wide-shadow`, 1 instance). Two independent methods landing on the same defect — high confidence this is real.
- **Detector caught, LLM missed**: `undersized-ui-text` (21 instances, labels under 11px), `cramped-padding` (4 full-bleed sections with no inset), `tight-leading` (3 instances). Most of these plausibly match DESIGN.md's own documented "Label Never Grows Rule" and full-bleed section language — likely mostly intentional, but flagged for awareness since legibility cost exists regardless of intent.
- **Likely false positive**: `extreme-negative-tracking` (2 instances) — DESIGN.md's own Don't-rule explicitly mandates negative tracking on display type; the detector can't read that intent.
- **LLM caught, detector structurally can't**: the press-section placeholder copy, the mobile emotional-recovery line being hidden, the mobile hero headline fragmenting to 5 lines, and the nav not closing on click — all copy/interaction/responsive-behavior issues outside a markup-pattern detector's reach.

## Overall Impression

A genuinely well-authored, specific design system executed with real discipline (verified live, not just in DESIGN.md) — the near-black background shift timed to the war-disclosure copy is the standout move. The gap is that the desktop-authored experience doesn't fully survive its own breakpoints: the mobile version silently drops the one line that makes the page's most vulnerable moment land as resilience rather than just misfortune, and a leftover internal note is still live in the one section built to carry outside credibility.

## What's Working

1. The near-black background shift timed precisely to the war-disclosure copy in `.about` — full-bleed color used as an authored emotional cue, not decoration.
2. Zero client JS with no loss of interactivity — mobile menu, hover, and focus states all run on pure CSS/native `<details>`, so there's no client state to lose on refresh or interrupted navigation.
3. Deliberate eager/lazy image-loading split (only the two most prominent hero photos are eager) — a real performance decision most one-pagers skip.

## Priority Issues

**[P0] Unresolved internal note shipped as live public copy in the highest-scrutiny section**
- **Why it matters**: "cph:dox 2026 (documentary on shared drive)" sits in `press + socials` — the section whose entire job is third-party credibility, for an audience PRODUCT.md benchmarks against Paul Graham/a16z-caliber taste. PRODUCT.md itself already flags this exact line as unresolved.
- **Fix**: Write the real sentence, or cut the line until it's ready.
- **Suggested command**: `/impeccable clarify`

**[P1] WCAG AA contrast failures on 5 confirmed color pairings (agreed by both assessments)**
- **Why it matters**: Hits exactly the page's most "felt" content — the two original poems (`#b24f81`/`#bd6f94` on `#e9e3e2`) and two section-emphasis words (`#cc9d5d`, `#717c4c` on paper) — plus small muted text throughout (`#737369`, 4.4:1).
- **Fix**: Darken the failing tokens or reserve them for large/bold-only contexts; darken poem text or lighten its section background.
- **Suggested command**: `/impeccable harden`

**[P1] Mobile drops the emotional-recovery line right after the page's most vulnerable disclosure**
- **Why it matters**: `.about-note { display: none }` at ≤900px hides "still curious. still moving. still making." while the war/poverty disclosure stays fully visible — on the device most shared links are actually opened on, per PRODUCT.md's own stated operating context.
- **Fix**: Reposition/restyle `.about-note` for mobile instead of hiding it.
- **Suggested command**: `/impeccable adapt`

**[P1] Mobile hero headline fragments to 5 lines; first readable sentence arrives after a full screen of scroll**
- **Why it matters**: `.hero-copy h1 { max-width: 11ch }` isn't relaxed at the 680px breakpoint, so the thesis statement breaks across 5 short lines and `.hero-notes` doesn't start until 927px down an 812px viewport — directly working against the stated "instant impression" job-to-be-done.
- **Fix**: Relax or remove the `11ch` cap at the small breakpoint.
- **Suggested command**: `/impeccable adapt`

**[P2] Shadow-rule inconsistency confirmed by both LLM review and detector**
- **Why it matters**: The nav-dropdown and color-swatch shadows are the only two conventional drop-shadows in a system that otherwise conveys depth purely through rotation/overlap — DESIGN.md already names this an unresolved gap, and the detector independently flagged the same element.
- **Fix**: Either convert both to the frame-not-shadow treatment used everywhere else, or deliberately extend real elevation to more UI chrome.
- **Suggested command**: `/impeccable polish`

## Persona Red Flags

**Jordan (Confused First-Timer)**: On a standard desktop viewport, the entire thesis headline is below the fold — first screen is masthead + 3 unlabeled photos + "say hi". "perso ref" nav label is undecodable shorthand before clicking. Hits undefined jargon ("mau", "gtm", "sans voir") with no gloss. Lands on the press-section placeholder with zero context.

**Riley (Deliberate Stress Tester)**: Finds the exact promise/reality gap they look for — an admitted unfinished note live in production copy. Opens mobile nav, taps a link, and confirms via DOM state that the panel stays open and re-covers the wordmark afterward. Otherwise finds the zero-client-JS approach genuinely robust to refresh/interruption.

**Casey (Distracted Mobile User)**: Both primary top-corner actions ("say hi" 34px, "menu" 36px) sit below the 44px touch-target guideline and outside the thumb zone. Must scroll past 981px of hero on an 812px viewport, with a 5-line-fragmented headline, before reaching the first sentence of context. Several photographic images ship as PNG rather than JPEG/WebP, adding unnecessary weight on a slow connection.

## Minor Observations

- `header` carries an implied `banner` role plus `aria-label="primary navigation"`, which reads oddly next to the nested `<nav aria-label="main menu">` — slightly confusing landmark labeling for screen readers.
- The 5 "favorite color" swatches convey color as pure visual information with no text alternative for which color is which.
- Those same 5 swatch colors are exactly the 5 section-accent colors used throughout the page — an unadvertised design-system easter egg nothing in the copy calls out.
- `rel="noreferrer"` is used consistently on all outbound links; `noopener` would be redundant so no action needed there.
- `prefers-reduced-motion` is correctly respected globally — easy to skip, and wasn't.

## Questions to Consider

- The mobile hero and the dropped reassurance line share one root cause — breakpoints reshaping desktop-authored decisions rather than a mobile-first pass. Worth a dedicated mobile pass rather than continuing to patch inherited constraints?
- The press-section placeholder is arguably the single biggest risk to the page's stated goal — if nothing else changes, is finishing that one sentence the highest-leverage fix available?
- The swatches-as-section-accents easter egg is currently invisible — would a one-word caption turn a hidden systemic detail into a moment of delight for exactly the design-literate audience this page targets?
