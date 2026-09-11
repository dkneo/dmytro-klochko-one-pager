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
  { name: "Józef Mehoffer", work: "mehoffer-strange-garden" },
  { name: "Stanisław Ignacy Witkiewicz", work: "witkacy-zielinska" },
  { name: "Władysław Ślewiński", work: "slewinski-combing" },
  { name: "Konrad Krzyżanowski", work: "krzyzanowski-clouds-finland" },
  { name: "Leon Chwistek", work: "chwistek-fencing" },
  { name: "David Kakabadze", work: "kakabadze-abstraction" },
  { name: "Shalva Kikodze", work: "kikodze-khevsureti" },
  { name: "Gigo Gabashvili", work: "gabashvili-market" },
  { name: "Aleksandre Tsimakuridze", work: "tsimakuridze-kvishkheti" },
  { name: "Henryk Hryniewski", work: "hryniewski-old-soldier" },
  { name: "Kuroda Seiki", work: "kuroda-lakeside" },
  { name: "Fujishima Takeji", work: "fujishima-black-fan" },
  { name: "Yokoyama Taikan", work: "yokoyama-innocence" },
  { name: "Uemura Shōen", work: "uemura-jo-no-mai" },
  { name: "Nakamura Tsune", work: "nakamura-yaroshenko" },
  { name: "Koide Narashige", work: "koide-still-life" },
  { name: "Murakami Kagaku", work: "murakami-kannon" },
  { name: "Yasui Sōtarō", work: "yasui-roses" },
  { name: "Tsuchida Bakusen", work: "bakusen-maiko" },
  { name: "Hayami Gyoshū", work: "hayami-enbu" },
  { name: "Aoki Shigeru", work: "aoki-mera" },
  { name: "Max Beckmann", work: "beckmann-roses" },
  { name: "Ernst Ludwig Kirchner", work: "kirchner-czardas" },
  { name: "Franz Marc", work: "marc-deer-snow" },
  { name: "Alexej von Jawlensky", work: "jawlensky-sakharoff" },
  { name: "Lovis Corinth", work: "corinth-samson" },
  { name: "Max Liebermann", work: "liebermann-wannsee" },
  { name: "Kurt Schwitters", work: "schwitters-merz-50" },
  { name: "Willi Baumeister", work: "baumeister-tori" },
  { name: "Gustave Caillebotte", work: "caillebotte-rainy-day" },
  { name: "Pierre Puvis de Chavannes", work: "puvis-poor-fisherman" },
  { name: "Maurice Denis", work: "denis-homage-cezanne" },
  { name: "Paul Sérusier", work: "serusier-talisman" },
  { name: "Ker-Xavier Roussel", work: "roussel-women-shade" },
  { name: "Aristide Maillol", work: "maillol-wave" },
  { name: "Émile Bernard", work: "bernard-two-breton" },
  { name: "Charles-François Daubigny", work: "daubigny-harvest" },
  { name: "Jean-François Millet", work: "millet-gleaners" },
  { name: "Honoré Daumier", work: "daumier-third-class" },
  { name: "Chaïm Soutine", work: "soutine-carcass" },
  { name: "Robert Delaunay", work: "delaunay-circular-moon" },
  { name: "Georges Seurat", work: "seurat-poseuses" },
  { name: "Umberto Boccioni", work: "boccioni-city-rises" },
  { name: "Luigi Russolo", work: "russolo-perfume" },
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
  "Katarzyna Kobro",
  "Roman Opałka",
  "Tadeusz Kantor",
  "Zdzisław Beksiński",
  "Tymon Niesiołowski",
  "Henryk Stażewski",
  "Maria Jarema",
  "Jonasz Stern",
  "Jerzy Nowosielski",
  "Wojciech Fangor",
  "Andrzej Wróblewski",
  "Ketevan Magalashvili",
  "Petre Otskheli",
  "Irakli Parjiani",
  "Dimitri Shevardnadze",
  "Félix Varlamishvili",
  "Thea Djordjadze",
  "Andro Wekua",
  "Tsuguharu Foujita",
  "Kayama Matazō",
  "Dōmoto Inshō",
  "Maeda Seison",
  "Hiroshi Sugimoto",
  "Gabriele Münter",
  "Christian Schad",
  "Lotte Laserstein",
  "Otto Dix",
  "George Grosz",
  "Hannah Höch",
  "Lyonel Feininger",
  "Jeanne Mammen",
  "Balthus",
  "Amédée Ozenfant",
  "Sonia Delaunay",
  "Marie Laurencin",
  "Jean Hélion",
  "Pierre Bonnard",
  "Giorgio Morandi",
  "Mario Sironi",
  "Carlo Carrà",
  "Gino Severini",
  "Giacomo Balla",
  "Lucio Fontana",
  "Alberto Burri",
  "Felice Casorati",
  "Antonio Donghi",
  "Filippo de Pisis",
  "Arturo Martini",
  "Marino Marini",
  "Piero Manzoni",
  "Fortunato Depero",
  "Afro Basaldella",
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

