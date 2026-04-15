import { NextResponse } from 'next/server';
import { publishDraft } from '@/lib/blocks/publisher';

export const runtime = 'nodejs';

function authorize(req: Request): boolean {
  const expected = process.env.INTERNAL_API_TOKEN;
  if (!expected) return false;
  return req.headers.get('authorization') === `Bearer ${expected}`;
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
): Promise<Response> {
  if (!authorize(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { id } = await ctx.params;
  const body = await req.json();
  if (!Array.isArray(body?.sections)) return NextResponse.json({ error: 'invalid body' }, { status: 400 });
  try {
    const result = await publishDraft(body.sections, body.defaultPropsPerSection);
    return NextResponse.json({ draftId: id, ...result });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 422 });
  }
}
