// Turns a photograph into an ASCII plate at build time. Runs once, by hand,
// and commits its output: the page ships text, not an image and not a script.
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";

// Dark to light. Monospace cells are about twice as tall as wide, so the
// sampled grid is squashed vertically to keep faces the right shape.
const RAMP = "@%#*+=-:. ";
const [src, out, colsArg] = process.argv.slice(2);
const COLS = Number(colsArg || 110);
const ROWS = Math.round(COLS * 0.46);

const raw = execFileSync("ffmpeg", [
  "-loglevel", "error", "-i", src,
  "-vf", `scale=${COLS}:${ROWS},format=gray`,
  "-f", "rawvideo", "-pix_fmt", "gray", "-",
], { maxBuffer: 1 << 26 });

// Normalise across the actual range so low-contrast photos still read.
let lo = 255, hi = 0;
for (const v of raw) { if (v < lo) lo = v; if (v > hi) hi = v; }
const span = Math.max(hi - lo, 1);

let text = "";
for (let y = 0; y < ROWS; y++) {
  let line = "";
  for (let x = 0; x < COLS; x++) {
    const n = (raw[y * COLS + x] - lo) / span;
    line += RAMP[Math.min(RAMP.length - 1, Math.round(n * (RAMP.length - 1)))];
  }
  text += line.replace(/\s+$/, "") + "\n";
}
writeFileSync(out, text);
console.log(`  ${out}  ${COLS}x${ROWS}`);
