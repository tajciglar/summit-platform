import { execFileSync } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

/**
 * Pre-test setup: ask Laravel for one FunnelStep id per template_key so the
 * tests can hit /preview/step/:id without hard-coding fragile UUIDs. Output
 * lands in tests/e2e/fixtures/steps.json.
 */
export default async function globalSetup() {
  const repoRoot = resolve(__dirname, '../../..');
  const out = resolve(__dirname, 'fixtures/steps.json');
  mkdirSync(dirname(out), { recursive: true });

  let raw: string;
  try {
    raw = execFileSync('php', ['artisan', 'test:dump-step-fixtures', '--no-interaction'], {
      cwd: repoRoot,
      encoding: 'utf8',
    });
  } catch (err: unknown) {
    console.warn('[playwright] artisan test:dump-step-fixtures failed — tests that need step ids will be skipped.', err);
    writeFileSync(out, JSON.stringify({}, null, 2));
    return;
  }

  // Command prints JSON (plus artisan's own log output prefix). Isolate the
  // JSON braces block.
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  const json = start >= 0 && end > start ? raw.slice(start, end + 1) : '{}';
  writeFileSync(out, json);

  let parsed: Record<string, unknown> = {};
  try {
    parsed = JSON.parse(json);
  } catch {
    // leave parsed empty
  }
  console.log(`[playwright] wrote ${Object.keys(parsed).length} templates to ${out}`);
}
