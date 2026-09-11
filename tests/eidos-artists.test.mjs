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
  { name: "Oleksandr Murashko", work: "murashko-annunciation" },
  { name: "Léon Spilliaert", work: "spilliaert-vertigo" },
  { name: "Jacek Malczewski", work: "malczewski-melancholia" },
  { name: "Olga Boznańska", work: "boznanska-chrysanthemums" },
  { name: "Gwen John", work: "gwen-john-corner" },
  { name: "Élisabeth Vigée Le Brun", work: "vigee-le-brun-straw-hat" },
  { name: "Joseph Wright of Derby", work: "wright-air-pump" },
  { name: "Sophie Taeuber-Arp", work: "taeuber-arp-kompozycja" },
  { name: "Medardo Rosso", work: "rosso-enfant-soleil" },
  { name: "Ignacio Zuloaga", work: "zuloaga-gregorio" },
  { name: "Fedir Krychevsky", work: "krychevsky-life" },
  { name: "Stanisław Wyspiański", work: "wyspianski-motherhood-1905" },
  { name: "Henry Fuseli", work: "fuseli-nightmare" },
  { name: "Käthe Kollwitz", work: "kollwitz-dead-child" },
  { name: "Arnold Böcklin", work: "bocklin-toteninsel-iii" },
  { name: "Giovanni Segantini", work: "segantini-ave-maria" },
  { name: "Suzanne Valadon", work: "valadon-blue-room" },
  { name: "Adélaïde Labille-Guiard", work: "labille-guiard-self-pupils" },
  { name: "Anne Vallayer-Coster", work: "vallayer-coster-attributes" },
  { name: "Angelica Kauffman", work: "kauffman-self-1784" },
  { name: "Anne-Louis Girodet", work: "girodet-endymion" },
  { name: "Théodore Chassériau", work: "chasseriau-esther" },
  { name: "Gustave Moreau", work: "moreau-orpheus" },
  { name: "James Tissot", work: "tissot-london-visitors" },
  { name: "Walter Sickert", work: "sickert-ennui" },
  { name: "Helene Schjerfbeck", work: "schjerfbeck-convalescent" },
  { name: "Thomas Eakins", work: "eakins-gross-clinic" },
  { name: "Kishida Ryūsei", work: "kishida-reiko-doll" },
  { name: "Joaquín Sorolla", work: "sorolla-house-garden" },
  { name: "Mykhailo Boychuk", work: "boychuk-harvest" },
  { name: "Kazimir Malevich", work: "malevich-morning-village" },
  { name: "Marie Bashkirtseff", work: "bashkirtseff-meeting" },
  { name: "Kyriak Kostandi", work: "kostandi-geese" },
  { name: "Serhii Vasylkivsky", work: "vasylkivsky-sunset" },
  { name: "Mykola Pymonenko", work: "pymonenko-harvest" },
  { name: "Ivan Trush", work: "trush-little-pond" },
  { name: "Oleksa Novakivskyi", work: "novakivskyi-levytskyi" },
  { name: "Ivan Padalka", work: "padalka-tomatoes" },
];

const LINK_ONLY = [
  "František Kupka",
  "Giorgio de Chirico",
  "Elene Akhvlediani",
  "Lado Gudiashvili",
  "Julie Mehretu",
  "Amy Sillman",
  "Simone Leigh",
  "Ayoung Kim",
  "Zhanna Kadyrova",
  "Wilhelm Sasnal",
  "Gala Porras-Kim",
  "Vija Celmins",
  "Ruth Asawa",
  "Joan Mitchell",
  "Cy Twombly",
  "Brice Marden",
  "Pierre Soulages",
  "Zao Wou-Ki",
  "Alice Neel",
  "Toyen",
  "Josef Sudek",
  "Carol Rama",
  "Alina Szapocznikow",
  "Magdalena Abakanowicz",
  "Richard Diebenkorn",
  "Nicolas de Staël",
  "Sanyu",
  "Kateryna Bilokur",
  "Maria Prymachenko",
  "Tetyana Yablonska",
  "Alla Horska",
  "Anatolii Lymarev",
  "Fedir Tetyanych",
  "Vadym Sidur",
  "Kostiantyn Zorkin",
  "Valeria Troubina",
  "Oleksandr Dubovyk",
  "Viktor Zaretskyi",
  "Halyna Zubchenko",
  "Mykola Hlushchenko",
  "Anatol Petrytskyi",
  "Vasyl Yermilov",
  "Tiberiy Silvashi",
  "Lesia Khomenko",
  "Nikita Kadan",
];

const workDirs = ["paintings", "prints", "posters", "objects"];

