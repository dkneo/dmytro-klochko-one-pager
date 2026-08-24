const STORAGE_KEY = "motion1";

export function motionPolicy({ width, fine, reduced, saveData, paused }) {
  const rich = width > 900 && fine && !reduced && !saveData;
  const still = reduced || paused;
  return { rich, paused: still, autoplay: rich && !still };
}

export function setupMotionControl() {
  const root = document.documentElement;
  const buttons = [...document.querySelectorAll(".motion-btn")];
  const videos = [...document.querySelectorAll("video[data-ambient-video]")];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const richScreen = matchMedia("(min-width: 901px) and (hover: hover) and (pointer: fine)");
  const visible = new WeakSet();
  let userPaused = false;
  let policy;

  try { userPaused = localStorage.getItem(STORAGE_KEY) === "paused"; } catch {}

  const syncVideo = (video) => {
    if (policy.autoplay && visible.has(video) && !document.hidden) {
      video.preload = "auto";
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  };

  const apply = () => {
    policy = motionPolicy({
      width: innerWidth,
      fine: richScreen.matches,
      reduced: reduced.matches,
      saveData: Boolean(navigator.connection?.saveData),
      paused: userPaused,
    });
    root.dataset.motionTier = policy.rich ? "rich" : "quiet";
    root.dataset.motion = policy.paused ? "paused" : "running";

    for (const button of buttons) {
      const label = button.querySelector(".motion-label");
      button.setAttribute("aria-pressed", String(policy.paused));
      button.setAttribute("aria-label", policy.paused ? "resume motion" : "pause motion");
      if (label) label.textContent = policy.paused ? "motion" : "still";
    }
    for (const video of videos) syncVideo(video);
    dispatchEvent(new CustomEvent("site-motion-change", { detail: policy }));
  };

  for (const button of buttons) {
    button.addEventListener("click", () => {
      userPaused = !userPaused;
      try { localStorage.setItem(STORAGE_KEY, userPaused ? "paused" : "running"); } catch {}
      apply();
    });
  }

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) visible.add(entry.target);
        else visible.delete(entry.target);
        syncVideo(entry.target);
      }
    }, { rootMargin: "160px 0px" });
    for (const video of videos) observer.observe(video);
  }

  for (const media of [reduced, richScreen]) media.addEventListener("change", apply);
  addEventListener("resize", apply, { passive: true });
  document.addEventListener("visibilitychange", () => videos.forEach(syncVideo));
  apply();
  return policy;
}
