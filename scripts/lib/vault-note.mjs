// A painting note, written the way the vault writes itself.
//
// A note kept from the queue on /eidos should be indistinguishable from one
// made by hand: the picture embedded, the weather and the maker as links so
// the threads find them, the provenance in the frontmatter where every other
// note keeps it. Its own module because three builds read the shape of this
// file, and none of them forgive a surprise.

/** The markdown for a kept mark. `src` must already be local. */
export function paintingNote(c, { weather, src, added }) {
  if (!src || !src.startsWith("/")) {
    throw new Error(`a note needs a local src, got ${JSON.stringify(src)}`);
  }
  // paintings were first; objects and buildings arrived when the library
  // opened its doors to design. the note shape is one shape.
  const kind = ["painting", "object", "building"].includes(c.type) ? c.type : "painting";
  const front = [
    `type: ${kind}`,
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

/**
 * A bookmark, as the inbox learned it.
 *
 * The inbox is where he throws links. The worker reads each page once — title,
 * site, description, a picture if the page offers one — and, when a key is
 * set, asks the model what is worth remembering about it. A keep turns that
 * record into this note: obsidian-shaped, with the summary as the body and the
 * wikilink trail at the foot, so the vault's graph joins it to the weather it
 * was filed under and to whoever wrote it.
 */
export function bookmarkNote(b, { weather, added }) {
  if (!b.url || !/^https?:\/\//.test(b.url)) {
    throw new Error(`a bookmark needs a url, got ${JSON.stringify(b.url)}`);
  }
  const q = (v) => JSON.stringify(String(v ?? ""));
  const tags = Array.isArray(b.tags) ? b.tags.filter(Boolean) : [];
  const front = [
    `type: bookmark`,
    `title: ${q(b.title || b.url)}`,
    `url: ${q(b.url)}`,
    b.site ? `site: ${q(b.site)}` : "",
    b.who ? `who: ${q(b.who)}` : "",
    b.image ? `image: ${q(b.image)}` : "",
    b.summary ? `summary: ${q(b.summary)}` : "",
    tags.length ? `tags: [${tags.map(q).join(", ")}]` : "",
    weather ? `weather: ${weather}` : "",
    `added: ${added}`,
  ].filter(Boolean);

  const links = [
    weather ? `weather: [[${weather}]]` : "",
    b.who ? `who: [[${b.who}]]` : "",
    ...tags.map((t) => `[[${t}]]`),
  ].filter(Boolean).join(" · ");

  const body = [
    b.note ? b.note.trim() : "",
    b.summary ? b.summary.trim() : "",
    b.description && !b.summary ? b.description.trim() : "",
  ].filter(Boolean).join("\n\n");

  return [
    "---", ...front, "---", "",
    body || "kept from the inbox.", "",
    links, "",
  ].join("\n");
}
