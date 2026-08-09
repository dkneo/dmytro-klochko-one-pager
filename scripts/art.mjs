// Hand-drawn ASCII, animated at build time. Figurative art is drawn, not
// computed: a bartender solved from trigonometry would look like a bartender
// solved from trigonometry. The only thing generated is the glitch.
import { writeFileSync } from "node:fs";

// Deterministic noise, so a rebuild produces byte-identical art.
let seed = 20260810;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);

const lines = (s) => s.replace(/^\n/, "").replace(/\n$/, "").split("\n");

// ── Joi. A beam from an emitter resolving into a figure that will not hold.
const JOI = `
                    .  '  .
                 '             '
              .    ,---------,    .
                  /   .   .   \\
             '    |     ^     |    '
                   \\  \\___/  /
              .      '-----'      .
                        |
             '        .-'-.        '
                      |   |
              .       |   |       .
                      |   |
             '       /     \\       '
                    /       \\
              .    '         '    .
           . . . . . . . . . . . . . . .
                 [===============]
                  \\_____________/
                     |       |
                  ---'-------'---
`;

// Hologram glitch: displace whole scanlines and drop characters, which is what
// a failing projection does. Rows near the figure tear more than the base.
function glitch(base, amount) {
  return base.map((row, y) => {
    const near = y > 1 && y < 15;
    if (near && rnd() < amount * 0.5) {
      const shift = Math.round((rnd() - 0.5) * 5);
      row = shift > 0 ? " ".repeat(shift) + row : row.slice(-shift);
    }
    if (near && rnd() < amount * 0.4) {
      row = [...row].map((c) => (c !== " " && rnd() < 0.22 ? " " : c)).join("");
    }
    return row.replace(/\s+$/, "");
  }).join("\n") + "\n";
}

const joiBase = lines(JOI);
const joi = [];
for (let i = 0; i < 40; i++) {
  // Mostly stable, tearing badly three times a cycle, exactly held twice.
  const t = i / 40;
  const burst = Math.max(
    Math.exp(-((t - 0.18) ** 2) / 0.0016),
    Math.exp(-((t - 0.52) ** 2) / 0.0009),
    Math.exp(-((t - 0.83) ** 2) / 0.0012),
  );
  joi.push(glitch(joiBase, 0.12 + burst * 0.9));
}

// ── The bartender. Six drawn frames; the arm reaches the glass and turns it.
const BAR = (arm, glass, rim) => lines(`
                        _______
                       /       \\
                      |  .   .  |
                      |    _    |
                       \\  ___  /
                        '-----'
                           |
                  _________|_________
                 /         |         \\
                |          |          |${arm}
                |          |          |     ${rim}
                |          |          |     ${glass}
     ___________|__________|__________|_____|___|________
    |                                                    |
    |____________________________________________________|
        ||                                          ||
`).join("\n") + "\n";

const bartender = [
  BAR("\\____", " \\_/ ", " ___ "),
  BAR("\\___\\", " \\_/ ", " (_) "),
  BAR("\\____", " \\_/ ", " ___ "),
  BAR("\\___/", " \\_/ ", " (o) "),
  BAR("\\____", " \\_/ ", " ___ "),
  BAR("\\___\\", " \\_/ ", " (_) "),
];

// ── Swordfish II. One drawing; CSS flies it. No frames needed for a drift.
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

writeFileSync("src/ascii/joi.json", JSON.stringify(joi));
writeFileSync("src/ascii/bartender.json", JSON.stringify(bartender));
writeFileSync("src/ascii/ship.txt", SHIP.replace(/^\n/, ""));
console.log(`  joi.json        ${joi.length} frames`);
console.log(`  bartender.json  ${bartender.length} frames`);
console.log(`  ship.txt        1 drawing`);
