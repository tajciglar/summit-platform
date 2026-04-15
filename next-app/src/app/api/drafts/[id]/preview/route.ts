import { publishDraft } from '@/lib/blocks/publisher';

function authorize(req: Request): boolean {
  const expected = process.env.INTERNAL_API_TOKEN;
  if (!expected) return false;
  return req.headers.get('authorization') === `Bearer ${expected}`;
}

export async function POST(req: Request): Promise<Response> {
  if (!authorize(req)) return new Response('unauthorized', { status: 401 });
  const body = await req.json();
  try {
    const { html } = await publishDraft(body.sections, body.defaultPropsPerSection);
    return new Response(html, { headers: { 'Content-Type': 'text/html' } });
  } catch (err) {
    return new Response((err as Error).message, { status: 422 });
  }
}
