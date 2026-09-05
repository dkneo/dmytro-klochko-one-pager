# eidos — five directions, one chosen

He asked for the library to be beautiful to share and legible at a glance,
and for three to five directions explored "dreamy, but all with perfect
clarity". These are the five, each with real references, what it would
change, what it would cost, and a verdict. The current build is the first,
refined. The others are here so the choice is visible rather than implied.

The constraint that decides everything: the site's whole voice is a quiet
column of letter-scale serif over his own paintings. A direction that needs
a different ground is not a direction for this site.

---

## 1. The reading room — rooms, walls, columns  *(built)*

**What it is.** Eight weathers as rooms, cold to warm. Pictures hang on a
wall, words are read in a column, each room wears the palette of its own
painting. A computed portrait opens the page: numbers, recurring names,
fullest and thinnest room.

**Refs.** [rauno.me](https://rauno.me) — the quiet column, letter-scale
type, restraint as the whole design. [emilkowal.ski](https://emilkowal.ski)
— one idea per screen, motion that explains rather than decorates. Museum
wall labels — the print, then the caption in a smaller hand, never the
other way round.

**Verdict.** This is the site's own language applied to a collection. It
scales to 500 marks without changing shape. Chosen.

**What it still wants.** The portrait as a shareable image (og-eidos.png
exists; a version that updates from the vault at build would be better).

## 2. The mood board — a wall of everything, no rooms

**What it is.** One masonry field of every picture, filterable by weather
and kind, words as cards among the pictures. The gestalt is the point.

**Refs.** [Cosmos](https://cosmos.so) — visual mood boards, the cleanest of
the Pinterest descendants. [Savee](https://savee.it) — designers' image
walls, no chrome. [Are.na](https://are.na) channels — blocks of mixed kind
in one grid.

**Cost.** Words in a picture grid was tried on 26 Aug and rejected: "a quote
squeezed into a square tile is mostly empty space wearing a border". And a
wall of 213 paintings without rooms loses the one thing this collection has
that a mood board does not — the weathers.

**Verdict.** Beautiful at 40 images, mush at 400. Not for the whole
library; possibly the right shape for a single weather's page.

## 3. The graph — a mindmap you can walk

**What it is.** Marks as nodes, threads (same maker, same weather, same
decade) as edges, a force layout you drag through. The obsidian view.

**Refs.** Obsidian's graph view. [Are.na](https://are.na)'s "connections".
The orbit already on /eidos/orbit is a cousin of this.

**Cost.** A graph shows structure and hides content: at a glance you see
that Rilke connects to three weathers, not what Rilke said. He asked for
"perfect clarity"; a graph is the opposite until you know it well.

**Verdict.** Keep as a secondary view (the orbit and the sketch already
are). Never the front door.

## 4. The private brain — bookmarks, notes, summaries

**What it is.** The inbox as the centre: throw anything in, the model reads
it once, a card is made, a swipe keeps it, a note is written. The library is
the public face of a private tool.

**Refs.** [mymind](https://mymind.com) — the closest existing product to
what he described: paste, it reads, it files, no folders. [Readwise
Reader](https://readwise.io/read) — read later plus highlights plus notes.
Obsidian for the note shape.

**Verdict.** Built: /eidos/inbox does exactly this, with the notes in
vault/bookmarks in obsidian shape and the kept ones surfacing on /eidos
under "read". This is the engine, not the face; it feeds direction 1.

## 5. The daily page — one thing a day, forever

**What it is.** No library at all on the front: one painting, one poem, one
song, changing daily, the archive behind it. Taste as a practice rather than
a collection.

**Refs.** [Poetry Daily](https://poems.com). The old /today on this site,
which did this and was hidden on 31 Aug because it broke.

**Verdict.** Lovely, and already exists as /today. It is a companion to the
library, not a replacement: the library answers "what does he love", the
day answers "what is he looking at".

---

## What to do next

1. ~~Make the portrait shareable as an image that rebuilds from the vault~~ —
   done: scripts/og-eidos-build.mjs draws og-eidos.png from map.json at every
   build, versioned by the map's date.
2. Give each weather its own page in the mood-board shape (direction 2 at
   the scale where it works), linked from the room's door.
3. Leave the graph and the day where they are.

## Refs, looked at (5 Sep 2026)

Opened side by side, not remembered. What each actually does, and what of it
belongs here.

**Cosmos (cosmos.so).** A light page framed by a scatter of small image
tiles at their own ratios, with one sentence in the middle: "your space for
inspiration." The device is the scatter as a frame for a line. *Take:* tiles
at their own proportions, never a forced square — the library already does
this with its plates. *Leave:* the product beneath is an algorithmic feed;
nothing on it was chosen by one person, which is the opposite of the doctrine.
Feeds direction 2, the mood board.

**Are.na (are.na).** Dark, text first. It says what it is in three plain
lines — "online software for saving and organizing the content that is
important to you," "for people who defy categorization" — and then, lower,
"no ads, no personalized recommendations." A channel is a page with a path
(Are.na / Pierre Marteau / Commonplace) and blocks connect across channels.
*Take:* the channel-as-page — a weather is a channel; the honesty of the
manifesto voice; connections as the thing that makes a library a graph.
*Leave:* the utilitarian grey; it is a tool's face, not a person's. Feeds
directions 1 and 3.

**mymind (mymind.com).** "Remember everything. Organize nothing." A private
masonry of notes, bookmarks, quotes and images, auto-tagged, with one search
box; quotes sit as cards among the pictures. *Take:* the stance — organize
nothing, let the model tag and let search find — which is exactly the inbox's
summarise-and-tag job; quotes as cards among images. *Leave:* the SaaS
gloss, the coloured pills. Feeds direction 4, the private brain.

**rauno.me.** One sentence in large type and a yellow circle. Nothing else
above the fold. *Take:* the nerve of one line and one shape; the letter-scale
restraint the checklist already asks for. *Leave:* it is a doorway, not a
library — there is nothing to browse. Feeds the portrait's opening line, and
the embed, which is one card and stops.

What they agree on, and the library now does: pictures at their own ratio;
words as cards beside pictures, not in a separate app; a plain sentence about
what the thing is before anything else; and no feed — every item placed by a
hand.
