import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

// The niche/modern sweep: every artist is a people note plus a work, and
// none of those works may rotate into /today until he files a weather.

const root = path.resolve(import.meta.dirname, "..");
const read = (f) => fs.readFileSync(path.join(root, f), "utf8");
const list = (dir) => fs.readdirSync(path.join(root, dir)).filter((f) => f.endsWith(".md"));

const ARTISTS = [
  { name: "Florine Stettheimer", work: "stettheimer-heat" },
  { name: "Charles Demuth", work: "demuth-bermuda-masts" },
  { name: "Oleksandr Bohomazov", work: "bohomazov-window" },
  { name: "Heorhiy Narbut", work: "narbut-coat-of-arms" },
  { name: "Oleksandra Ekster", work: "ekster-planes" },
  { name: "Félix Vallotton", work: "vallotton-woman-writing" },
  { name: "Albert Marquet", work: "marquet-quai-conti" },
  { name: "Gino Rossi", work: "rossi-sailor" },
  { name: "Paula Modersohn-Becker", work: "modersohn-becker-milk-soup" },
  { name: "Ludwig Hohlwein", work: "hohlwein-zoo-munich" },
  { name: "Władysław Strzemiński", work: "strzeminski-afterimage-sun" },
  { name: "Niko Pirosmani", work: "pirosmani-still-life" },
  { name: "Bohumil Kubišta", work: "kubista-sebastian" },
  { name: "María Blanchard", work: "blanchard-fillette" },
  { name: "Yoshida Hiroshi", work: "yoshida-funatsu" },
  { name: "Onchi Kōshirō", work: "onchi-flowers" },
  { name: "Ohara Koson", work: "koson-crow-and-blossom" },
  { name: "Hashiguchi Goyō", work: "goyo-woman-after-bath" },
  { name: "Xu Beihong", work: "xu-beihong-horse-1943" },
  { name: "Huang Binhong", work: "huang-binhong-landscape" },
  { name: "Gao Jianfu", work: "gao-jianfu-landscape" },
];

const workFiles = () => [
  ...list("vault/paintings"),
  ...list("vault/prints"),
  ...list("vault/posters"),
].map((f) => {
  const file = ["paintings", "prints", "posters"]
    .map((d) => path.join(root, "vault", d, f))
    .find((p) => fs.existsSync(p));
  return { id: f.replace(/\.md$/, ""), text: read(file.replace(root + "/", "")) };
});

test("every niche modern has a people note and a paired work", () => {
  const people = list("vault/people").map((f) => read(`vault/people/${f}`));
  const works = workFiles();
  for (const a of ARTISTS) {
    const person = people.find((t) => /^name: /m.test(t) && t.includes(`name: ${a.name}`));
    assert.ok(person, `no people note for ${a.name}`);
    assert.match(person, /^note: \|-$/m, `${a.name} has no bio`);
    const work = works.find((w) => w.id === a.work);
    assert.ok(work, `no work file ${a.work} for ${a.name}`);
    assert.match(work.text, new RegExp(`^who: ${a.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "m"),
      `${a.work} is not attributed to ${a.name}`);
  }
});

test("unsat niche works do not carry a weather, so they cannot make a day", () => {
  const today = JSON.parse(read("src/data/today.json"));
  const ids = new Set(ARTISTS.map((a) => a.work));
  for (const a of ARTISTS) {
    const file = ["paintings", "prints", "posters"]
      .map((d) => `vault/${d}/${a.work}.md`)
      .find((p) => fs.existsSync(path.join(root, p)));
    const text = read(file);
    const fm = text.split("---")[1] || "";
    assert.doesNotMatch(fm, /^weather:/m, `${a.work} still has a weather and would enter /today`);
  }
  for (const chord of today.chords) {
    const src = chord.painting?.src || "";
    const stem = path.basename(src, path.extname(src));
    assert.ok(!ids.has(stem), `${stem} is still rotating on /today`);
  }
});

test("xu hangs a painting, not only the photograph", () => {
  assert.ok(fs.existsSync(path.join(root, "vault/paintings/xu-beihong-horse-1943.md")));
  assert.ok(fs.existsSync(path.join(root, "public/images/vault/xu-beihong-horse-1943.webp")));
  const person = read("vault/people/xu-beihong.md");
  assert.match(person, /1943 horse/);
});

test("a person without a picture does not ship a broken img", () => {
  const src = read("src/pages/eidos/index.astro");
  assert.match(src, /it\.src\s*\n?\s*\? <img/, "the hall still always paints an img");
  const html = read("dist/eidos/index.html");
  const demuth = html.match(/id="charles-demuth"[\s\S]*?<\/button>/);
  assert.ok(demuth, "demuth's card is missing from the library");
  assert.doesNotMatch(demuth[0], /<img /, "demuth shipped an empty face");
  assert.match(demuth[0], /class="lib-bare"/, "demuth has no text plate");
});
