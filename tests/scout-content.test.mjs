import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const source = new URL("../contents/scout-school.html", import.meta.url);
const hasPrivateScoutSource = fs.existsSync(source);
const html = hasPrivateScoutSource ? fs.readFileSync(source, "utf8") : "";
const privateSourceTest = hasPrivateScoutSource ? test : test.skip;

privateSourceTest("scout hero and organic lesson use the new private Taso illustrations", () => {
  assert.match(html, /<header class="hero"[\s\S]*?src="\/scout\/media\/taso-creative-operator\.webp"/);
  assert.match(html, /src="\/scout\/media\/taso-organic-ugc\.webp"/);
  assert.match(html, /src="\/scout\/media\/taso-scout\.webp"/);
});

privateSourceTest("the scout hero keeps a spoken space across its visual line break", () => {
  assert.match(html, /Find the people<br> the ads are/);
});

privateSourceTest("scout role includes motion-design research, organic publishing and self-shot UGC", () => {
  assert.match(html, /motion designers/i);
  assert.match(html, /organic/i);
  assert.match(html, /24 hours/i);
  assert.match(html, /7 days/i);
  assert.match(html, /average watch time/i);
  assert.match(html, /completion rate/i);
  assert.match(html, /shoot one UGC/i);
});

privateSourceTest("account strategy compares a flagship with a distinct account portfolio using sourced examples", () => {
  assert.match(html, /one flagship/i);
  assert.match(html, /account portfolio/i);
  assert.match(html, /https:\/\/www\.tiktok\.com\/@ryanair/);
  assert.match(html, /https:\/\/www\.tiktok\.com\/@duolingo/);
  assert.match(html, /https:\/\/www\.tiktok\.com\/@duolingodeutschland/);
  assert.match(html, /Custom_Identity_Transition_FAQ_2025\.pdf/);
});

privateSourceTest("course content has a main landmark and uniquely named completion checks", () => {
  assert.match(html, /<main\b[^>]*>/);
  for (const label of [
    "mark day one complete",
    "mark day two complete",
    "mark day three complete",
    "mark day four complete",
    "mark day five complete",
    "mark graduation complete",
  ]) {
    assert.match(html, new RegExp(`aria-label="${label}"`));
  }
});
