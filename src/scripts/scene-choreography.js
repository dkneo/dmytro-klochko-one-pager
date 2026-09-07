const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

export function sceneWeights(boundaryTops, viewportHeight, readingRatio = 0.42, spanRatio = 0.24) {
  const readingLine = viewportHeight * readingRatio;
  const span = Math.max(1, viewportHeight * spanRatio);
  const half = span / 2;
  const progress = boundaryTops.map((top) => clamp((readingLine + half - top) / span));
  const weights = [1 - (progress[0] || 0)];

  for (let index = 0; index < progress.length - 1; index += 1) {
    weights.push(progress[index] - progress[index + 1]);
  }
  if (progress.length) weights.push(progress.at(-1));
  return weights;
}

export function setupSceneChoreography(doc = document, view = window) {
  const root = doc.documentElement;
  const sky = doc.querySelector(".scenes");
  const sections = [...doc.querySelectorAll("[data-scene]")];
  if (!root || !sky || !sections.length) return;

  const acts = [];
  for (const section of sections) {
    const last = acts.at(-1);
    if (last?.scene === section.dataset.scene) continue;
    acts.push({
      section,
      scene: section.dataset.scene,
      weather: section.dataset.weather || section.dataset.scene,
      layer: sky.querySelector(`[data-s="${section.dataset.scene}"]`),
    });
  }

  root.dataset.scene = acts[0].scene;
  root.dataset.weather = acts[0].weather;

  let queued = false;
  const update = () => {
    queued = false;
    const weights = sceneWeights(
      acts.slice(1).map((act) => act.section.getBoundingClientRect().top),
      view.innerHeight,
    );
    let active = 0;
    for (let index = 0; index < acts.length; index += 1) {
      acts[index].layer?.style.setProperty("--scene-opacity", weights[index].toFixed(4));
      if (weights[index] >= weights[active]) active = index;
    }
    root.style.setProperty(
      "--fire-weather-opacity",
      String(acts[0].weather === "fire" ? weights[0].toFixed(4) : 0),
    );
    root.dataset.scene = acts[active].scene;
    root.dataset.weather = acts[active].weather;
  };

  const queue = () => {
    if (queued) return;
    queued = true;
    view.requestAnimationFrame(update);
  };

  if (acts.length > 1) sky.dataset.progressive = "";
  view.addEventListener("scroll", queue, { passive: true });
  view.addEventListener("resize", queue, { passive: true });
  update();

  const warm = () => {
    for (const layer of sky.querySelectorAll("i[data-s]")) {
      const image = new Image();
      image.src = `/images/scenes/${layer.dataset.s}.webp`;
    }
  };
  if ("requestIdleCallback" in view) view.requestIdleCallback(warm, { timeout: 4000 });
  else view.setTimeout(warm, 2500);
}