test("ua framing: troubina is paris commune, malevich is kyiv-linked, boychuk is absence", () => {
  const troubina = read("vault/people/valeria-troubina.md").toLowerCase();
  assert.match(troubina, /paris commune/, "troubina lost the squat");
  assert.match(troubina, /holosiy/, "troubina lost holosiy");
  assert.match(troubina, /not silvashi/, "troubina collapsed into silvashi");

  const malevich = read("vault/people/kazimir-malevich.md").toLowerCase();
  assert.match(malevich, /kyiv art institute/, "malevich lost the kyiv years");
  assert.match(malevich, /not a claim/, "malevich reads as a nationality claim");

  const boychuk = read("vault/people/mykhailo-boychuk.md").toLowerCase();
  assert.match(boychuk, /we do not rebuild the walls/, "boychuk invites a reconstruction");
  assert.match(boychuk, /not reconstructions/, "boychuk lost the absence caveat");
  assert.doesNotMatch(boychuk, /the rest is reconstruction/, "boychuk still calls the hang a reconstruction");

  const padalka = read("vault/people/ivan-padalka.md").toLowerCase();
  assert.match(padalka, /not rebuilt murals/, "padalka lost the mural caveat");

  const saint = read("vault/paintings/boychuk-saint-john.md").toLowerCase();
  assert.match(saint, /surviving/, "saint john is not labelled as surviving");
  assert.match(saint, /not a reconstruction/, "saint john lost the mosaic caveat");
});

test("estate and living pl/ge names have no hosted canvas", () => {
  const banned = [
    "Katarzyna Kobro", "Roman Opałka", "Tadeusz Kantor", "Zdzisław Beksiński",
    "Tymon Niesiołowski", "Henryk Stażewski", "Maria Jarema", "Jonasz Stern",
    "Jerzy Nowosielski", "Wojciech Fangor", "Andrzej Wróblewski",
    "Ketevan Magalashvili", "Petre Otskheli", "Irakli Parjiani",
    "Dimitri Shevardnadze", "Félix Varlamishvili", "Thea Djordjadze", "Andro Wekua",
  ];
  for (const f of list("vault/paintings")) {
    const text = read(`vault/paintings/${f}`);
    for (const name of banned) {
      assert.doesNotMatch(text, new RegExp(`^who: ${name}$`, "m"),
        `${f} hosts a canvas for ${name}`);
    }
  }
});

test("the polish pack skips matejko battles and lempicka memes", () => {
  const people = list("vault/people").map((f) => read(`vault/people/${f}`)).join("\n");
  const works = list("vault/paintings").map((f) => read(`vault/paintings/${f}`)).join("\n");
  assert.doesNotMatch(people, /Jan Matejko|Tamara (de )?Łempicka|Tamara de Lempicka/);
  assert.doesNotMatch(works, /Matejko|Łempicka|Lempicka/);
});

test("mehoffer hangs the garden and the glass", () => {
  assert.ok(fs.existsSync(path.join(root, "vault/paintings/mehoffer-strange-garden.md")));
  assert.ok(fs.existsSync(path.join(root, "public/images/vault/mehoffer-strange-garden.webp")));
  assert.ok(fs.existsSync(path.join(root, "vault/paintings/mehoffer-caritas.md")));
  const garden = read("vault/paintings/mehoffer-strange-garden.md");
  assert.match(garden, /^who: Józef Mehoffer$/m);
  assert.doesNotMatch(garden, /^weather:/m);
});

