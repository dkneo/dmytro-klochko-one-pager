export function setupChapterRail(doc = document, view = window) {
  const links = [...doc.querySelectorAll(".chapter-rail [data-chapter]")];
  const sections = links
    .map((link) => doc.getElementById(link.dataset.chapter))
    .filter(Boolean);
  if (!links.length || !sections.length) return;

  let current = "";
  let queued = false;

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
    if (best.id === current) return;
    current = best.id;
    for (const link of links) {
      if (link.dataset.chapter === current) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
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
