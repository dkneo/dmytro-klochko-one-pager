export function parseCentimetres(value) {
  const text = String(value || "");
  const matches = [...text.matchAll(/\(([^()]*)\s*cm\)/gi)];
  for (const match of matches) {
    const values = match[1].match(/\d+(?:\.\d+)?/g)?.map(Number) || [];
    if (values.length >= 2 && values[0] > 0 && values[1] > 0) {
      return { heightCm: values[0], widthCm: values[1] };
    }
  }
  return {};
}

/** Turn the Met's public API response into fields the vault already knows. */
export function metArtworkRecord(record, checkedOn = new Date().toISOString().slice(0, 10)) {
  const dimensions = parseCentimetres(record?.dimensions);
  const gallery = String(record?.GalleryNumber || "").trim();
  return {
    collection: "The Metropolitan Museum of Art",
    collectionCity: "New York",
    collectionUrl: record?.objectURL || (record?.objectID
      ? `https://www.metmuseum.org/art/collection/search/${record.objectID}`
      : ""),
    ...(record?.medium ? { medium: String(record.medium).trim() } : {}),
    ...dimensions,
    ...(gallery ? {
      displayStatus: `on view · gallery ${gallery}`,
      statusChecked: checkedOn,
    } : {}),
  };
}

export function mergeArtworkFrontmatter(markdown, record = {}) {
  const text = String(markdown || "");
  if (!text.startsWith("---\n")) throw new Error("artwork note has no frontmatter");
  const end = text.indexOf("\n---", 4);
  if (end === -1) throw new Error("artwork note has unterminated frontmatter");
  const head = text.slice(4, end);
  const q = (value) => JSON.stringify(String(value));
  const fields = [
    ["collection", record.collection, q],
    ["collection_city", record.collectionCity, q],
    ["collection_url", record.collectionUrl, q],
    ["medium", record.medium, q],
    ["height_cm", Number(record.heightCm) > 0 ? Number(record.heightCm) : "", String],
    ["width_cm", Number(record.widthCm) > 0 ? Number(record.widthCm) : "", String],
    ["display_status", record.displayStatus, q],
    ["status_checked", record.statusChecked, q],
  ];
  const additions = fields
    .filter(([key, value]) => value !== "" && value != null && !new RegExp(`^${key}:`, "m").test(head))
    .map(([key, value, format]) => `${key}: ${format(value)}`);
  if (!additions.length) return text;
  return `${text.slice(0, end)}\n${additions.join("\n")}${text.slice(end)}`;
}

export async function fetchMetRecord(id, {
  fetcher = fetch,
  pause = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds)),
  attempts = 3,
} = {}) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const response = await fetcher(
      `https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`,
      { headers: { "user-agent": "dmklochko-site/1.0 (https://dmklochko.com)" } },
    );
    if (response.ok) return response.json();
    const retryable = response.status === 403 || response.status === 429 || response.status >= 500;
    if (!retryable || attempt === attempts - 1) throw new Error(`${response.status} from the Met API`);
    await pause(750 * (attempt + 1));
  }
  throw new Error("the Met API did not answer");
}
