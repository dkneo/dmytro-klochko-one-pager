// The rotating ASCII torus, the oldest trick in demoscene computing. Frames are
// solved here at build time and shipped as text; CSS flips between them with
// steps(). No canvas, no shader, no JavaScript at runtime.
import { writeFileSync } from "node:fs";

const W = 78, H = 26, FRAMES = 40;
const RAMP = ".,-~:;=!*#$@";

function frame(A, B) {
  const out = new Array(W * H).fill(" ");
  const zbuf = new Array(W * H).fill(0);
  for (let theta = 0; theta < 6.28; theta += 0.06) {
    for (let phi = 0; phi < 6.28; phi += 0.02) {
      const c = Math.sin(theta), d = Math.cos(phi), e = Math.sin(A), f = Math.sin(phi);
      const g = Math.cos(A), h = d + 2, D = 1 / (c * h * e + f * g + 5);
      const l = Math.cos(theta), m = Math.cos(B), n = Math.sin(B);
      const t = c * h * g - f * e;
      const x = Math.floor(W / 2 + (W / 3.4) * D * (l * h * m - t * n));
      const y = Math.floor(H / 2 + (H / 2.3) * D * (l * h * n + t * m));
      const o = x + W * y;
      const N = Math.floor(8 * ((f * e - c * d * g) * m - c * d * e - f * g - l * d * n));
      if (y >= 0 && y < H && x >= 0 && x < W && D > zbuf[o]) {
        zbuf[o] = D;
        out[o] = RAMP[N > 0 ? N : 0];
      }
    }
  }
  let s = "";
  for (let y = 0; y < H; y++) s += out.slice(y * W, (y + 1) * W).join("").replace(/\s+$/, "") + "\n";
  return s;
}

const frames = [];
for (let i = 0; i < FRAMES; i++) {
  frames.push(frame((i / FRAMES) * Math.PI * 2, (i / FRAMES) * Math.PI * 2 * 0.5));
}
writeFileSync("src/ascii/torus.json", JSON.stringify(frames));
console.log(`  torus.json  ${FRAMES} frames, ${W}x${H}`);
