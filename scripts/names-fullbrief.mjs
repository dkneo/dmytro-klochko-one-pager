#!/usr/bin/env node

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function argumentsFrom(argv) {
  const options = {
    current: path.join(root, 'contents', 'updated media', 'poetic-name-folio.html'),
    full: path.join(root, 'contents', 'updated media', 'poetic-name-folio-full.html'),
    out: null,
    apply: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--apply') {
      options.apply = true;
      continue;
    }
    if (['--current', '--full', '--out'].includes(argument)) {
      const value = argv[index + 1];
      if (!value) throw new Error(`${argument} needs a path`);
      options[argument.slice(2)] = path.resolve(value);
      index += 1;
      continue;
    }
    throw new Error(`unknown argument: ${argument}`);
  }

  options.out ??= options.current;
  return options;
}

function boundedBlock(source, startMarker, endMarker, label) {
  const start = source.indexOf(startMarker);
  if (start === -1) throw new Error(`${label}: missing ${startMarker}`);
  const endStart = source.indexOf(endMarker, start);
  if (endStart === -1) throw new Error(`${label}: missing ${endMarker}`);
  return { start, end: endStart + endMarker.length };
}

export function mergeNamesFullbrief(current, full) {
  const currentFolio = boundedBlock(current, '<main>', '</main>', 'current folio');
  const fullArchive = boundedBlock(full, '<header class="hero">', '</main>', 'complete folio');

  const archive = full
    .slice(fullArchive.start, fullArchive.end)
    .replace(
      /\s*<p[^>]*>\s*<a href="\/names"[^>]*>&larr; the four he kept<\/a>\s*<\/p>\s*/,
      '\n',
    );

  const merged = `${current.slice(0, currentFolio.start)}${archive}${current.slice(currentFolio.end)}`;
  const mainCount = merged.match(/<main>/g)?.length ?? 0;
  if (mainCount !== 1) throw new Error(`merged folio has ${mainCount} <main> elements`);
  if (!merged.includes('<details class="brief">')) throw new Error('merged folio lost the product brief');
  if (!merged.includes('<section class="compare"')) throw new Error('merged folio lost the shortlist comparison');
  if (merged.includes('the four he kept')) throw new Error('merged folio kept the obsolete self-link');

  return merged;
}

async function main() {
  const options = argumentsFrom(process.argv.slice(2));
  const [current, full] = await Promise.all([
    readFile(options.current, 'utf8'),
    readFile(options.full, 'utf8'),
  ]);
  const merged = mergeNamesFullbrief(current, full);
  const sections = [...merged.matchAll(/<(?:section|article)[^>]+id="([^"]+)"/g)].map((match) => match[1]);
  const uniqueSections = new Set(sections);

  if (options.apply) {
    await writeFile(options.out, merged);
    process.stdout.write(`wrote ${options.out}\n`);
  } else {
    process.stdout.write('dry run; pass --apply to write\n');
  }
  process.stdout.write(`${uniqueSections.size} named sections; ${Buffer.byteLength(merged)} bytes\n`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  });
}
