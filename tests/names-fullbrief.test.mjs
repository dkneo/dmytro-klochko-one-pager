import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const repo = path.resolve(import.meta.dirname, '..');
const script = path.join(repo, 'scripts', 'names-fullbrief.mjs');

test('the names merge keeps the brief and comparison while restoring the complete folio', async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'names-fullbrief-'));
  const current = path.join(directory, 'current.html');
  const full = path.join(directory, 'full.html');
  const output = path.join(directory, 'merged.html');

  await writeFile(current, `<!doctype html><html><body>
    <details class="brief"><p>the complete product brief</p></details>
    <main><section id="cicada">shortlist only</section></main>
    <section class="compare">the four together</section>
    <footer>close</footer>
  </body></html>`);

  await writeFile(full, `<!doctype html><html><body>
    <header class="hero">
      <p><a href="/names">&larr; the four he kept</a></p>
      <h1>A lexicon for a possible future.</h1>
    </header>
    <section class="index"><a href="#karasu">Karasu</a><a href="#cicada">Cicada</a></section>
    <main><section id="karasu">first name</section><section id="cicada">second name</section></main>
    <footer>old close</footer>
  </body></html>`);

  const result = spawnSync(process.execPath, [script, '--current', current, '--full', full, '--out', output, '--apply'], {
    cwd: repo,
    encoding: 'utf8',
  });

  try {
    assert.equal(result.status, 0, result.stderr || result.stdout);
    const merged = await readFile(output, 'utf8');
    assert.match(merged, /the complete product brief/);
    assert.match(merged, /id="karasu"/);
    assert.match(merged, /id="cicada"/);
    assert.match(merged, /the four together/);
    assert.doesNotMatch(merged, /the four he kept/);
    assert.equal(merged.match(/<main>/g)?.length, 1);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
