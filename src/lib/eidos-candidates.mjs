const plain = (value) => String(value || "")
  .normalize("NFKD")
  .replace(/\p{Diacritic}/gu, "")
  .toLowerCase()
  .replace(/&amp;/g, "and")
  .replace(/[^\p{Letter}\p{Number}]+/gu, " ")
  .trim();

const titleCore = (value) => plain(String(value || "")
  .replace(/^(?:\s*\d{3,4}\s*[-–—:]\s*)+/, "")
  .replace(/\s*[-–—]\s*(?:DPLA|NARA)\s*[-–—]\s*[a-f0-9]+.*$/i, "")
  .replace(/\([^)]*\)/g, " ")
  .replace(/,?\s+also known as[\s\S]*$/i, " "));

/** A museum edition or a differently restored file is still the same work. */
export function canonicalWorkKey(candidate) {
  const title = titleCore(candidate?.title);
  const maker = plain(candidate?.who);

  // Commons and museum catalogues name Hokusai's print three different ways.
  // The place and the wave are the stable identity across those records.
  if (/kanagawa/.test(title) && /(?:wave|浪)/u.test(String(candidate?.title || "").toLowerCase())) {
    return "work:great-wave-kanagawa";
  }

  if (title && title.split(" ").length >= 5) return `work:${title}`;
  if (title && title.split(" ").length >= 2) return `work:${maker}:${title}`;

  const source = plain(decodeURIComponent(String(candidate?.source || candidate?.remote || "").replace(/[?#].*$/, "")));
  return `file:${source || candidate?.id || title}`;
}

/** Collapse alternate files/editions while retaining every verdict id. */
export function groupCandidateEditions(candidates) {
  const groups = new Map();
  for (const candidate of candidates || []) {
    const key = canonicalWorkKey(candidate);
    const ids = [...new Set([...(candidate.verdictIds || []), candidate.id].filter(Boolean))];
    if (!groups.has(key)) {
      groups.set(key, { ...candidate, workKey: key, verdictIds: ids });
      continue;
    }
    const representative = groups.get(key);
    representative.verdictIds = [...new Set([...representative.verdictIds, ...ids])];
  }
  return [...groups.values()];
}

/** Show one work by every available maker before the second by any maker. */
export function artistRoundRobin(candidates) {
  const buckets = new Map();
  for (const candidate of candidates || []) {
    const maker = plain(candidate.who) || `unknown:${candidate.id}`;
    if (!buckets.has(maker)) buckets.set(maker, []);
    buckets.get(maker).push(candidate);
  }

  const result = [];
  let round = 0;
  while ([...buckets.values()].some((bucket) => bucket[round])) {
    for (const bucket of buckets.values()) if (bucket[round]) result.push(bucket[round]);
    round += 1;
  }
  return result;
}

export function canOfferArtist(candidate, counts, maximum = 2) {
  const maker = plain(candidate?.who);
  return Boolean(maker) && (counts?.get(maker) || 0) < maximum;
}

export function isCommonsUserCredit(value) {
  return /(?:commons\.wikimedia\.org\/wiki\/User:|title=["']User:)/i.test(String(value || ""));
}

export function prepareCandidateQueue(candidates, judged = new Set()) {
  const decided = judged instanceof Set ? judged : new Set(judged || []);
  const unseen = groupCandidateEditions(candidates)
    .filter((candidate) => !candidate.verdictIds.some((id) => decided.has(id)));
  return artistRoundRobin(unseen);
}

/**
 * Reconcile the remote judgment ledger with the vault before writing notes.
 *
 * Editions collapse into one work, but every source verdict id stays attached
 * to that work. Existing works become aliases instead of duplicate notes, and
 * incomplete records stop at the boundary rather than inventing attribution.
 */
export function planCandidateImports({ candidates = [], verdicts = {}, existing = [], allowedTypes } = {}) {
  const kept = (candidates || []).filter((candidate) => {
    const verdict = verdicts?.[candidate.id]?.verdict;
    return verdict === "keep" || verdict === "favorite";
  });

  const existingByWork = new Map();
  const existingById = new Map();
  for (const work of existing || []) {
    const key = canonicalWorkKey(work);
    if (!existingByWork.has(key)) existingByWork.set(key, work);
    if (work.id) existingById.set(work.id, work);
  }

  const ready = [];
  const represented = [];
  const blocked = [];
  const held = [];
  const allowed = allowedTypes ? new Set(allowedTypes) : null;

  for (const candidate of groupCandidateEditions(kept)) {
    const groupedVerdicts = candidate.verdictIds
      .map((id) => verdicts?.[id])
      .filter(Boolean);
    const item = {
      ...candidate,
      favorite: groupedVerdicts.some((verdict) => verdict.verdict === "favorite"),
    };

    if (allowed && !allowed.has(candidate.type || "painting")) {
      held.push({ ...item, reason: "outside-primary-collection" });
      continue;
    }

    const existingWork = candidate.verdictIds
      .map((id) => existingById.get(id))
      .find(Boolean)
      || existingByWork.get(candidate.workKey);
    if (existingWork) {
      represented.push({ ...item, existingId: existingWork.id });
      continue;
    }

    const missing = [];
    if (!String(candidate.who || "").trim()) missing.push("maker");
    if (!String(candidate.source || "").trim()) missing.push("source");
    if (!String(candidate.src || "").trim()) missing.push("image");
    if (missing.length) {
      blocked.push({ ...item, missing });
      continue;
    }

    ready.push(item);
  }

  return { ready, represented, blocked, held };
}
