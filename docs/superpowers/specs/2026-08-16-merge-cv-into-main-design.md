# Merging /cv into the main page

**Date:** 2026-08-16 · **Status:** approved, implemented

## Problem

The two pages had converged: /cv was the superset and the better page. Keeping
both meant maintaining one story twice. But /cv at 7,552px was nine screens,
and a one-pager that long loses the reader it was built for.

## Where the length was

Measured at 1280px before any change:

| section | height | share |
| --- | --- | --- |
| experience | 3,468px | 46% |
| literally me | 821px | 11% |
| hero | 671px | 9% |
| background | 637px | 8% |
| how i work | 466px | 6% |
| say hi | 460px | 6% |
| alongside | 311px | 4% |
| poems | 302px | 4% |

Half the page was one column of roughly forty bullets. Nothing else was worth
cutting first.

## Options considered

1. **Expand per job** — replika keeps its spread; the five earlier jobs collapse
   to a row that opens. Nothing deleted. *Chosen.*
2. **Global short/full switch** — one control, shortest default, but the best
   material is invisible unless clicked, and it doubles the state matrix against
   the existing bebop/dream modes (four combinations to verify on every change).
3. **Cut instead of hide** — no interaction, but it costs material he asked for.

## Design

- `/` serves the former cv page. `/cv` and `/cv/` are 301 redirects to `/` via
  `public/_redirects`, so links already sent out keep working and there is no
  duplicate content.
- Jobs two through six are native `<details>`. No javascript is required to open
  them; keyboard and screen-reader behaviour is the platform's.
- Each `<summary>` carries mark, company, descriptor, role, **and the job's
  single strongest line** (`gist`), lifted out of `points` so opening never
  repeats what closing already said. A reader who never clicks still gets the
  argument.
- The affordance is `+ N more` / `− less`, counted from `points.length`.
- Entries with evidence keep their media rail; the grid moved from the `<li>` to
  the open panel, since the summary is always one column.
- Print: a `beforeprint` listener opens every row and `afterprint` restores
  exactly the ones it opened. `@media print` attempts the same in css, but
  `::details-content` is not portable yet, so the listener is the guarantee.
- `/writing`, its two pieces, and `/eidos` leave the footer and carry
  `<meta name="robots" content="noindex, follow">`. Deliberately *not* a
  robots.txt block: a disallowed url is never crawled, so the tag is never read
  and the bare url can still surface. The skyeng bullet keeps its in-context
  links to the translations, which are evidence rather than navigation.

## Result

7,552px → 6,211px closed (experience 3,468 → 2,298), everything one click away,
7,724px fully open.

## Verified

Open state and media rail at 1280; register at 390 with no horizontal overflow
(`scrollWidth === innerWidth === 390`); print hook opens 5/5 rows and restores to
1; no broken links or missing assets across ten pages; one en dash remains, inside
the verbatim manifesto quotation.
