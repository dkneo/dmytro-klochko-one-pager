const PUBLIC_TYPES = new Set([
  "painting", "object", "building", "poster", "print", "photograph",
  "person", "poem", "quote", "song", "writing", "bookmark",
]);

export function editorialOrder(items) {
  const pool = items.slice();
  const out = [];
  while (pool.length) {
    const previous = out.at(-1);
    let index = 0;
    if (previous) {
      const varied = pool.findIndex((item) => item.type !== previous.type && item.who !== previous.who);
      const differentType = pool.findIndex((item) => item.type !== previous.type);
      const differentMaker = pool.findIndex((item) => item.who !== previous.who);
      index = varied >= 0 ? varied : differentType >= 0 ? differentType : differentMaker >= 0 ? differentMaker : 0;
    }
    out.push(pool.splice(index, 1)[0]);
  }
  return out;
}

const paletteFor = (palettes, name) =>
  palettes.palettes.find((palette) => palette.weather === name)?.stops || [];

const evidenceFor = (items, limit = 6) => items.slice(0, limit).map((item) => item.id);

export function buildProfile(map, palettes) {
  const publicItems = map.items.filter((item) => item.type !== "link" && PUBLIC_TYPES.has(item.type));
  const collection = editorialOrder(publicItems);
  const weathers = map.weathers
    .slice()
    .sort((a, b) => a.x - b.x)
    .map((weather) => {
      const marks = publicItems.filter((item) => item.weather === weather.name && !item.unplaced);
      return {
        ...weather,
        count: marks.length,
        stops: paletteFor(palettes, weather.name),
        representative: editorialOrder(marks).slice(0, 3),
      };
    });

  const makerCounts = new Map();
  for (const item of publicItems) {
    if (!item.who) continue;
    if (/^dmytro(?: klochko)?$/i.test(item.who.trim())) continue;
    makerCounts.set(item.who, (makerCounts.get(item.who) || 0) + 1);
  }
  const recurringMakers = [...makerCounts]
    .filter(([, count]) => count > 1)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([name, count]) => ({ name, count }));

  const filedWeathers = weathers.filter((weather) => weather.count > 0);
  const fullest = filedWeathers.slice().sort((a, b) => b.count - a.count)[0];
  const firstMakers = recurringMakers.slice(0, 3);
  const visual = publicItems.filter((item) => item.src);
  const words = publicItems.filter((item) => ["poem", "quote", "song", "writing"].includes(item.type));
  const observations = [];

  if (fullest?.representative.length >= 2) {
    observations.push({
      key: "fullest-weather",
      text: `${fullest.name} is the fullest weather, with ${fullest.count} things filed there.`,
      evidence: evidenceFor(publicItems.filter((item) => item.weather === fullest.name && !item.unplaced)),
    });
  }
  if (firstMakers.length) {
    const names = firstMakers.map((maker) => maker.name.toLowerCase());
    const phrase = names.length === 1 ? names[0] : `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;
    const makerSet = new Set(firstMakers.map((maker) => maker.name));
    observations.push({
      key: "recurring-makers",
      text: `the makers i return to most are ${phrase}; each appears more than once in what i kept.`,
      evidence: evidenceFor(publicItems.filter((item) => makerSet.has(item.who))),
    });
  }
  if (visual.length >= 2 && words.length >= 2) {
    observations.push({
      key: "forms",
      text: `${visual.length} visual works sit beside ${words.length} poems, quotes, songs and pieces of writing.`,
      evidence: [...evidenceFor(visual, 3), ...evidenceFor(words, 3)],
    });
  }

  const languages = [...new Set(publicItems.map((item) => item.lang).filter(Boolean))];
  const years = publicItems
    .flatMap((item) => String(item.year || "").match(/\b(?:1[0-9]{3}|20[0-9]{2})\b/g) || [])
    .map(Number);

  return {
    collection,
    weathers,
    recurringMakers,
    observations,
    visualCount: visual.length,
    wordCount: words.length,
    languages,
    yearSpan: years.length ? [Math.min(...years), Math.max(...years)] : null,
    unfiledCount: publicItems.filter((item) => !item.weather || item.unplaced).length,
  };
}