const workFiles = () => {
  const seen = new Set();
  const out = [];
  for (const d of workDirs) {
    const dir = path.join(root, "vault", d);
    if (!fs.existsSync(dir)) continue;
    for (const f of list(`vault/${d}`)) {
      if (seen.has(f)) continue;
      seen.add(f);
      out.push({ id: f.replace(/\.md$/, ""), text: read(`vault/${d}/${f}`) });
    }
  }
  return out;
};

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
    const file = workDirs
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

test("link-only circuit names have a door out and no hosted face", () => {
  const people = list("vault/people").map((f) => ({ file: f, text: read(`vault/people/${f}`) }));
  for (const name of LINK_ONLY) {
    const person = people.find((p) => p.text.includes(`name: ${name}`));
    assert.ok(person, `no people note for ${name}`);
    assert.match(person.text, /^note: \|-$/m, `${name} has no bio`);
    assert.match(person.text, /^url: "https?:\/\//m, `${name} has no door out`);
    assert.doesNotMatch(person.text, /^src:/m, `${name} shipped a face we do not have rights to`);
  }
});

test("sorolla hangs gardens, not the beach posters", () => {
  const sorolla = list("vault/paintings")
    .filter((f) => f.startsWith("sorolla-"))
    .map((f) => read(`vault/paintings/${f}`).toLowerCase());
  assert.ok(sorolla.length >= 4, "sorolla is still one garden");
  for (const text of sorolla) {
    assert.doesNotMatch(text, /walk on the beach|niños en la playa|instantánea|sewing the sail/,
      "a beach-poster sorolla got in");
  }
});

test("xu hangs a painting, not only the photograph", () => {
  assert.ok(fs.existsSync(path.join(root, "vault/paintings/xu-beihong-horse-1943.md")));
  assert.ok(fs.existsSync(path.join(root, "public/images/vault/xu-beihong-horse-1943.webp")));
  const person = read("vault/people/xu-beihong.md");
  assert.match(person, /1943 horse/);
});

test("malevich hangs the village and the grinder, not the postcard square", () => {
  const files = list("vault/paintings").filter((f) => f.startsWith("malevich-"));
  assert.ok(files.includes("malevich-morning-village.md"));
  assert.ok(files.includes("malevich-knife-grinder.md"));
  for (const f of files) {
    const text = read(`vault/paintings/${f}`).toLowerCase();
    assert.doesNotMatch(text, /black square|чёрный квадрат|чорний квадрат/,
      `${f} is the postcard square`);
  }
});

test("estate and living ua names have no hosted canvas", () => {
  const banned = [
    "Kateryna Bilokur", "Maria Prymachenko", "Tetyana Yablonska", "Alla Horska",
    "Anatolii Lymarev", "Fedir Tetyanych", "Vadym Sidur", "Kostiantyn Zorkin",
    "Valeria Troubina", "Oleksandr Dubovyk", "Viktor Zaretskyi", "Halyna Zubchenko",
    "Mykola Hlushchenko", "Anatol Petrytskyi", "Vasyl Yermilov", "Tiberiy Silvashi",
    "Lesia Khomenko", "Nikita Kadan",
  ];
  for (const f of list("vault/paintings")) {
    const text = read(`vault/paintings/${f}`);
    for (const name of banned) {
      assert.doesNotMatch(text, new RegExp(`^who: ${name}$`, "m"),
        `${f} hosts a canvas for ${name}`);
    }
  }
});

test("a person without a picture does not ship a broken img", () => {
  const map = JSON.parse(read("src/data/map.json"));
  const person = map.items.find((item) => item.id === "oleksandr-bohomazov");
  assert.ok(person, "bohomazov's people note never reached the map");
  assert.equal(person.type, "person");
  assert.ok(!person.src, "bohomazov unexpectedly has a picture");

  // the moodboard is pictures only; people without a face stay off it.
  // collection / field / reading still gate <img> on src so an empty
  // face cannot ship as a broken image.
  const surfaces = [
    "src/pages/eidos/index.astro",
    "src/components/eidos/EidosMoodboard.astro",
    "src/components/eidos/EidosCollection.astro",
    "src/components/eidos/EidosField.astro",
    "src/components/eidos/EidosReading.astro",
  ].map(read).join("\n");
  assert.match(surfaces, /item\.src \?/, "a surface paints img without asking for src");
  const html = read("dist/eidos/index.html");
  assert.doesNotMatch(html, /<img[^>]+src=["']\s*["']/, "an empty img src shipped");
  assert.doesNotMatch(html, /id="oleksandr-bohomazov"[\s\S]*?<img /, "bohomazov shipped an empty face");
});
