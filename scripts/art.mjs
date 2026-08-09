// ASCII art, solved at build time and shipped as text. Each piece is tied to
// the thing it sits next to, so it reads as a mark rather than as decoration.
import { writeFileSync } from "node:fs";
const RAMP = ".,-~:;=!*#$@";

function render(W, H, fn) {
  const buf = new Array(W * H).fill(" ");
  const z = new Array(W * H).fill(-Infinity);
  return { buf, z, W, H, plot(x, y, depth, shade) {
    const xi = Math.round(x), yi = Math.round(y);
    if (xi < 0 || yi < 0 || xi >= W || yi >= H) return;
    const o = yi * W + xi;
    if (depth > z[o]) { z[o] = depth; buf[o] = RAMP[Math.max(0, Math.min(RAMP.length - 1, shade))]; }
  }, out() {
    let s = "";
    for (let y = 0; y < H; y++) s += buf.slice(y * W, (y + 1) * W).join("").replace(/\s+$/, "") + "\n";
    return s;
  }};
}

// ── two bodies orbiting a shared centre. a companion is a second body. ──────
function orbit(t, W = 62, H = 22) {
  const c = render(W, H);
  const cx = W / 2, cy = H / 2;
  for (const [phase, rad, size] of [[0, 1, 3.1], [Math.PI, 0.62, 2.1]]) {
    const a = t + phase;
    const ox = cx + Math.cos(a) * (W * 0.29) * rad;
    const oy = cy + Math.sin(a) * (H * 0.30) * rad;
    const depth = Math.sin(a);
    for (let dy = -size; dy <= size; dy += 0.5) {
      for (let dx = -size * 2; dx <= size * 2; dx += 0.5) {
        const d = Math.hypot(dx / 2, dy);
        if (d > size) continue;
        c.plot(ox + dx, oy + dy, depth, Math.round((1 - d / size) * 9) + 2);
      }
    }
  }
  // the tie between them
  for (let s = 0; s <= 1; s += 0.02) {
    const a1 = t, a2 = t + Math.PI;
    const x = (cx + Math.cos(a1) * W * 0.29) * (1 - s) + (cx + Math.cos(a2) * W * 0.29 * 0.62) * s;
    const y = (cy + Math.sin(a1) * H * 0.30) * (1 - s) + (cy + Math.sin(a2) * H * 0.30 * 0.62) * s;
    c.plot(x, y, -2, 0);
  }
  return c.out();
}

// ── a dish sweeping, with the signal going out. for "say hi". ───────────────
function dish(t, W = 54, H = 18) {
  const c = render(W, H);
  const cx = W * 0.28, cy = H * 0.78;
  for (let a = -2.5; a <= -0.6; a += 0.02) {
    for (let r = 0; r < 7; r += 0.4) {
      c.plot(cx + Math.cos(a) * r * 1.9, cy + Math.sin(a) * r, 0, 7);
    }
  }
  for (let y = 0; y < 4; y++) c.plot(cx, cy + y, 0, 5);
  for (let ring = 0; ring < 3; ring++) {
    const rr = ((t * 9 + ring * 5) % 15) + 3;
    const fade = Math.max(0, 9 - rr * 0.5);
    for (let a = -1.5; a <= -0.1; a += 0.05) {
      c.plot(cx + Math.cos(a) * rr * 2.0 + 4, cy + Math.sin(a) * rr - 1, 0, Math.round(fade));
    }
  }
  return c.out();
}

const FR = 40;
const orbitFrames = [], dishFrames = [];
for (let i = 0; i < FR; i++) {
  orbitFrames.push(orbit((i / FR) * Math.PI * 2));
  dishFrames.push(dish(i / FR));
}
writeFileSync("src/ascii/orbit.json", JSON.stringify(orbitFrames));
writeFileSync("src/ascii/dish.json", JSON.stringify(dishFrames));
console.log(`  orbit.json ${FR} frames`);
console.log(`  dish.json  ${FR} frames`);
