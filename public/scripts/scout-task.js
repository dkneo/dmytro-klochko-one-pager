const COLUMNS = [
  "number",
  "creator or example",
  "direct link",
  "hook or concept",
  "target audience",
  "why it could work for Replika",
  "source channel",
  "score",
  "shortlist",
];

export function buildBlankCsv(count = 30) {
  const rows = Array.from({ length: count }, (_, index) => `${index + 1},,,,,,,,`);
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
  try {
    await navigator.clipboard.writeText(COLUMNS.join("\t"));
    button.textContent = "headers copied";
  } catch {
    button.textContent = "copy unavailable";
  }
}

if (typeof document !== "undefined") {
  document.querySelector("#download-sheet")?.addEventListener("click", downloadCsv);
  document.querySelector("#copy-headers")?.addEventListener("click", (event) => copyHeaders(event.currentTarget));
}

