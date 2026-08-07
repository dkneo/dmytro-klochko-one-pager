# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary audience is a narrow, high-status crowd: VCs and scouts, "cool twitter" tech/culture figures, journalists, prospective hires, and business partners. They typically arrive via a shared link (social bio, intro, press follow-up) in the situation of quickly deciding "who is this person" before a meeting, interview, or follow. The job to be done is forming an instant impression of credibility and distinctiveness, not researching exhaustively.

## Product Purpose

A personal one-pager / link-in-bio that represents Dmytro as a person beyond his job title. It exists to make a specific, high-status audience react with "woah, he's SO cool actually" — combining a genuine art-and-technology polymath identity (poet, ex-child-prodigy, filmmaker, founder) with real professional credibility (CEO of Replika) so the impression lands as both distinctive and legitimate.

## Positioning

Where a typical founder bio page leads with metrics and logos, this page leads with an irreverent, poetic, specific personal history — verifiable childhood facts (blindfold chess champion, teenage war refugee, founder of a 700-audience student theatre) — and only afterward supplies the "serious" credentials (Replika's 42M+ users, Stanford/Harvard/Princeton research, a University of Vienna lectureship). The benchmark for "landing" is the taste level of Paul Graham, a16z founders/scouts, and the Collison brothers — sharp, unimpressed-by-default tech/culture readers. A generic founder-bio page could copy the credentials; it could not truthfully copy this specific life story married to that credibility, delivered in a deliberately lowercase, off-hand tone rather than a polished corporate voice.

## Operating Context

A single static route, no login or dashboard. Visited almost entirely via direct link shares (social bio links, intros, press follow-up) rather than organic search, and consumed in one sitting on desktop or mobile.

## Capabilities and Constraints

- Frontend-only: no database, auth, forms service, or other backend dependency (see README).
- Next.js + vinext, deployed as a Cloudflare Worker; strict TypeScript.
- An automated test (`tests/rendered-html.test.mjs`) asserts specific copy strings appear in the server-rendered HTML — structural copy changes need matching test updates.
- Images are pre-processed into `public/images`; raw reference material lives outside the tracked repo (`contents/`, gitignored).

## Brand Commitments

- Name renders lowercase in copy and logo: "dmytro klochko."
- Tied explicitly to Replika ("42m+ users worldwide, #1 ai friend") — must not misstate that positioning.
- Canonical links are the existing handles: X `@dkreplika`, Instagram `@dmytrotoday`, YouTube `@dmytroklochko`, LinkedIn `/in/heydmytro`, and a manifesto link to `replika.com/manifesto`.

## Evidence on Hand

Real, on-the-record facts: Donetsk upbringing and wartime displacement; childhood chess/theatre/music history; product-management and ML career history; Replika CEO role; research collaborations with Stanford, Harvard, and Princeton; a University of Vienna lectureship. Real assets: photos in `public/images`, two original poems written by him, and working external links (YouTube, Instagram posts, a Bloomberg video, LinkedIn, X).

Open item, not yet resolved: the press section currently reads "cph:dox 2026 (documentary on shared drive)" — this looks like an internal note rather than finished public copy.

Absence future work must not fill in: no testimonials, press logos beyond the one Bloomberg link, or quantified outcomes exist beyond what's listed above — do not fabricate any.

## Product Principles

1. Specific, verifiable personal history beats generic personal-branding claims.
2. Industry credibility (Replika's scale) is necessary but not sufficient alone — it must be paired with idiosyncratic taste and artistry to earn the "he's so cool" reaction.
3. Tone is deliberately irreverent, lowercase, and direct, calibrated for sharp, high-status tech/culture readers rather than a broad or corporate audience.
4. There is no functional conversion goal — success is impression and intrigue, not clicks, signups, or leads.
5. Copy is a living draft: free to tighten or rewrite, but never fabricate facts, credentials, or testimonials not already evidenced.
