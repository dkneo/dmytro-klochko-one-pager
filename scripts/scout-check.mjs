#!/usr/bin/env node

import fs from "node:fs";
import { pathToFileURL } from "node:url";

const MEDIA_PREFIX = "/scout/media/";
const UNSUPPORTED = [
  "creative is the only lever",
  "active means it converts",
  "fastest first win",
  "real budgets triple reply quality",
  "reply rates fall off a cliff",
  "lose a third of their deals",
];

const attribute = (tag, name) => {
  const match = tag.match(new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, "i"));
  return match?.[1] ?? match?.[2] ?? null;
};

const hasAttribute = (tag, name) => new RegExp(`\\s${name}(?:\\s|=|>)`, "i").test(tag);

export function checkScoutHtml(html) {
  const source = String(html || "");
  const issues = [];

  if (source.includes("—")) issues.push("guide contains an em dash");

  const lower = source.toLowerCase();
  for (const phrase of UNSUPPORTED) {
    if (lower.includes(phrase)) issues.push(`unsupported phrase: ${phrase}`);
  }

  for (const match of source.matchAll(/<img\b[^>]*>/gi)) {
    const tag = match[0];
    const src = attribute(tag, "src") || "";
    if (!src.startsWith(MEDIA_PREFIX)) issues.push(`image must use private ${MEDIA_PREFIX}: ${src || "missing src"}`);
    if (!attribute(tag, "width") || !attribute(tag, "height")) issues.push(`image needs width and height: ${src || "missing src"}`);
    if (!attribute(tag, "alt")) issues.push(`image needs useful alt text: ${src || "missing src"}`);
  }

  for (const match of source.matchAll(/<video\b([^>]*)>([\s\S]*?)<\/video>/gi)) {
    const tag = `<video${match[1]}>`;
    const body = match[2];
    const src = attribute(tag, "src") || attribute(body.match(/<source\b[^>]*>/i)?.[0] || "", "src") || "";
    if (!src.startsWith(MEDIA_PREFIX)) issues.push(`video must use private ${MEDIA_PREFIX}: ${src || "missing src"}`);
    if (!attribute(tag, "width") || !attribute(tag, "height")) issues.push(`video needs width and height: ${src || "missing src"}`);
    if (!hasAttribute(tag, "controls")) issues.push(`video needs controls: ${src || "missing src"}`);
    if (!/<track\b[^>]*\bkind\s*=\s*["']captions["'][^>]*>/i.test(body)) issues.push(`video needs a captions track: ${src || "missing src"}`);
  }

  return issues;
}

function main() {
  const file = process.argv[2];
  if (!file) {
    console.error("usage: node scripts/scout-check.mjs <scout-school.html>");
    process.exitCode = 2;
    return;
  }
  const issues = checkScoutHtml(fs.readFileSync(file, "utf8"));
  if (issues.length) {
    console.error(issues.map((issue) => `scout check: ${issue}`).join("\n"));
    process.exitCode = 1;
    return;
  }
  console.log("scout check: private media, dimensions, captions and audited claims are clean");
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) main();