test("estate and living jp/de names have no hosted canvas", () => {
  const banned = [
    "Tsuguharu Foujita", "Kayama Matazō", "Dōmoto Inshō", "Maeda Seison",
    "Hiroshi Sugimoto", "Gabriele Münter", "Christian Schad", "Lotte Laserstein",
    "Otto Dix", "George Grosz", "Hannah Höch", "Lyonel Feininger", "Jeanne Mammen",
  ];
  for (const f of list("vault/paintings")) {
    const text = read(`vault/paintings/${f}`);
    for (const name of banned) {
      assert.doesNotMatch(text, new RegExp(`^who: ${name}$`, "m"),
        `${f} hosts a canvas for ${name}`);
    }
  }
});

test("the japan pack skips the great wave and hasui", () => {
  const pack = [
    "kuroda-seiki", "fujishima-takeji", "yokoyama-taikan", "uemura-shoen",
    "nakamura-tsune", "koide-narashige", "murakami-kagaku", "yasui-sotaro",
    "tsuchida-bakusen", "hayami-gyoshu", "aoki-shigeru", "tsuguharu-foujita",
    "kayama-matazo", "domoto-insho", "maeda-seison", "hiroshi-sugimoto",
  ];
  const people = pack.map((id) => read(`vault/people/${id}.md`)).join("\n");
  const works = list("vault/paintings")
    .filter((f) => /^(kuroda|fujishima|yokoyama|uemura|nakamura|koide|murakami|yasui|bakusen|hayami|aoki)-/.test(f))
    .map((f) => read(`vault/paintings/${f}`)).join("\n");
  assert.doesNotMatch(people, /Hokusai|Hasui|Great Wave/);
  assert.doesNotMatch(works, /Great Wave|神奈川沖浪裏|Hasui/);
});

test("kuroda hangs the lake and the triptych, shoen hangs the dance", () => {
  assert.ok(fs.existsSync(path.join(root, "vault/paintings/kuroda-lakeside.md")));
  assert.ok(fs.existsSync(path.join(root, "public/images/vault/kuroda-lakeside.webp")));
  assert.ok(fs.existsSync(path.join(root, "vault/paintings/kuroda-wisdom-impression-sentiment.md")));
  assert.ok(fs.existsSync(path.join(root, "vault/paintings/uemura-jo-no-mai.md")));
  const lake = read("vault/paintings/kuroda-lakeside.md");
  assert.match(lake, /^who: Kuroda Seiki$/m);
  assert.doesNotMatch(lake, /^weather:/m);
});

test("foujita names the war in one line and does not hang it", () => {
  const text = read("vault/people/tsuguharu-foujita.md");
  assert.match(text, /army|war/, "foujita lost the wartime clause");
  assert.match(text, /cats|nudes/, "foujita became only the war");
  const lines = text.split("\n").filter((l) => /army|war/.test(l));
  assert.ok(lines.length <= 2, "foujita centered the war");
});

test("beckmann hangs still lifes, not the postcard night", () => {
  const files = list("vault/paintings").filter((f) => f.startsWith("beckmann-"));
  assert.ok(files.includes("beckmann-roses.md"));
  assert.ok(files.includes("beckmann-palettes.md"));
  for (const f of files) {
    const text = read(`vault/paintings/${f}`).toLowerCase();
    assert.doesNotMatch(text, /the night|die nacht|departure|abfahrt|tuxedo|smoking/,
      `${f} is a postcard beckmann`);
  }
});

test("marc hangs deer, not the blue horse postcard", () => {
  const files = list("vault/paintings").filter((f) => f.startsWith("marc-"));
  assert.ok(files.includes("marc-deer-snow.md"));
  for (const f of files) {
    const text = read(`vault/paintings/${f}`).toLowerCase();
    assert.doesNotMatch(text, /blue horse|blaues pferd/,
      `${f} is the postcard horse`);
  }
});

test("estate and living fr/it names have no hosted canvas", () => {
  const banned = [
    "Balthus", "Amédée Ozenfant", "Sonia Delaunay", "Marie Laurencin", "Jean Hélion",
    "Pierre Bonnard", "Giorgio Morandi", "Mario Sironi", "Carlo Carrà",
    "Gino Severini", "Giacomo Balla", "Lucio Fontana", "Alberto Burri",
    "Felice Casorati", "Antonio Donghi", "Filippo de Pisis", "Arturo Martini",
    "Marino Marini", "Piero Manzoni", "Fortunato Depero", "Afro Basaldella",
  ];
  for (const f of list("vault/paintings")) {
    const text = read(`vault/paintings/${f}`);
    for (const name of banned) {
      assert.doesNotMatch(text, new RegExp(`^who: ${name}$`, "m"),
        `${f} hosts a canvas for ${name}`);
    }
  }
});

