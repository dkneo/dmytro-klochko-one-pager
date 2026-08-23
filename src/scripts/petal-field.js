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
