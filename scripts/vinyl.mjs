// A record, turning. Drawn from maths into raw grayscale and stacked into one
// sheet, then rendered as ASCII by the same shader everything else uses. A
// plain disc looks identical at every angle, so the spin has to come from
// something asymmetric: the label mark and a specular sweep across the
// grooves, both of which rotate.
import { execFileSync } from "node:child_process";

const W = 150, H = 150, FRAMES = 30;
const buf = Buffer.alloc(W * H * FRAMES);

for (let f = 0; f < FRAMES; f++) {
  const a0 = (f / FRAMES) * Math.PI * 2;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const dx = x - W / 2, dy = y - H / 2;
      const r = Math.hypot(dx, dy) / (W / 2);
      const th = Math.atan2(dy, dx);
      let v = 0;
      if (r <= 0.98) {
        // grooves
        v = 0.16 + 0.1 * (Math.sin(r * 190) * 0.5 + 0.5);
        // the sweep: a soft highlight that travels round the disc
        const sweep = Math.cos(th - a0);
        v += Math.pow(Math.max(0, sweep), 6) * 0.55 * Math.min(1, r * 2.2);
        // label
        if (r < 0.34) {
          v = 0.62;
          // one mark on the label so the rotation is unmistakable
          const lx = Math.cos(a0) * 0.17, ly = Math.sin(a0) * 0.17;
          if (Math.hypot(dx / (W / 2) - lx, dy / (H / 2) - ly) < 0.07) v = 1;
        }
        // spindle
        if (r < 0.045) v = 0;
      }
      buf[f * W * H + y * W + x] = Math.round(Math.max(0, Math.min(1, v)) * 255);
    }
  }
}

execFileSync("ffmpeg", [
  "-loglevel", "error",
  "-f", "rawvideo", "-pix_fmt", "gray", "-s", `${W}x${H * FRAMES}`, "-i", "pipe:0",
  "-frames:v", "1", "-update", "1", "-q:v", "4",
  "public/ascii/vinyl-sheet.jpg", "-y",
], { input: buf });
console.log(`  vinyl-sheet.jpg  ${FRAMES} frames of ${W}x${H}`);
