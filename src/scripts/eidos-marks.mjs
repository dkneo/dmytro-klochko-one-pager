// One mapper for every view of the map in space (/eidos/orbit, and the small
// turning one on the main page), so the geometry can never drift between
// them: x and y are the solved axes, z is the weathers ordered by their own
// temperature — cold moods deepest, warm ones near.

const GLYPH = { painting: "▣", object: "◈", building: "⌂", poem: "❞", song: "♪", quote: "“", link: "↗", person: "◉", writing: "¶" };

export function toMarks(map) {
  const weathersByWarmth = map.weathers.slice().sort((a, b) => a.x - b.x);
  const stratum = new Map(weathersByWarmth.map((w, i) => [w.name, i]));
  const W = weathersByWarmth.length;

  const thumbFor = (src) => src
    .replace("/images/", "/images/thumbs/")
    .replace(/\.[^.]+$/, ".webp");

  const marks = map.items.map((it, i) => ({
    id: it.id,
    t: it.type,
    who: it.who || "",
    line: it.line || it.title || "",
    year: it.year || "",
    x: it.x * 4.4,
    y: -it.y * 3.4,
    z: ((stratum.get(it.weather) ?? (W - 1) / 2) - (W - 1) / 2) * 1.05
       + (((i * 2654435761) % 100) / 100 - 0.5) * 0.55, // deterministic jitter
    thumb: it.src ? thumbFor(it.src) : null,
    glyph: GLYPH[it.type] || "·",
  }));

  const index = new Map(marks.map((m, i) => [m.id, i]));
  const threads = map.threads.flatMap((t) => {
    const pairs = [];
    for (let i = 0; i < t.ids.length - 1; i++) {
      const a = index.get(t.ids[i]), b = index.get(t.ids[i + 1]);
      if (a != null && b != null) pairs.push([a, b]);
    }
    return pairs;
  });

  return { marks, threads };
}
