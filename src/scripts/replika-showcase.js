export function selectReplikaClip(stage, buttons, selected, label, count, backdrop) {
  if (!stage || !selected || selected.getAttribute("aria-pressed") === "true") return;

  const { src, poster, label: nextLabel, index } = selected.dataset;
  if (!src || !poster || !nextLabel || !index) return;

  stage.pause();
  stage.src = src;
  stage.poster = poster;
  stage.load();

  for (const button of buttons) {
    button.setAttribute("aria-pressed", button === selected ? "true" : "false");
  }

  if (label) label.textContent = nextLabel;
  if (count) count.textContent = `${String(index).padStart(2, "0")} / ${String(buttons.length).padStart(2, "0")}`;
  if (backdrop) backdrop.style.backgroundImage = `url("${poster}")`;

  const playing = stage.play();
  if (playing?.catch) playing.catch(() => {});
}

export function setupReplikaShowcase(doc = document) {
  const stage = doc.querySelector("[data-replika-stage]");
  const buttons = [...doc.querySelectorAll("[data-replika-pick]")];
  if (!stage || !buttons.length) return;

  const showcase = stage.closest(".replika-showcase");
  const label = showcase?.querySelector("[data-replika-label]");
  const count = showcase?.querySelector("[data-replika-count]");
  const backdrop = showcase?.querySelector(".replika-stage-backdrop");

  for (const button of buttons) {
    button.addEventListener("click", () => {
      selectReplikaClip(stage, buttons, button, label, count, backdrop);
    });
  }
}
