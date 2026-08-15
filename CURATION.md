# The Curation Doctrine

How things get picked for `/today` and, later, for the Vault. Companion to
[CHECKLIST.md](CHECKLIST.md), which governs how the site looks; this one
governs what it says when it quotes someone else.

## The one principle

**A day is a chord, not a playlist.** The poem, the painting and the line are
three expressions of one weather. Pick the weather first, then cast it. If a
reader cannot feel what the three have in common, the day is wrong, however
good each piece is alone.

## The weathers

| weather | the feeling | casts from |
| --- | --- | --- |
| cold clarity | winter light, precision, attention | Weil, Valéry · Albers, Hammershøi |
| invincible summer | heat held against the dark | Camus, Ovid · Monet, Bonnard |
| dissolution | edges going, fog, late light | Pessoa, Borges · Turner, late Monet, Silvashi |
| the plain thing | one object, looked at properly | Bashō, Ponge · Morandi, Chardin |
| the dark and the lamp | night, solitude, one light on | Borges, Virgil · Kline, Whistler |
| weight and grace | gravity, falling, being held | Weil, Cicero · Rothko, af Klint, Agnes Martin |
| vastness | the scale that puts you in your place | Virgil, Cicero · Friedrich, Wang Wei |

## The quote

The specimen is his own: *"Au milieu de l'hiver, j'apprenais enfin qu'il y avait
en moi un été invincible."* Every rule below is derived from what that line does.

1. **An image, never an instruction.** "Invincible summer," not "stay strong."
   The reader does the work and gets to feel clever for it.
2. **Earned, not advised.** First person, past tense, discovered. Nobody is
   being told what to do.
3. **Show the original where the original is the point**, with a plain English
   line under it.
4. **It has a source**: work and year, checked against a real edition. Never a
   quote site.
5. **It does not explain itself.** No second sentence.
6. Under about 25 words.

**Disqualifiers.** Anything imperative. Anything that has been on a mug. Living
self-help, founders, "mindset", "grind". Anything creditable to "Unknown". If it
could be a LinkedIn post it is out; if it could be the last line of a letter it
is in.

## The poem

- Complete in itself, never an excerpt. A haiku, a fragment, a short lyric.
- The note is **one or two sentences of occasion, not analysis**: who, when,
  what was happening. Never "this poem is about".
- Best when the note changes the poem: Bashō setting out expecting to die,
  Rilke at twenty-six learning to look at things.
- Name the translator. Where the translation is ours, say so.
- Where an attribution is disputed, say that too. The Sappho fragment is
  better, not worse, for admitting nobody knows who wrote it.

## The painting

The through-line in the painters he named — Silvashi, Albers, Kline, Turner,
Monet — is sharper than "abstraction": **light or colour is the subject, not the
means.** Nothing depicted, or depiction dissolving. Extends cleanly to Rothko,
Agnes Martin, Hilma af Klint, Hammershøi, Kawase Hasui, Morandi, Bonnard.

- It must survive being 400px on a phone: one gesture or one field.
- **Unframed scans only.** Google Art Project and WGA files are cropped to the
  canvas; most museum photographs include the gilt frame, which is furniture.
- Full credit always: artist, title, year, collection, and a link to the source.
- Never generated, never a paraphrase of a painting. Derive, never invent.

## Rights, plainly

- **Quotes are safe.** A short attributed quotation is quotation right or fair
  dealing everywhere that matters, so Camus, Weil, Borges and Pessoa are fine.
- **Whole poems are not.** The poem slot is public domain or our own
  translation. Bashō yes; Celan no.
- **Paintings**: he has decided to show modern work as well as public domain.
  The mitigations, which cost nothing: full credit, a link to the museum or
  foundation, our own copy served from our own origin, and never hotlinking.
  A takedown then arrives as an email rather than a letter.

## Rotation

- One weather per day; the three pieces from three different centuries where
  possible.
- No author, painter or weather repeats within sixty days once the vault is
  deep enough to allow it. The seed set of seven repeats weekly and says so.

## The loop

Museum APIs are a **candidate mill, not a runtime source**. They surface
things; he keeps or kills them; only what survives reaches the site. That is
"derive, never invent" applied to curation. Nothing appears on the page that he
has not chosen.

Practical notes from building the seed set: the Met's open-access API rate
limits under parallel bursts and gates images behind `isPublicDomain`, so it
will never return a modern painter. The Art Institute's CDN returns 403 on this
network. Wikimedia Commons works with an identifying user-agent and about 1.1
seconds between calls, and has the unframed scans.
