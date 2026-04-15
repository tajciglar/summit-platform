import fs from 'fs/promises';
import path from 'path';
import { renderSection } from './renderer';
import type { Section } from './types';

export interface PublishResult {
  html: string;
  manifest: Record<string, number>;
}

export async function publishDraft(
  sections: Section[],
  defaultPropsPerSection?: Record<string, Record<string, unknown>>,
): Promise<PublishResult> {
  for (const s of sections) {
    if (s.status === 'failed') throw new Error(`cannot publish: section ${s.id} failed`);
  }

  const htmls = await Promise.all(sections.map(s =>
    renderSection(s, defaultPropsPerSection?.[s.id] ?? {})
  ));

  const manifest = buildManifest(htmls);
  const runtimeSource = await loadRuntimeSource();

  const body = htmls.join('\n');
  const html = [
    '<!doctype html>',
    '<html><head><meta charset="utf-8"/><link rel="stylesheet" href="/_published/styles.css"/></head>',
    `<body>${body}<script>${runtimeSource}</script></body>`,
    '</html>',
  ].join('\n');

  return { html, manifest };
}

function buildManifest(htmls: string[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const html of htmls) {
    const matches = html.matchAll(/data-hydrate="([^"]+)"/g);
    for (const m of matches) counts[m[1]] = (counts[m[1]] ?? 0) + 1;
  }
  return counts;
}

async function loadRuntimeSource(): Promise<string> {
  const p = path.join(process.cwd(), 'dist/client-runtime.js');
  try { return await fs.readFile(p, 'utf8'); }
  catch { return ''; }
}
