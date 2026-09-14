const yearFrom = (value) => {
  const match = String(value || "").match(/\b(?:1[0-9]{3}|20[0-9]{2})\b/);
  return match ? Number(match[0]) : null;
};

const mediumFamily = (value) => {
  const medium = String(value || "").toLowerCase();
  const families = [
    ["woodblock", /woodblock|woodcut|xylograph/],
    ["mezzotint", /mezzotint/],
    ["etching", /etching|aquatint/],
    ["engraving", /engraving|engraved/],
    ["lithograph", /lithograph/],
    ["watercolor", /watercolou?r|gouache/],
    ["ink", /\bink\b|sumi/],
    ["oil", /\boil\b/],
    ["tempera", /tempera/],
    ["pastel", /pastel/],
  ];
  return families.find(([, pattern]) => pattern.test(medium))?.[0] || "";
};

export function relatedWorks(anchor, candidates, limit = 4) {
  const anchorYear = yearFrom(anchor.year);
  const anchorMedium = mediumFamily(anchor.medium);
  return candidates
    .filter((item) => item.id !== anchor.id)
    .map((item) => {
      const sameMaker = Boolean(anchor.who && item.who === anchor.who);
      const sameWeather = Boolean(anchor.weather && item.weather === anchor.weather);
      const itemMedium = mediumFamily(item.medium);
      const sameMedium = Boolean(anchorMedium && itemMedium === anchorMedium);
      const itemYear = yearFrom(item.year);
      const samePeriod = anchorYear !== null && itemYear !== null && Math.abs(anchorYear - itemYear) <= 20;
      const sameCollection = Boolean(anchor.collection && item.collection === anchor.collection);
      const score = sameMaker * 100 + sameWeather * 60 + sameMedium * 30 + samePeriod * 10 + sameCollection * 4;
      const reason = sameMaker
        ? `another work by ${anchor.who}`
        : sameWeather
          ? `also filed under ${anchor.weather}`
          : sameMedium
            ? `another ${anchorMedium} work`
            : samePeriod
              ? "made in the same period"
              : sameCollection
                ? `also held by ${anchor.collection}`
                : "";
      return { item, reason, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || String(a.item.title).localeCompare(String(b.item.title)))
    .slice(0, limit)
    .map(({ item, reason }) => ({ item, reason }));
}
