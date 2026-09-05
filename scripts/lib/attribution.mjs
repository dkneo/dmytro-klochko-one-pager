// Turning a Commons attribution into a name.
//
// The records arrive wearing their catalogue clothes — "Painting by Odilon
// Redon", "Charles Landseer (1799 - 1879) – Painter (British) Born in
// London" — and a card he judges at a glance must carry the name and nothing
// else. Its own module because it is the one part of the harvester worth
// testing: everything else there is a network call.

// A name is cut at a word, and never on a particle: "comte de Caylus" cut at
// forty-eight came out "comte de", which is a title with the name missing. A
// name that would end on a particle is kept whole; long names are rare.
const PARTICLE = /\b(de|du|des|da|di|von|van|der|den|la|le|of|the|comte|duc|sir|dom|y|e)$/i;
const cut = (v, n) => {
  if (v.length <= n) return v;
  const at = v.lastIndexOf(" ", n);
  const short = (at > 12 ? v.slice(0, at) : v.slice(0, n)).trim();
  return PARTICLE.test(short) ? v.trim() : short;
};

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
    // Commons' placeholder when the uploader gave no author is a sentence,
    // not a name; a HABS credit carries its "Related Names" role into the
    // field. Neither is a maker.
    .replace(/^no machine-readable author provided.*$/i, "anonymous")
    .replace(/\s+Related(\s+Names?)?\s*$/i, "")
    // a Commons category rode in behind a real name: "Wiener Werkstätte Details
    // on Google Art Project" is a folder, not a maker
    .replace(/\s+(Details\s+)?on Google Art Project\s*$/i, "")
    .replace(/\s*[-–—,]\s*(painter|artist|peintre|maler|sculptor)\s*$/i, "")
    .replace(/\s+/g, " ")
    .trim(), max);
}

/**
 * The date a card can wear.
 *
 * Commons keeps the date twice: once for people and once for machines, in one
 * string — "1868<br>date QS:P571,+1868-00-00T00:00:00Z/9". Only the first
 * half is a year. Reading the raw field and trimming it to length left
 * thirteen paintings dated "1868date QS:P571,+18" on the library wall.
 */
export function year(raw, max = 20) {
  const v = cleanField(raw)
    .replace(/^(?:circa|ca\.?)\s+/i, "c. ")
    .replace(/\s*[-–—]\s*$/, "")
    .trim();

  // A camera's timestamp is not a date of making, and a catalogue's
  // "between 1824 and 1828" does not survive being trimmed to length — it
  // hung on the wall as "between 1824 and 182".
  const iso = v.match(/^(\d{4})-\d{2}-\d{2}/);
  if (iso) return iso[1];
  const span = v.match(/^between (\d{4}) and (\d{2})(\d{2})$/i);
  if (span) return span[1] === span[2] + span[3] ? span[1] : `${span[1]}–${span[3]}`;
  // "March 22, 1952", "22 March 1952" — the year is the whole of the answer
  if (/[A-Za-z]{3,}/.test(v) && /\b\d{4}\b/.test(v) && !/century|c\.|autumn|spring|summer|winter/i.test(v)) {
    return v.match(/\b(\d{4})\b/)[1];
  }
  return cut(v, max);
}
