// A painting note, written the way the vault writes itself.
//
// A note kept from the queue on /eidos should be indistinguishable from one
// made by hand: the picture embedded, the weather and the maker as links so
// the threads find them, the provenance in the frontmatter where every other
// note keeps it. Its own module because three builds read the shape of this
// file, and none of them forgive a surprise.

/** The markdown for a kept painting. `src` must already be local. */
export function paintingNote(c, { weather, src, added }) {
  if (!src || !src.startsWith("/")) {
    throw new Error(`a note needs a local src, got ${JSON.stringify(src)}`);
  }
  const front = [
    "type: painting",
    `who: ${c.who}`,
    `title: ${c.title}`,
    c.year ? `year: ${c.year}` : "",
    `src: ${src}`,
    c.source ? `source: "${c.source}"` : "",
    c.licence ? `licence: ${c.licence}` : "",
    weather ? `weather: ${weather}` : "",
    `added: ${added}`,
  ].filter(Boolean);

  const links = [
    weather ? `weather: [[${weather}]]` : "",
    c.who ? `who: [[${c.who}]]` : "",
  ].filter(Boolean).join(" · ");

  return [
    "---", ...front, "---", "",
    `![[${src.split("/").pop()}]]`, "",
    links,
    "", "kept from the queue on /eidos.", "",
  ].join("\n");
}
