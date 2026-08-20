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
