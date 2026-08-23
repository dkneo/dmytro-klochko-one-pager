// The small turning constellation on the main page: the eidos marks, live,
// as a shape you can catch and turn with a finger. No tooltips, no zoom —
// reading happens on /eidos; this is the shape, seen from the porch.

import * as THREE from "three";

export function start(host, data) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
  } catch {
    return false;
  }
  const { marks, threads } = data;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const rect = () => host.getBoundingClientRect();
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(46, rect().width / rect().height, 0.1, 100);
  camera.position.z = 12.5;
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.setSize(rect().width, rect().height);
  host.prepend(renderer.domElement);

  const group = new THREE.Group();
  scene.add(group);

  const css = getComputedStyle(document.documentElement);
  const tone = (v, fall) => (css.getPropertyValue(v) || fall).trim() || fall;
  const COLORS = {
    painting: tone("--bone", "#ece6d9"),
    quote: tone("--quiet", "#c4beb0"),
    poem: tone("--bone", "#ece6d9"),
    song: tone("--cold", "#7fd4d9"),
    link: tone("--dim", "#a9aecb"),
    person: tone("--hot", "#ff9bc0"),
    writing: tone("--bone", "#ece6d9"),
  };

  const glyphTexture = (glyph, color) => {
    const S = 96;
    const c = document.createElement("canvas");
    c.width = c.height = S;
    const g = c.getContext("2d");
    g.font = "500 64px ui-monospace, Menlo, monospace";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillStyle = color;
    g.fillText(glyph, S / 2, S / 2 + 4);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  };

  const loader = new THREE.TextureLoader();
  for (const m of marks) {
    let mat;
    if (m.thumb) {
      const t = loader.load(m.thumb);
      t.colorSpace = THREE.SRGBColorSpace;
      mat = new THREE.SpriteMaterial({ map: t, depthWrite: false });
    } else {
      mat = new THREE.SpriteMaterial({
        map: glyphTexture(m.glyph, COLORS[m.t] || "#ece6d9"),
        depthWrite: false,
        transparent: true,
      });
    }
    const s = new THREE.Sprite(mat);
    s.position.set(m.x, m.y, m.z);
    const size = m.thumb ? 0.58 : 0.4;
    s.scale.set(size, size, 1);
    group.add(s);
  }

  if (threads.length) {
    const pos = new Float32Array(threads.length * 6);
    threads.forEach(([a, b], i) => {
      pos.set([marks[a].x, marks[a].y, marks[a].z, marks[b].x, marks[b].y, marks[b].z], i * 6);
    });
    const tg = new THREE.BufferGeometry();
    tg.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    group.add(new THREE.LineSegments(tg, new THREE.LineBasicMaterial({
      color: tone("--bone", "#ece6d9"), transparent: true, opacity: 0.13, depthWrite: false,
    })));
  }

  // catch and turn; vertical stays the page's scroll
  let rotY = -0.3, vy = 0, dragging = false, lx = 0;
  host.addEventListener("pointerdown", (e) => {
    dragging = true; lx = e.clientX;
    host.setPointerCapture(e.pointerId);
  });
  host.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    vy = (e.clientX - lx) * 0.005;
    rotY += vy;
    lx = e.clientX;
  });
  const drop = () => { dragging = false; };
  host.addEventListener("pointerup", drop);
  host.addEventListener("pointercancel", drop);

  let last = performance.now();
  const tick = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (!dragging) {
      rotY += vy;
      vy *= 0.94;
      if (!reduced) rotY += 0.05 * dt;
    }
    group.rotation.y = rotY;
    group.rotation.x = 0.07;
    renderer.render(scene, camera);
  };
  renderer.setAnimationLoop(tick);

  addEventListener("resize", () => {
    const r = rect();
    camera.aspect = r.width / r.height;
    camera.updateProjectionMatrix();
    renderer.setSize(r.width, r.height);
  }, { passive: true });

  document.addEventListener("visibilitychange", () => {
    renderer.setAnimationLoop(document.hidden ? null : tick);
    last = performance.now();
  });

  return true;
}
