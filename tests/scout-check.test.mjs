import assert from "node:assert/strict";
import test from "node:test";

import { checkScoutHtml } from "../scripts/scout-check.mjs";

const shell = (body) => `<!doctype html><html><head><title>Scout School</title></head><body>${body}</body></html>`;

test("scout guide accepts private, dimensioned, described media", () => {
  const issues = checkScoutHtml(shell(`
    <img src="/scout/media/taso.webp" width="1200" height="900" alt="Taso checking a creator brief">
    <video src="/scout/media/walkthrough.mp4" width="1280" height="720" controls>
      <track kind="captions" src="/scout/media/walkthrough.vtt" srclang="en" label="English">
    </video>
  `));

  assert.deepEqual(issues, []);
});

test("scout guide rejects public or inaccessible media", () => {
  const issues = checkScoutHtml(shell(`
    <img src="/images/scout/taso.webp">
    <video src="/scout/media/walkthrough.mp4" autoplay></video>
  `));

  assert.ok(issues.some((issue) => issue.includes("private /scout/media/")));
  assert.ok(issues.some((issue) => issue.includes("width and height")));
  assert.ok(issues.some((issue) => issue.includes("alt text")));
  assert.ok(issues.some((issue) => issue.includes("controls")));
  assert.ok(issues.some((issue) => issue.includes("captions track")));
});

test("scout guide rejects claims and punctuation that failed the audit", () => {
  const issues = checkScoutHtml(shell(`
    <p>Real budgets triple reply quality — this is the fastest first win.</p>
    <p>creative is the only lever and active means it converts.</p>
  `));

  assert.ok(issues.some((issue) => issue.includes("em dash")));
  assert.ok(issues.some((issue) => issue.includes("unsupported phrase")));
  assert.ok(issues.length >= 4);
});

test("scout guide rejects the retired petrol palette", () => {
  const issues = checkScoutHtml(shell(`
    <style>:root{--night:#102f33;--seal:#9f3f2c}</style>
  `));

  assert.ok(issues.some((issue) => issue.includes("retired petrol palette")));
});

test("scout guide accepts the baby-pink and aubergine palette", () => {
  const issues = checkScoutHtml(shell(`
    <style>:root{--pink:#ff9bc0;--night:#2b1d2b;--seal:#96345f}</style>
  `));

  assert.deepEqual(issues, []);
});

test("scout guide requires 44px mobile course and action targets", () => {
  const issues = checkScoutHtml(shell(`
    <style id="field-manual">
      @media(max-width:700px){.tick{min-height:36px}.prompt-copy{min-height:28px}}
    </style>
  `));

  assert.ok(issues.some((issue) => issue.includes("44px mobile action targets")));
});

test("scout guide requires a late tablet reading-lane override", () => {
  const issues = checkScoutHtml(shell(`
    <style id="field-manual">
      :root{--mobile-target:44px}
      .cols{grid-template-columns:12.5rem minmax(0,44rem)}
      @media(max-width:700px){.cols{display:block}}
    </style>
  `));

  assert.ok(issues.some((issue) => issue.includes("tablet reading lane")));
});
