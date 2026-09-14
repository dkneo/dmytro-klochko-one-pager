import { prepareCandidateQueue } from "./eidos-candidates.mjs";

const plain = (value) => String(value || "")
  .normalize("NFKD")
  .replace(/\p{Diacritic}/gu, "")
  .toLowerCase()
  .replace(/[^\p{Letter}\p{Number}]+/gu, " ")
  .trim();

const yearOf = (value) => {
  const match = String(value || "").match(/\b(1[0-9]{3}|20[0-9]{2})\b/);
  return match ? Number(match[1]) : 0;
};

const centuryOf = (value) => {
  const year = yearOf(value);
  return year ? `${Math.floor(year / 100) * 100}s` : "";
};

const makerOf = (work) => plain(work?.who) || `unknown:${work?.id || "work"}`;

/**
 * Build one finite discovery sitting from facts already present in the archive.
 *
 * A candidate's weather is search provenance, not a claim about Dmytro's
 * preference. Reasons therefore describe the source of the search plainly.
 */
export function planDiscoverySession({ candidates = [], judged = new Set(), archive = [], limit = 10 } = {}) {
  const pool = prepareCandidateQueue(candidates, judged);
  const archiveMakers = new Map();
  const archiveWeathers = new Map();
  const archiveCenturies = new Map();

  for (const work of archive) {
    const maker = makerOf(work);
    archiveMakers.set(maker, (archiveMakers.get(maker) || 0) + 1);
    const weather = plain(work.weather);
    if (weather) archiveWeathers.set(weather, (archiveWeathers.get(weather) || 0) + 1);
    const century = centuryOf(work.year);
    if (century) archiveCenturies.set(century, (archiveCenturies.get(century) || 0) + 1);
  }

  const selected = [];
  const selectedIds = new Set();
  const usedMakers = new Set();
  const pattern = ["deepen", "bridge", "stretch", "contrast", "deepen", "bridge", "stretch", "contrast", "deepen", "stretch"];

  const reasonFor = (candidate, role, previous) => {
    const maker = String(candidate.who || "this artist").trim();
    const weather = String(candidate.weather || "").trim();
    const century = centuryOf(candidate.year);
    if (role === "deepen") return `another work by ${maker}, already in your moodboard.`;
    if (role === "bridge") return `${weather} search, from an artist not yet in your moodboard.`;
    if (role === "stretch") return `the ${century} are still thin in your moodboard.`;
    if (role === "contrast") {
      const after = previous?.title ? ` after ${previous.title}` : " from the previous work";
      return `a deliberate change of period${after}.`;
    }
    return archiveMakers.has(makerOf(candidate))
      ? `one more work by ${maker}, after every available artist appeared.`
      : `a new artist for your moodboard.`;
  };

  const qualifies = (candidate, role, previous) => {
    const maker = makerOf(candidate);
    if (role === "deepen") return archiveMakers.has(maker);
    if (role === "bridge") return Boolean(candidate.weather) && archiveWeathers.has(plain(candidate.weather)) && !archiveMakers.has(maker);
    if (role === "stretch") {
      const century = centuryOf(candidate.year);
      return Boolean(century) && (archiveCenturies.get(century) || 0) <= 1 && !archiveMakers.has(maker);
    }
    if (role === "contrast") {
      const currentYear = yearOf(candidate.year);
      const previousYear = yearOf(previous?.year);
      return Boolean(previous && currentYear && previousYear && Math.abs(currentYear - previousYear) >= 100);
    }
    return true;
  };

  while (selected.length < Math.max(0, limit) && selected.length < pool.length) {
    const available = pool.filter((candidate) => !selectedIds.has(candidate.id));
    const unusedArtistAvailable = available.some((candidate) => !usedMakers.has(makerOf(candidate)));
    const previous = selected.at(-1);
    const eligible = available.filter((candidate) => {
      const maker = makerOf(candidate);
      if (previous && maker === makerOf(previous)) return false;
      return !unusedArtistAvailable || !usedMakers.has(maker);
    });
    const candidatesForPick = eligible.length ? eligible : available;
    const preferred = pattern[selected.length % pattern.length];
    const roleOrder = [preferred, "deepen", "bridge", "stretch", "contrast", "new"]
      .filter((role, index, roles) => roles.indexOf(role) === index);
    let picked;
    let role = "new";
    for (const wanted of roleOrder) {
      const found = candidatesForPick.find((candidate) => qualifies(candidate, wanted, previous));
      if (found) { picked = found; role = wanted; break; }
    }
    if (!picked) break;

    const card = {
      ...picked,
      role,
      reason: reasonFor(picked, role, previous),
      sessionPosition: selected.length + 1,
    };
    selected.push(card);
    selectedIds.add(picked.id);
    usedMakers.add(makerOf(picked));
  }

  return {
    cards: selected,
    remaining: pool.filter((candidate) => !selectedIds.has(candidate.id)),
  };
}
