import { renderSection } from '@/lib/blocks/renderer';
import type { Section } from '@/lib/blocks/types';

// Node runtime — Turbopack's RSC analyzer doesn't apply here, so we can
// invoke UI primitives (Base UI / lucide) server-side via renderToString.
export const runtime = 'nodejs';

function authorize(req: Request): boolean {
  const expected = process.env.INTERNAL_API_TOKEN;
  if (!expected) return false;
  return req.headers.get('authorization') === `Bearer ${expected}`;
}

/**
 * Lightweight section-only renderer for the preview page.
 *
 * Unlike /api/drafts/[id]/preview (which calls publishDraft and wraps
 * everything in a full <html> document), this endpoint returns ONLY the
 * stitched section HTML so the caller can inject it inside an existing
 * layout. The returned HTML is produced by ReactDOMServer.renderToString,
 * so it is pre-escaped by React — no user input is concatenated raw.
 */
export async function POST(req: Request): Promise<Response> {
  if (!authorize(req)) {
    return new Response('unauthorized', { status: 401 });
  }

  let body: { sections?: Section[] };
  try {
    body = await req.json();
  } catch {
    return new Response('invalid json', { status: 400 });
  }

  const sections = Array.isArray(body.sections) ? body.sections : [];
  if (sections.length === 0) {
    return new Response('', { headers: { 'content-type': 'text/html; charset=utf-8' } });
  }

  const pieces = await Promise.all(
    sections.map(async (s) => {
      try {
        return await renderSection(s, {});
      } catch (err) {
        const msg = (err as Error).message.replace(/</g, '&lt;');
        return `<div style="padding:1rem;background:#fee;border:1px solid #fcc;color:#900;margin:1rem">Render error in ${s.type}: ${msg}</div>`;
      }
    }),
  );

  return new Response(pieces.join('\n'), {
    headers: { 'content-type': 'text/html; charset=utf-8' },
  });
}
