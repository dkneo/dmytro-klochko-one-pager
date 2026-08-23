// The petal field: the nine CSS petals, given the one thing CSS cannot give
// them — depth. Same shape (border-radius 100% 6% 100% 6%), same two pinks
// (--hot-lit into --hot), same unhurried fall; but a hundred of them spread
// through real z, tumbling on two axes, leaning with a slow wind, and parting
// slightly around the cursor.
//
// This module is loaded on idle, and only when motion is welcome and WebGL
// exists. If it never loads, the CSS petals keep falling: they are the
// fallback, not a casualty. When it does load, `sky-3d` on <html> stands the
// CSS ones down.
//
// Derived, not invented: no new art. The texture is the CSS petal redrawn
// pixel for pixel; three.js only lends it space.

import * as THREE from "three";

const HOT = "#ff9bc0";
const HOT_LIT = "#ffd3df";
const EMBER = "#ffd2a3";
const EMBER_DEEP = "#f08a54";
const SNOW = "rgb(244 240 230)";

// a soft round sprite: the css radial-gradient dot, redrawn
function dotTexture(inner, outer) {
  const S = 64;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const g = c.getContext("2d");
  const grad = g.createRadialGradient(S * 0.35, S * 0.35, S * 0.05, S * 0.5, S * 0.5, S * 0.5);
  grad.addColorStop(0, inner);
  grad.addColorStop(0.65, outer);
  grad.addColorStop(1, "rgb(0 0 0 / 0%)");
  g.fillStyle = grad;
  g.fillRect(0, 0, S, S);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function petalTexture() {
  const S = 128;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const g = c.getContext("2d");

  // css border-radius 100% 6% 100% 6% on a square, normalized: the two big
  // corners shrink to S/1.06 so they can share the box.
  const R = S / 1.06, r = 0.06 * S / 1.06;
  g.beginPath();
  g.arc(R, R, R, Math.PI, Math.PI * 1.5);          // top-left, the big sweep
  g.arc(S - r, r, r, Math.PI * 1.5, Math.PI * 2);  // top-right, nearly sharp
  g.arc(S - R, S - R, R, 0, Math.PI * 0.5);        // bottom-right, big
  g.arc(r, S - r, r, Math.PI * 0.5, Math.PI);      // bottom-left, sharp
  g.closePath();

  const grad = g.createRadialGradient(S * 0.3, S * 0.3, S * 0.04, S * 0.3, S * 0.3, S * 0.9);
  grad.addColorStop(0, HOT_LIT);
  grad.addColorStop(1, HOT);
  g.fillStyle = grad;
  g.fill();

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function start() {
  if (document.documentElement.classList.contains("sky-3d")) return;
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
  } catch {
    return; // no WebGL: the CSS petals never hear about any of this
  }

  // The css sky had nine petals; this is those nine given air, not a storm.
  // Most of the field sits far away and small — near passes stay rare.
  const fine = matchMedia("(pointer: fine)").matches;
  const N = innerWidth < 720 ? 26 : 44;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 100);
  camera.position.z = 10;

  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.setSize(innerWidth, innerHeight);
  const canvas = renderer.domElement;
  canvas.style.cssText = "position:fixed;inset:0;z-index:2;pointer-events:none";
  canvas.setAttribute("aria-hidden", "true");
  document.body.appendChild(canvas);
  document.documentElement.classList.add("sky-3d");

  // world height at z=0, so pixel sizes translate faithfully
  const worldH = (z) => 2 * (camera.position.z - z) * Math.tan((camera.fov * Math.PI) / 360);
  const worldW = (z) => worldH(z) * camera.aspect;

  const geo = new THREE.PlaneGeometry(1, 1);
  const mat = new THREE.MeshBasicMaterial({
    map: petalTexture(),
    transparent: true,
    opacity: 0.42,         // the css petals live at 0.3–0.5
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.InstancedMesh(geo, mat, N + 24); // headroom for lisa
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  scene.add(mesh);

  const M = new THREE.Matrix4();
  const Q = new THREE.Quaternion();
  const E = new THREE.Euler();
  const V = new THREE.Vector3();
  const SC = new THREE.Vector3();
  const HIDE = new THREE.Matrix4().makeScale(0, 0, 0);

  // ── the weather, with depth ─────────────────────────────────────────────
  // The css .weather already knows the law: embers only while the campfire
  // holds the sky, snow only over the village, crossfaded in 900ms, born at
  // the flame (74% across, 80% down) and dead well before the sky. The same
  // law here — the scene attribute is watched, the intensities chase it.
  const EMBER_N = 22, SNOW_N = 34;

  const emberMat = new THREE.MeshBasicMaterial({
    map: dotTexture(EMBER, EMBER_DEEP),
    transparent: true, opacity: 0,
    blending: THREE.AdditiveBlending,   // glow the way an ember does
    depthWrite: false,
  });
  const emberMesh = new THREE.InstancedMesh(geo, emberMat, EMBER_N);
  emberMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  scene.add(emberMesh);

  const snowMat = new THREE.MeshBasicMaterial({
    map: dotTexture(SNOW, SNOW),
    transparent: true, opacity: 0,
    depthWrite: false,
  });
  const snowMesh = new THREE.InstancedMesh(geo, snowMat, SNOW_N);
  snowMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  scene.add(snowMesh);

  const flame = { fx: 0.74, fy: 0.80 };  // the fire in the painting
  const makeEmber = () => {
    const z = -2 + 4 * Math.random();
    const h = worldH(z), w = worldW(z);
    return {
      z,
      x: (flame.fx - 0.5 + (Math.random() - 0.5) * 0.03) * w,
      y0: -(flame.fy - 0.5) * h,
      life: Math.random(),                    // 0 birth … 1 gone
      dur: 5.6 + Math.random() * 3.8,         // the css range
      sway: (0.1 + Math.random() * 0.2) * (Math.random() < 0.5 ? -1 : 1),
      p: Math.random() * Math.PI * 2,
      px: 2.5 + Math.random() * 1.8,          // 2-4px, like the css
      climb: 0.46,                            // 46vh, like the css
    };
  };
  const embers = Array.from({ length: EMBER_N }, makeEmber);

  const makeFlake = () => {
    const z = -3 + 5 * Math.random();
    const h = worldH(z), w = worldW(z);
    return {
      z,
      x: (Math.random() - 0.5) * w * 1.05,
      y: (Math.random() - 0.5) * h * 1.2,
      vy: h / (11 + Math.random() * 6),       // 11-17s transits, like the css
      sway: (0.15 + Math.random() * 0.3) * (Math.random() < 0.5 ? -1 : 1),
      p: Math.random() * Math.PI * 2,
      px: 2.5 + Math.random() * 1.5,
    };
  };
  const flakes = Array.from({ length: SNOW_N }, makeFlake);

  // which weather the sky wants right now — read each frame, it is one string
  const want = () => {
    const s = document.documentElement.dataset.scene;
    return { ember: s === "fire" ? 1 : 0, snow: s === "snow" ? 1 : 0 };
  };
  const C = new THREE.Color();
  for (let i = 0; i < EMBER_N; i++) emberMesh.setColorAt(i, C.setScalar(1));

  // each petal: position, size from the css range (8–13px at its own depth),
  // a fall speed matching the 16–28s screen transits, sway, tumble phases
  const petals = [];
  const make = (burst) => {
    const z = -4 + 7 * Math.pow(Math.random(), 1.7); // depth-biased far
    const h = worldH(z), w = worldW(z);
    const px = 8 + Math.random() * 5;
    return {
      z,
      x: (Math.random() - 0.5) * w * 1.1,
      y: burst ? h / 2 + Math.random() * h * 0.3 : (Math.random() - 0.5) * h * 1.2,
      s: (px / innerHeight) * worldH(0),
      vy: (burst ? h / (2.2 + Math.random() * 2) : h / (16 + Math.random() * 12)),
      sway: (0.3 + Math.random() * 0.7) * (Math.random() < 0.5 ? -1 : 1),
      wS: 0.25 + Math.random() * 0.4,
      p: Math.random() * Math.PI * 2,
      rz: Math.random() * Math.PI * 2,
      ry: Math.random() * Math.PI * 2,
      vrz: 0.25 + Math.random() * 0.5,
      vry: 0.35 + Math.random() * 0.7,
      kx: 0,                                     // cursor breeze momentum
      burst: burst ? 6.5 : 0,                    // seconds left, lisa petals
    };
  };
  for (let i = 0; i < N; i++) petals.push(make(false));

  // the breeze: mouse velocity, eased, pushing petals near the cursor plane
  const mouse = { x: 0, y: 0, vx: 0, vy: 0, has: false };
  if (fine) {
    let px = 0, py = 0, pt = 0;
    addEventListener("pointermove", (e) => {
      const t = performance.now();
      if (pt) {
        const dt = Math.max(8, t - pt);
        mouse.vx = (e.clientX - px) / dt;
        mouse.vy = (e.clientY - py) / dt;
      }
      px = e.clientX; py = e.clientY; pt = t;
      mouse.x = (e.clientX / innerWidth - 0.5) * worldW(0);
      mouse.y = -(e.clientY / innerHeight - 0.5) * worldH(0);
      mouse.has = true;
    }, { passive: true });
  }

  // l-i-s-a goes through the field when the field is up
  addEventListener("lisa-shower", () => {
    for (let i = 0; i < 16 && petals.length < N + 24; i++) petals.push(make(true));
  });

  let last = performance.now();
  const tick = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    mouse.vx *= 0.92; mouse.vy *= 0.92;

    const wind = Math.sin(now / 9000) * 0.12;   // a nine-second lean, barely

    for (let i = petals.length - 1; i >= 0; i--) {
      const pt = petals[i];
      const h = worldH(pt.z), w = worldW(pt.z);

      pt.y -= pt.vy * dt;
      pt.p += pt.wS * dt;
      pt.rz += pt.vrz * dt;
      pt.ry += pt.vry * dt;

      if (fine && mouse.has) {
        const dx = pt.x - mouse.x, dy = pt.y - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 4) {
          const f = (1 - d2 / 4) * 0.9;
          pt.kx += (mouse.vx * f + (dx / Math.sqrt(d2 + 0.01)) * Math.abs(mouse.vx) * f * 0.4) * dt * 4;
        }
      }
      pt.kx *= 0.94;
      pt.x += (Math.cos(pt.p) * pt.sway + wind) * dt + pt.kx * dt * 8;

      if (pt.burst > 0) {
        pt.burst -= dt;
        if (pt.burst <= 0) { petals.splice(i, 1); continue; }
      }
      if (pt.y < -h * 0.62) {                    // wrap: back to the top
        pt.y = h * 0.62;
        pt.x = (Math.random() - 0.5) * w * 1.1;
        pt.kx = 0;
      }
      if (pt.x > w * 0.62) pt.x = -w * 0.62;
      if (pt.x < -w * 0.62) pt.x = w * 0.62;
    }

    for (let i = 0; i < mesh.count; i++) {
      const pt = petals[i];
      if (!pt) { mesh.setMatrixAt(i, HIDE); continue; }
      E.set(0, pt.ry, pt.rz);
      Q.setFromEuler(E);
      V.set(pt.x, pt.y, pt.z);
      SC.set(pt.s, pt.s, pt.s);
      M.compose(V, Q, SC);
      mesh.setMatrixAt(i, M);
    }
    mesh.instanceMatrix.needsUpdate = true;

    // ── weather ───────────────────────────────────────────────────────────
    const w = want();
    const chase = Math.min(1, dt / 0.45);      // the scenes' own 900ms feel
    emberMat.opacity += (w.ember * 0.9 - emberMat.opacity) * chase;
    snowMat.opacity += (w.snow * 0.85 - snowMat.opacity) * chase;

    if (emberMat.opacity > 0.01) {
      for (let i = 0; i < EMBER_N; i++) {
        const em = embers[i];
        em.life += dt / em.dur;
        if (em.life >= 1) { embers[i] = makeEmber(); embers[i].life = 0; continue; }
        const h = worldH(em.z);
        em.p += dt * 1.4;
        const y = em.y0 + em.life * em.climb * h;
        const x = em.x + Math.sin(em.p) * em.sway * em.life;
        const s = (em.px / innerHeight) * worldH(0) * (1 - em.life * 0.6) * 3; // soft sprite reads small
        // the css curve: bright at birth, half by the middle, out at the top
        const glow = em.life < 0.1 ? em.life / 0.1 : 1 - (em.life - 0.1) * 0.9;
        emberMesh.setColorAt(i, C.setScalar(glow));
        V.set(x, y, em.z); SC.set(s, s, s); Q.identity();
        M.compose(V, Q, SC);
        emberMesh.setMatrixAt(i, M);
      }
      emberMesh.instanceColor.needsUpdate = true;
      emberMesh.instanceMatrix.needsUpdate = true;
    }
    emberMesh.visible = emberMat.opacity > 0.01;

    if (snowMat.opacity > 0.01) {
      for (let i = 0; i < SNOW_N; i++) {
        const f = flakes[i];
        const h = worldH(f.z), ww = worldW(f.z);
        f.y -= f.vy * dt;
        f.p += f.sway * dt;
        f.x += Math.cos(f.p) * 0.12 * dt;
        if (f.y < -h * 0.62) { f.y = h * 0.62; f.x = (Math.random() - 0.5) * ww * 1.05; }
        const s = (f.px / innerHeight) * worldH(0) * 3;
        V.set(f.x, f.y, f.z); SC.set(s, s, s); Q.identity();
        M.compose(V, Q, SC);
        snowMesh.setMatrixAt(i, M);
      }
      snowMesh.instanceMatrix.needsUpdate = true;
    }
    snowMesh.visible = snowMat.opacity > 0.01;

    renderer.render(scene, camera);
  };
  renderer.setAnimationLoop(tick);

  addEventListener("resize", () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  }, { passive: true });

  document.addEventListener("visibilitychange", () => {
    renderer.setAnimationLoop(document.hidden ? null : tick);
    last = performance.now();
  });
}
