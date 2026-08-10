// The mark, decoding. A wave sweeps down the glyph: everything behind it has
// resolved into the logo, everything ahead is still noise. The reference is
// the decrypt/materialise effect from terminal demos — it reads as something
// arriving rather than something pulsing, which is what an opacity breath was.
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const COLS = 34;
const ROWS = Math.round(COLS * 0.5);
const RAMP = " .:-=+*#%@";
const NOISE = "01<>[]{}/\\|_-=+*#%@$&?!";

let seed = 20260810;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);

// Alpha carries the shape; a luminance pass returns a solid block.
const raw = execFileSync("ffmpeg", [
  "-loglevel", "error", "-i", "public/images/marks/replika.png",
  "-vf", `scale=${COLS}:${ROWS}`,
  "-f", "rawvideo", "-pix_fmt", "rgba", "-",
], { maxBuffer: 1 << 24 });

const solved = [];
for (let y = 0; y < ROWS; y++) {
  const row = [];
  for (let x = 0; x < COLS; x++) {
    const a = raw[(y * COLS + x) * 4 + 3] / 255;
    row.push(RAMP[Math.min(RAMP.length - 1, Math.round(a * (RAMP.length - 1)))]);
  }
  solved.push(row);
}

const FRAMES = 44;
const frames = [];
for (let f = 0; f < FRAMES; f++) {
  // Wave travels top to bottom over the first 70% of the cycle, then the
  // whole mark holds resolved so it is legible for a beat before repeating.
  const t = f / FRAMES;
  const wave = t < 0.72 ? (t / 0.72) * (ROWS + 6) - 3 : ROWS + 6;
  let out = "";
  for (let y = 0; y < ROWS; y++) {
    let line = "";
    for (let x = 0; x < COLS; x++) {
      const ch = solved[y][x];
      if (ch === " ") { line += " "; continue; }
      const behind = y < wave - 1.5;
      const inWave = Math.abs(y - wave) <= 1.5;
      if (behind) line += ch;
      else if (inWave) line += rnd() < 0.55 ? NOISE[(rnd() * NOISE.length) | 0] : ch;
      else line += rnd() < 0.30 ? NOISE[(rnd() * NOISE.length) | 0] : " ";
    }
    out += line.replace(/\s+$/, "") + "\n";
  }
  frames.push(out);
}

writeFileSync("src/ascii/mark.json", JSON.stringify(frames));
console.log(`  mark.json  ${FRAMES} frames, ${COLS}x${ROWS}`);

const SHIP = `
                    /\\
                   /  \\
          ________/    \\________
         /   __               __ \\
    ____/   |__|   .-----.   |__|  \\____
   |________       |  o  |       ________|
            \\      '-----'      /
             \\________________/
                 ||      ||
                (##)    (##)
`;
writeFileSync("src/ascii/ship.txt", SHIP.replace(/^\n/, ""));
console.log("  ship.txt   1 drawing");
