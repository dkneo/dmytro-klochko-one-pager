# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary audience is a narrow, high-status crowd: VCs and scouts, "cool twitter" tech/culture figures, journalists, prospective hires, and business partners. They typically arrive via a shared link (social bio, intro, press follow-up) in the situation of quickly deciding "who is this person" before a meeting, interview, or follow. The job to be done is forming an instant impression of credibility and distinctiveness, not researching exhaustively.

## Product Purpose

A personal foyer that represents Dmytro as a person beyond his job title. It exists to make a specific, high-status audience react with "woah, he's SO cool actually" — combining a genuine art-and-technology polymath identity (poet, ex-child-prodigy, filmmaker, founder) with real professional credibility (CEO of Replika) so the impression lands as both distinctive and legitimate.

The public map is small on purpose: homepage, learning, press, say hi. Extra rooms (writing, eidos, today, taste, basho, hokku, pond, dance, and the studio tooling) stay in the repo as hidden rooms. They are reachable by url and kept out of public nav and the sitemap.

## Positioning

Where a typical founder bio page leads with metrics and logos, this page leads with an irreverent, poetic, specific personal history — verifiable childhood facts (blindfold chess champion, teenage war refugee, founder of a 700-audience student theatre) — and only afterward supplies the "serious" credentials (Replika's 42M+ users, Stanford/Harvard/Princeton research, a University of Vienna lectureship). The benchmark for "landing" is the taste level of Paul Graham, a16z founders/scouts, and the Collison brothers — sharp, unimpressed-by-default tech/culture readers. A generic founder-bio page could copy the credentials; it could not truthfully copy this specific life story married to that credibility, delivered in a deliberately lowercase, off-hand tone rather than a polished corporate voice.

## Operating Context

Astro static build, deployed on Cloudflare Workers with a small worker for gated studio routes. Visited almost entirely via direct link shares (social bio links, intros, press follow-up) rather than organic search, and consumed in one sitting on desktop or mobile. Hidden rooms are unlisted: they stay out of the sitemap and public nav even when the files still build.

## Capabilities and Constraints

- Frontend-only for the foyer: no database, auth, or forms service on the public pages (see README).
- Astro, deployed as a Cloudflare Worker; strict TypeScript.
- An automated test (`tests/rendered-html.test.mjs`) asserts specific copy strings appear in the server-rendered HTML — structural copy changes need matching test updates.
- Images are pre-processed into `public/images`; raw reference material lives outside the tracked repo (`contents/`, gitignored).
- Hidden rooms and studio gates (`/names`, `/ask`, `/scout`, `/curate`) are not the foyer. Do not put them back in the header.

## Brand Commitments

- Name renders lowercase in copy and logo: "dmytro klochko."
- Tied explicitly to Replika ("42m+ users worldwide, #1 ai friend") — must not misstate that positioning.
- Canonical links are the existing handles: X `@dkreplika`, Instagram `@dmytrotoday`, YouTube `@dmytroklochko`, LinkedIn `/in/heydmytro`, and a manifesto link to `replika.com/manifesto`.

## Evidence on Hand

Real, on-the-record facts: Donetsk upbringing and wartime displacement; childhood chess/theatre/music history; product-management and ML career history; Replika CEO role; research collaborations with Stanford, Harvard, and Princeton; a University of Vienna lectureship. Real assets: photos in `public/images`, original poems that live with the hidden rooms rather than on the homepage, and working external links (YouTube, Instagram posts, LinkedIn, X).

The CV at `contents/DK_CV_Dmytro_Klochko_05.26.docx` is NOT a reliable source. Dmytro has confirmed it is "less correct" than his own account. Specifically it lists a Bachelor's degree in Marketing from Donetsk National University (2017); he is a college dropout, and the site says so. Treat the CV as a rough prompt for questions, never as fact to publish. Its revenue and ARR figures were also deliberately left off the site.

Absence future work must not fill in: no testimonials. Time and The Atlantic mentions exist and are on `/press` when the ledger has a source. Do not fabricate any.

## Product Principles

1. Specific, verifiable personal history beats generic personal-branding claims.
2. Industry credibility (Replika's scale) is necessary but not sufficient alone — it must be paired with idiosyncratic taste and artistry to earn the "he's so cool" reaction.
3. Tone is deliberately irreverent, lowercase, and direct, calibrated for sharp, high-status tech/culture readers rather than a broad or corporate audience.
4. There is no functional conversion goal — success is impression and intrigue, not clicks, signups, or leads.
5. Copy is a living draft: free to tighten or rewrite, but never fabricate facts, credentials, or testimonials not already evidenced.
6. The foyer stays small. Extra rooms can exist; they should not be offered before someone knows who this is.
