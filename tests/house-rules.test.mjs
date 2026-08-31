import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

// The house rules in CHECKLIST.md, made checkable. An audit of the homepage
// and press found ten treatments for three kinds of object, nine widths of
// one framing material, seven radii and sixteen gaps against a five-step
// scale. None of that was decided — it accumulated. These guards are what
// stop it accumulating again.

const root = path.resolve(import.meta.dirname, "..");
const read = (f) => fs.readFileSync(path.join(root, f), "utf8");

const dream = () => read("src/styles/dream.css");
const global = () => read("src/styles/global.css");

test("the surface tokens exist and say what they are for", () => {
  const g = global();
  for (const t of ["--r-print", "--r-panel", "--r-row", "--mat-snapshot", "--mat-print", "--sp-hair", "--sp-tight"]) {
    assert.match(g, new RegExp(`${t}:\\s*[^;]+;`), `${t} is not declared`);
  }
});

test("no surface invents its own corner", () => {
  const css = dream();
  // 50% and 999px are circles and pills, which are shapes rather than radii.
  const literals = [...css.matchAll(/border-radius:\s*([^;]+);/g)]
    .map((m) => m[1].trim())
    .filter((v) => !/var\(|50%|999px|100%|^0$/.test(v));

  // Every remaining literal must be one the rules name: 1px is the print
  // inside a mat, and the three tokens cover the rest.
  const allowed = new Set(["1px", "2px", "3px", "6px"]);
  const strays = [...new Set(literals)].filter((v) => !allowed.has(v));
  assert.deepEqual(strays, [],
    `radii outside the system: ${strays.join(", ")} — use --r-print / --r-panel / --r-row`);
});

test("the cream mat has one width per size of print, not nine", () => {
  const css = dream();
  // every rule that paints the mat must take its padding from a token
  const mats = [...css.matchAll(/\{[^}]*background:\s*var\(--mat\)[^}]*\}/g)].map((m) => m[0]);
  assert.ok(mats.length >= 6, `expected the mat to be used widely, found ${mats.length}`);
  for (const rule of mats) {
    const pad = rule.match(/padding:\s*([^;]+);/)?.[1];
    if (!pad) continue;                       // a mat may carry no padding
    assert.match(pad, /var\(--mat-(snapshot|print)\)/,
      `a mat sets padding: ${pad} — the width belongs to --mat-snapshot or --mat-print`);
  }
});

test("a screenshot is not dressed as a photograph", () => {
  const css = dream();
  const rule = css.match(/\.cv-media--screen \.cell \{[^}]*\}/)?.[0];
  assert.ok(rule, "the screen variant is gone");
  assert.match(rule, /background:\s*none/, "a screen carries no mat");
  assert.doesNotMatch(rule, /rotate\(/, "a screen does not tilt");
});

test("hover and chosen are different weights, and hover waits for a real pointer", () => {
  const css = dream();
  for (const [sel, weight] of [
    [".log--journey li\\[data-easel\\]:hover", "--bone) 5.5%"],
    [".log--journey li\\[data-easel\\].is-shown", "--hot) 14%"],
    [".pr-row:hover", "--bone) 5.5%"],
  ]) {
    const rule = css.match(new RegExp(`${sel} \\{[^}]*\\}`))?.[0];
    assert.ok(rule, `${sel} has no rule`);
    assert.ok(rule.includes(weight), `${sel} should light at ${weight}, got: ${rule}`);
  }
  // both hovers sit inside a real-pointer query
  for (const sel of ["log--journey li[data-easel]:hover", "pr-row:hover"]) {
    const at = css.indexOf(sel);
    const before = css.slice(Math.max(0, at - 400), at);
    assert.match(before, /@media \(hover: hover\) and \(pointer: fine\)/,
      `${sel} is not gated on a real pointer`);
  }
});

test("a row that lights is a row you can click", () => {
  // the press row highlights across four columns, so the whole row is the link
  const css = dream();
  assert.match(css, /\.pr-title::after \{[^}]*position:\s*absolute[^}]*\}/,
    "the press title's link must stretch over the row it highlights");
  assert.match(css, /\.pr-meta a[^{]*\{[^}]*z-index:\s*1/,
    "the meta links must stay above that sheet");
});

test("every job opens with the same words", () => {
  const html = read("dist/index.html");
  const shut = [...html.matchAll(/class="cv-more-shut"[^>]*>([^<]*)</g)].map((m) => m[1].trim());
  const open = [...html.matchAll(/class="cv-more-open"[^>]*>([^<]*)</g)].map((m) => m[1].trim());
  assert.ok(shut.length >= 5, `expected every job to carry a control, found ${shut.length}`);
  assert.equal(new Set(shut).size, 1, `jobs disagree on the words: ${[...new Set(shut)].join(" / ")}`);
  assert.equal(new Set(open).size, 1, `jobs disagree on the open words: ${[...new Set(open)].join(" / ")}`);
  assert.equal(shut[0], "read more");
});

test("the ladder is documented and the rules are written down", () => {
  const c = read("CHECKLIST.md");
  assert.match(c, /## House rules/, "the house rules left the checklist");
  for (const t of ["--r-print", "--mat-snapshot", "--sp-tight"]) {
    assert.ok(c.includes(t), `${t} is not explained in the checklist`);
  }
});
