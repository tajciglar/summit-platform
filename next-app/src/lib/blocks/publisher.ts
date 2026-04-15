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

  const htmls = await Promise.all(sections.map(async (s) => {
    try {
      return await renderSection(s, defaultPropsPerSection?.[s.id] ?? {});
    } catch (err) {
      // Gemini JSX occasionally references props that aren't declared in the
      // `fields` array (e.g. props.items.map() when only props.title is set).
      // Rather than failing the whole publish, substitute a visible error
      // placeholder so the rest of the page still ships.
      const msg = (err as Error).message.replace(/</g, '&lt;');
      return (
        `<section style="padding:1.5rem;background:#fef2f2;border:1px solid #fecaca;color:#991b1b;margin:1rem 0;font-family:system-ui">` +
        `<strong>Render error in ${s.type}</strong><br/>` +
        `<code style="font-size:0.875rem">${msg}</code>` +
        `</section>`
      );
    }
  }));

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
