// Turning a Commons attribution into a name.
//
// The records arrive wearing their catalogue clothes — "Painting by Odilon
// Redon", "Charles Landseer (1799 - 1879) – Painter (British) Born in
// London" — and a card he judges at a glance must carry the name and nothing
// else. Its own module because it is the one part of the harvester worth
// testing: everything else there is a network call.

const cut = (v, n) =>
  v.length <= n ? v : v.slice(0, v.lastIndexOf(" ", n) > 12 ? v.lastIndexOf(" ", n) : n).trim();

/** Strip Commons' markup and structured-data noise from any field. */
export function cleanField(v) {
  return (v || "")
    .replace(/<[^>]+>/g, " ")
    .split(/(?:label|title|date) QS:/)[0]
    .replace(/^\s*[A-Z][a-z]+:\s*/, "")      // "French: ..."
    .replace(/&[a-z]+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * The artist's name alone.
 *
 * Order matters: the life-span goes first, because it holds a spaced dash of
 * its own and would otherwise be mistaken for the separator in the step
 * after it. A spaced dash is always a separator in these records and never
 * part of a name; an unspaced one (Toulouse-Lautrec, Baca-Flor) always is.
 */
export function attribution(raw, max = 48) {
  return cut(cleanField(raw)
    .split(/\s*[/;]\s*/)[0]
    .replace(/\s*\((?:c\.?\s*)?\d{3,4}\s*[-–—]?\s*(?:c\.?\s*)?\d{0,4}\)?\s*/g, " ")
    .split(/\s+[-–—]\s+/)[0]
    .replace(/\s*\([^)]*\)?\s*$/, "")
    .replace(/^(attributed to|manner of|circle of|after|painting by|work by|art by)\s+/i, "")
    .replace(/\bAnonymous ?Unknown author\b/i, "anonymous")
    .replace(/\s*[-–—,]\s*(painter|artist|peintre|maler|sculptor)\s*$/i, "")
    .replace(/\s+/g, " ")
    .trim(), max);
}