test("the france pack skips waterlilies, starry night and the ballerina postcard", () => {
  const works = list("vault/paintings")
    .filter((f) => /^(caillebotte|puvis|denis|serusier|roussel|maillol|bernard|daubigny|millet|daumier|soutine|delaunay|seurat)-/.test(f))
    .map((f) => {
      const text = read(`vault/paintings/${f}`);
      const title = (/^title: (.*)$/m.exec(text) || [])[1] || "";
      return `${f}\n${title}`;
    }).join("\n");
  assert.doesNotMatch(works, /Water Lilies|Nymphéas|Starry Night|Nuit étoilée|Little Dancer|Petite danseuse|Grande Jatte|La Grande Jatte/i);
  const millet = list("vault/paintings").filter((f) => f.startsWith("millet-")).map((f) => read(`vault/paintings/${f}`)).join("\n");
  assert.doesNotMatch(millet, /Angelus|Angélus/);
});

test("caillebotte hangs the wet street, the scrapers and the bridge", () => {
  assert.ok(fs.existsSync(path.join(root, "vault/paintings/caillebotte-rainy-day.md")));
  assert.ok(fs.existsSync(path.join(root, "public/images/vault/caillebotte-rainy-day.webp")));
  assert.ok(fs.existsSync(path.join(root, "vault/paintings/caillebotte-floor-scrapers.md")));
  assert.ok(fs.existsSync(path.join(root, "vault/paintings/caillebotte-pont-europe.md")));
  const rain = read("vault/paintings/caillebotte-rainy-day.md");
  assert.match(rain, /^who: Gustave Caillebotte$/m);
  assert.doesNotMatch(rain, /^weather:/m);
});

test("serusier hangs the talisman and seurat hangs poseuses, not the island", () => {
  assert.ok(fs.existsSync(path.join(root, "vault/paintings/serusier-talisman.md")));
  assert.ok(fs.existsSync(path.join(root, "public/images/vault/serusier-talisman.webp")));
  const poseuses = read("vault/paintings/seurat-poseuses.md");
  assert.match(poseuses, /^who: Georges Seurat$/m);
  assert.match(poseuses, /Poseuses/);
  assert.doesNotMatch(poseuses, /Grande Jatte|Sunday/);
  assert.doesNotMatch(poseuses, /^weather:/m);
});

test("balthus names the gaze and hosts nothing", () => {
  const text = read("vault/people/balthus.md").toLowerCase();
  assert.match(text, /gaze|looking/, "balthus lost the caution");
  assert.match(text, /girl/, "balthus lost the subject");
  assert.match(text, /2001/, "balthus lost the estate date");
  assert.doesNotMatch(text, /^src:/m);
  for (const f of list("vault/paintings")) {
    assert.doesNotMatch(read(`vault/paintings/${f}`), /^who: Balthus$/m, `${f} hosts a balthus canvas`);
  }
});

test("sonia names the ukraine birth and sironi names the commissions", () => {
  const sonia = read("vault/people/sonia-delaunay.md").toLowerCase();
  assert.match(sonia, /hradyzk|ukraine/, "sonia lost the ua birth");
  assert.match(sonia, /ua room/, "sonia lost the cross-link");

  const sironi = read("vault/people/mario-sironi.md").toLowerCase();
  assert.match(sironi, /fascist/, "sironi lost the commission clause");
  const sironiLines = sironi.split("\n").filter((l) => /fascist/.test(l));
  assert.ok(sironiLines.length <= 2, "sironi centered the regime");

  const carra = read("vault/people/carlo-carra.md").toLowerCase();
  assert.match(carra, /regime/, "carrà lost the entanglement clause");
});

test("morandi is a person on the doctrine, not a new still life", () => {
  const person = read("vault/people/giorgio-morandi.md").toLowerCase();
  assert.match(person, /doctrine/, "morandi lost the doctrine line");
  assert.doesNotMatch(person, /^src:/m);
  for (const f of list("vault/paintings")) {
    assert.doesNotMatch(read(`vault/paintings/${f}`), /^who: Giorgio Morandi$/m, `${f} hosts a morandi canvas`);
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
