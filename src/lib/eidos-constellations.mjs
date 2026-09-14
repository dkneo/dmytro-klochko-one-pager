const VISUAL_TYPES = new Set(["painting", "print", "poster"]);

const MOTIFS = [
  { key: "night", title: "night, dusk and moonlight", test: /\b(night|nocturne|moon(?:light|rise)?|twilight|dusk|dawn|evening)\b/i },
  { key: "water", title: "seas, rivers and shorelines", test: /\b(sea|ocean|wave|shore|harbou?r|river|lagoon|waterfall|pond|ship|shipwreck|wreck|swim(?:mer|mers|ming)?)\b/i },
  { key: "winter", title: "snow, winter and frost", test: /\b(snow|winter|frost|ice|cold)\b/i },
  { key: "growing", title: "gardens, flowers and growing things", test: /\b(garden|flower|flowers|rose|roses|chrysanthemum|orchard|wheat|harvest|plant|tree|forest|leaf|leaves|reeds)\b/i },
  { key: "figures", title: "portraits and solitary figures", test: /\b(portrait|self[- ]portrait|woman|girl|boy|mother|child|lady|figure|sitter|odalisque)\b/i },
  { key: "interiors", title: "rooms, windows and interiors", test: /\b(interior|room|studio|window|courtyard|chamber|kitchen)\b/i },
  { key: "performance", title: "dance, theatre and performance", test: /\b(dance|dancers?|dancing|actor|actors|singer|ballet|theatre|stage|fencing)\b/i },
  { key: "animals", title: "animals as protagonists", test: /\b(deer|horse|bird|crow|swan|dog|cat|fish|monkey|eagle|pheasant|mallard)\b/i },
  { key: "mountains", title: "mountains, cliffs and volcanoes", test: /\b(mount|mountain|mountains|volcano|vesuvius|cliff|peak)\b/i },
];

const yearOf = (value) => Number(String(value || "").match(/\b(1[0-9]{3}|20[0-9]{2})\b/)?.[1] || 0);

const mediaFamily = (value) => {
  const medium = String(value || "").toLowerCase();
  if (/wood(?:block|cut)/.test(medium)) return "woodblock prints";
  if (/oil/.test(medium)) return "oil paintings";
  if (/watercolou?r/.test(medium)) return "watercolors";
  if (/lithograph/.test(medium)) return "lithographs";
  if (/etch/.test(medium)) return "etchings";
  if (/engrav/.test(medium)) return "engravings";
  if (/tempera/.test(medium)) return "tempera";
  if (/pastel/.test(medium)) return "pastels";
  if (/charcoal|chalk/.test(medium)) return "drawings";
  return "";
};

const grouped = (works, keyFor) => {
  const groups = new Map();
  for (const work of works) {
    const key = keyFor(work);
    if (!key) continue;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(work);
  }
  return groups;
};

const byStrength = (a, b) => b.count - a.count || a.title.localeCompare(b.title);

/** Repeated, inspectable facts. No score and no claim about personality. */
export function buildConstellations(input = []) {
  const works = input.filter((work) => work.src && VISUAL_TYPES.has(work.type));

  const motifs = MOTIFS
    .map((motif) => {
      const evidence = works.filter((work) => motif.test.test(String(work.title || work.line || "")));
      return {
        key: motif.key,
        kind: "motif",
        title: motif.title,
        count: evidence.length,
        basis: `${evidence.length} kept titles name this thread.`,
        evidence,
      };
    })
    .filter((group) => group.count >= 3)
    .sort(byStrength);

  const artists = [...grouped(works, (work) => String(work.who || "").trim())]
    .filter(([name, evidence]) => name && !/^dmytro(?: klochko)?$/i.test(name) && evidence.length >= 3)
    .map(([title, evidence]) => ({
      key: `artist:${title.toLowerCase()}`,
      kind: "artist",
      title,
      count: evidence.length,
      basis: `${evidence.length} works kept.`,
      evidence,
    }))
    .sort(byStrength);

  const media = [...grouped(works, (work) => mediaFamily(work.medium))]
    .filter(([title, evidence]) => title && evidence.length >= 3)
    .map(([title, evidence]) => ({
      key: `medium:${title}`,
      kind: "medium",
      title,
      count: evidence.length,
      basis: `${evidence.length} sourced records use this medium.`,
      evidence,
    }))
    .sort(byStrength);

  const periods = [...grouped(works, (work) => {
    const year = yearOf(work.year);
    return year ? `${Math.floor(year / 100) * 100}s` : "";
  })]
    .filter(([title]) => title)
    .map(([title, evidence]) => ({ title, count: evidence.length, evidence }))
    .sort((a, b) => Number(a.title.slice(0, 4)) - Number(b.title.slice(0, 4)));

  const dated = works.filter((work) => work.added).slice().sort((a, b) => String(b.added).localeCompare(String(a.added)));
  const latestDate = dated[0]?.added || "";
  const latest = latestDate ? dated.filter((work) => work.added === latestDate) : [];
  const thinPeriod = periods.filter((period) => period.count > 0).slice().sort((a, b) => a.count - b.count || a.title.localeCompare(b.title))[0];
  const favorite = works.filter((work) => work.favorite);

  return {
    works,
    motifs,
    artists,
    media,
    periods,
    latest,
    latestDate,
    favorite,
    makerCount: new Set(works.map((work) => work.who).filter(Boolean)).size,
    yearSpan: periods.length ? [periods[0].title, periods.at(-1).title] : [],
    learningIntent: thinPeriod
      ? {
          title: `look past the familiar into the ${thinPeriod.title}.`,
          detail: `only ${thinPeriod.count} kept ${thinPeriod.count === 1 ? "work is" : "works are"} dated there. the next sitting can test whether that is a gap or a boundary.`,
          period: thinPeriod.title,
        }
      : null,
  };
}
