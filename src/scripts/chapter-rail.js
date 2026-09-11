export function setupChapterRail(doc = document, view = window) {
  const rail = doc.querySelector?.(".chapter-rail");
  const compass = doc.querySelector?.(".chapter-compass");
  const chapterLabel = doc.querySelector?.("[data-chapter-label]");
  const chapterCount = doc.querySelector?.("[data-chapter-count]");
  const links = [...doc.querySelectorAll(".chapter-rail [data-chapter]")];
  const sections = [...new Map(links
    .map((link) => [link.dataset.chapter, doc.getElementById(link.dataset.chapter)])
    .filter(([, section]) => Boolean(section))).values()];
  if (!links.length || !sections.length) return;

  let current = "";
  let queued = false;

  if (rail) rail.dataset.enhanced = "";

  const closeCompass = () => {
    if (compass) compass.open = false;
  };

  for (const link of links) link.addEventListener?.("click", closeCompass);
  doc.addEventListener?.("keydown", (event) => {
    if (event.key === "Escape") closeCompass();
  });

  const update = () => {
    queued = false;
    const readingLine = view.innerHeight * 0.42;
    let best = sections[0];
    let distance = Infinity;
    for (const section of sections) {
      const rect = section.getBoundingClientRect();
      const within = rect.top <= readingLine && rect.bottom >= readingLine;
      const nextDistance = within
        ? 0
        : Math.min(Math.abs(rect.top - readingLine), Math.abs(rect.bottom - readingLine));
      if (nextDistance < distance) {
        best = section;
        distance = nextDistance;
      }
    }
    const visible = (Number(view.scrollY) || 0) > Math.min(180, view.innerHeight * 0.25);
    if (rail) rail.dataset.visible = String(visible);

    if (best.id !== current) {
      current = best.id;
      for (const link of links) {
        if (link.dataset.chapter === current) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      }

      const index = sections.findIndex((section) => section.id === current);
      const source = links.find((link) => link.dataset.chapter === current);
      if (chapterLabel) chapterLabel.textContent = source?.dataset.chapterName || current;
      if (chapterCount) {
        chapterCount.textContent = `${String(index + 1).padStart(2, "0")} / ${String(sections.length).padStart(2, "0")}`;
      }
    }
  };

  const queue = () => {
    if (queued) return;
    queued = true;
    view.requestAnimationFrame(update);
  };

  view.addEventListener("scroll", queue, { passive: true });
  view.addEventListener("resize", queue);
  update();
}
