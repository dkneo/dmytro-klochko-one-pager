// The Replika mark, drawn in characters from the actual logo rather than by
// hand. Hand-drawn figures failed twice; the ship worked because it is one
// accurate drawing that CSS moves. This is the same idea applied to the mark.
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const COLS = 34;
const ROWS = Math.round(COLS * 0.5);
const RAMP = " .:-=+*#%@";

// The mark is white pixels carrying their shape in alpha, so a luminance pass
// returns a solid block. Read the alpha channel.
const raw = execFileSync("ffmpeg", [
  "-loglevel", "error", "-i", "public/images/marks/replika.png",
  "-vf", `scale=${COLS}:${ROWS}`,
  "-f", "rawvideo", "-pix_fmt", "rgba", "-",
], { maxBuffer: 1 << 24 });

let out = "";
for (let y = 0; y < ROWS; y++) {
  let line = "";
  for (let x = 0; x < COLS; x++) {
    const v = raw[(y * COLS + x) * 4 + 3] / 255;
    line += RAMP[Math.min(RAMP.length - 1, Math.round(v * (RAMP.length - 1)))];
  }
  out += line.replace(/\s+$/, "") + "\n";
}
writeFileSync("src/ascii/mark.txt", out);
console.log(`  mark.txt  ${COLS}x${ROWS}`);

// Spike's ship, unchanged: the one piece that landed.
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
console.log("  ship.txt  1 drawing");
