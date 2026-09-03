import assert from "node:assert/strict";
import test from "node:test";

import { paintingNote } from "../scripts/lib/vault-note.mjs";

// The same parser vault-build and map-build read notes with. Copied rather
// than imported because vault-build runs its whole build on import; if the
// two ever drift, the assertions below stop meaning anything, so this is the
// one place to look when a kept note mysteriously fails to become a mark.
function frontmatter(text) {
  if (!text.startsWith("---")) throw new Error("no frontmatter");
  const end = text.indexOf("\n---", 3);
  if (end === -1) throw new Error("unterminated frontmatter");
  const head = text.slice(4, end).split("\n");
  const body = text.slice(end + 4).replace(/^\n+/, "").trimEnd();
  const out = {};
  for (let i = 0; i < head.length; i++) {
    const m = /^([A-Za-z_][\w-]*):\s*(.*)$/.exec(head[i]);
    if (!m) continue;
    const [, key, raw] = m;
    out[key] = raw.startsWith('"') && raw.endsWith('"') ? raw.slice(1, -1) : raw;
  }
  return { data: out, body };
}

const constable = {
  id: "seascape-study-with-rain-cloud",
  who: "John Constable",
  title: "Seascape Study with Rain Cloud",
  year: "1824",
  source: "https://commons.wikimedia.org/wiki/File:Constable_Rainstorm.jpg",
  licence: "public domain",
  weather: "dissolution",
};

test("a kept note parses as the builds will read it", () => {
  const md = paintingNote(constable, {
    weather: "dissolution",
    src: "/images/vault/seascape-study-with-rain-cloud.webp",
    added: "2026-08-24",
  });
  const { data, body } = frontmatter(md);

  assert.equal(data.type, "painting");
  assert.equal(data.who, "John Constable");
  assert.equal(data.title, "Seascape Study with Rain Cloud");
  assert.equal(data.src, "/images/vault/seascape-study-with-rain-cloud.webp");
  assert.equal(data.weather, "dissolution");
  assert.equal(data.licence, "public domain");
  assert.equal(data.added, "2026-08-24");
  // the quoted url survives its colons and slashes
  assert.equal(data.source, constable.source);

  // the body carries the picture and the two links the threads follow
  assert.match(body, /!\[\[seascape-study-with-rain-cloud\.webp\]\]/);
  assert.match(body, /weather: \[\[dissolution\]\]/);
  assert.match(body, /who: \[\[John Constable\]\]/);
});

test("a note refuses to point at someone else's server", () => {
  // vault-build throws on a painting that is not on disk, so this must fail
  // here, loudly, rather than three steps later inside a build.
  assert.throws(
    () => paintingNote(constable, {
      weather: "dissolution",
      src: "https://upload.wikimedia.org/wikipedia/commons/x.jpg",
      added: "2026-08-24",
    }),
    /local src/,
  );
});

test("a candidate missing its optional fields still writes a valid note", () => {
  const bare = { id: "x", who: "anonymous", title: "River Village at Dusk" };
  const { data, body } = frontmatter(
    paintingNote(bare, { weather: "", src: "/images/vault/x.webp", added: "2026-08-24" }),
  );
  assert.equal(data.who, "anonymous");
  assert.equal(data.year, undefined);
  assert.equal(data.weather, undefined, "an unplaced note must not claim a weather");
  assert.match(body, /!\[\[x\.webp\]\]/);
  assert.match(body, /who: \[\[anonymous\]\]/);
});

test("a kept print, poster or photograph keeps its own kind", async () => {
  const { paintingNote } = await import("../scripts/lib/vault-note.mjs");
  for (const type of ["poster", "print", "photograph"]) {
    const note = paintingNote({ type, who: "x", title: "y", year: "1900" }, { weather: "nerve", src: "/images/vault/z.webp", added: "2026-09-01" });
    assert.match(note, new RegExp(`^type: ${type}$`, "m"), `a ${type} was filed as something else`);
  }
});

test("a kept word is filed as the note it arrived as, dated, and joined to its room", async () => {
  const { wordNote } = await import("../scripts/lib/vault-note.mjs");
  const raw = "---\ntype: quote\nwho: Horace\nwhere: Odes 1.11\nadded: {{added}}\nenglish: |-\n  Seize the day.\n---\n\ncarpe diem.\n\nwho: [[Horace]]\n";
  const note = wordNote({ type: "quote", who: "Horace", note_md: raw }, { weather: "nerve", added: "2026-09-03" });
  assert.match(note, /^added: 2026-09-03$/m, "the date is not today's");
  assert.match(note, /^who: Horace\nweather: nerve$/m, "the weather did not land after who");
  assert.match(note, /^weather: \[\[nerve\]\] · who: \[\[Horace\]\]$/m, "the trail does not join the room");
  assert.match(note, /^carpe diem\.$/m, "the words changed");
  // without a weather nothing is invented
  const ring = wordNote({ type: "quote", who: "Horace", note_md: raw }, { weather: "", added: "2026-09-03" });
  assert.doesNotMatch(ring, /weather/, "an unfiled keep must not be given a weather");
  // and a card with no note still becomes the vault's shape
  const made = wordNote({ type: "poem", who: "x", line: "one\ntwo", where: "y" }, { weather: "", added: "2026-09-03" });
  assert.match(made, /^type: poem$/m); assert.match(made, /^one\ntwo$/m); assert.match(made, /^who: \[\[x\]\]$/m);
  assert.throws(() => wordNote({ type: "painting", who: "x" }, { weather: "", added: "2026-09-03" }));
});
