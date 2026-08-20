export const BACKUP_FORMAT = "scout-school-backup";
export const STORAGE_KEY = "scout-school";
export const FIELDS = Object.freeze([
  "handle",
  "platform",
  "niche",
  "rate",
  "contact",
  "status",
  "touch",
  "action",
  "date",
]);
export const STATUSES = Object.freeze([
  "found",
  "contacted",
  "replied",
  "negotiating",
  "brief sent",
  "content in",
  "live in ads",
  "closed",
]);

const VERSION = 1;
const FIELD_LIMITS = {
  handle: 200,
  platform: 100,
  niche: 300,
  rate: 100,
  contact: 300,
  touch: 40,
  action: 500,
  date: 40,
};

const record = (value) => value && typeof value === "object" && !Array.isArray(value)
  ? value
  : {};

const idFrom = () => globalThis.crypto?.randomUUID?.()
  || `row-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

export function emptyState() {
  return { version: VERSION, days: {}, quiz: {}, drill: {}, rows: [] };
}

export function normalizeRow(value, options = {}) {
  const row = record(value);
  const idFactory = options.idFactory || idFrom;
  const normalized = {
    id: String(row.id || idFactory()).trim().slice(0, 200),
  };

  for (const field of FIELDS) {
    if (field === "status") {
      normalized.status = STATUSES.includes(row.status) ? row.status : "found";
      continue;
    }
    normalized[field] = String(row[field] ?? "").trim().slice(0, FIELD_LIMITS[field]);
  }
  normalized.example = row.example === true;
  return normalized;
}

function normalizedState(value, options = {}) {
  const state = record(value);
  return {
    version: VERSION,
    days: { ...record(state.days) },
    quiz: { ...record(state.quiz) },
    drill: { ...record(state.drill) },
    rows: Array.isArray(state.rows)
      ? state.rows.map((row) => normalizeRow(row, options))
      : [],
  };
}

export function loadState(raw, options = {}) {
  if (raw == null || raw === "") return { state: emptyState(), issue: null };

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { state: emptyState(), issue: "invalid-json" };
  }
  if (!record(parsed).version) {
    return { state: normalizedState(parsed, options), issue: "migrated" };
  }
  if (parsed.version !== VERSION) {
    return { state: emptyState(), issue: "unsupported-version" };
  }
  return { state: normalizedState(parsed, options), issue: null };
}

const csvCell = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;

export function toCsv(rows) {
  const lines = (Array.isArray(rows) ? rows : []).map((row) =>
    FIELDS.map((field) => csvCell(row?.[field])).join(","));
  return `${FIELDS.join(",")}\n${lines.join("\n")}`;
}

export function serializeBackup(state, exportedAt = new Date().toISOString()) {
  return JSON.stringify({
    format: BACKUP_FORMAT,
    exportedAt,
    state: normalizedState(state),
  }, null, 2);
}

export function parseBackup(raw) {
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { state: null, issue: "invalid-json" };
  }
  if (parsed?.format !== BACKUP_FORMAT) return { state: null, issue: "wrong-format" };
  const loaded = loadState(JSON.stringify(parsed.state));
  if (loaded.issue) return { state: null, issue: loaded.issue };
  return loaded;
}

const identity = (row) => {
  const handle = String(row.handle || "").trim().toLowerCase();
  const platform = String(row.platform || "").trim().toLowerCase();
  return handle ? `${platform}|${handle}` : `id|${row.id}`;
};

export function mergeRows(current, incoming, mode = "merge") {
  const existing = Array.isArray(current) ? current : [];
  const additions = Array.isArray(incoming) ? incoming : [];
  if (mode === "replace") return additions.slice();

  const merged = existing.slice();
  const positions = new Map(merged.map((row, index) => [identity(row), index]));
  for (const row of additions) {
    const key = identity(row);
    const index = positions.get(key);
    if (index == null) {
      positions.set(key, merged.length);
      merged.push(row);
    } else {
      merged[index] = { ...row, id: merged[index].id };
    }
  }
  return merged;
}

export function removeRow(rows, id) {
  const source = Array.isArray(rows) ? rows : [];
  const index = source.findIndex((row) => row.id === id);
  if (index < 0) return { rows: source.slice(), removed: null, index: -1 };
  return {
    rows: source.filter((_, rowIndex) => rowIndex !== index),
    removed: source[index],
    index,
  };
}

export function restoreRow(rows, removal) {
  const restored = Array.isArray(rows) ? rows.slice() : [];
  if (!removal?.removed || removal.index < 0) return restored;
  restored.splice(Math.min(removal.index, restored.length), 0, removal.removed);
  return restored;
}

