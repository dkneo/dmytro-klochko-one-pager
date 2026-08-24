const COLUMNS = [
  "number",
  "creator or example",
  "direct link",
  "source channel",
  "hook or concept",
  "target audience",
  "why it could work for Replika",
  "hook clarity (0-2)",
  "Replika fit (0-2)",
  "creator naturalness (0-2)",
  "production usability (0-2)",
  "distinctiveness (0-2)",
  "total score (0-10)",
  "shortlist",
  "review notes",
];

export function buildBlankCsv(count = 30) {
  const emptyCells = ",".repeat(COLUMNS.length - 1);
  const rows = Array.from({ length: count }, (_, index) => `${index + 1}${emptyCells}`);
  return `${COLUMNS.join(",")}\n${rows.join("\n")}\n`;
}

export function scoreExample(values) {
  const score = values.reduce((total, value) => total + Math.max(0, Math.min(2, Number(value) || 0)), 0);
  const verdict = score >= 8 ? "shortlist" : score >= 5 ? "discuss" : "do not shortlist";
  return { score, verdict };
}

function downloadCsv() {
  const url = URL.createObjectURL(new Blob([buildBlankCsv()], { type: "text/csv;charset=utf-8" }));
  const link = Object.assign(document.createElement("a"), { href: url, download: "taso-ugc-30.csv" });
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

async function copyHeaders(button) {
  const originalLabel = button.textContent;
  try {
    await navigator.clipboard.writeText(COLUMNS.join("\t"));
    button.textContent = "headers copied";
  } catch {
    button.textContent = "copy unavailable";
  }
  window.setTimeout(() => {
    button.textContent = originalLabel;
  }, 1600);
}

if (typeof document !== "undefined") {
  document.querySelector("#download-sheet")?.addEventListener("click", downloadCsv);
  document.querySelector("#copy-headers")?.addEventListener("click", (event) => copyHeaders(event.currentTarget));
}
