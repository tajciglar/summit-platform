import { NextResponse } from 'next/server';
import { designSection } from '@/lib/blocks/design-phase';

export const runtime = 'nodejs';
export const maxDuration = 180;

function authorize(req: Request): boolean {
  const expected = process.env.INTERNAL_API_TOKEN;
  if (!expected) return false;
  return req.headers.get('authorization') === `Bearer ${expected}`;
}

export async function POST(req: Request): Promise<Response> {
  if (!authorize(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const body = await req.json();
  if (!body?.section?.type || !body?.summit) {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 });
  }
  const section = await designSection({
    section: body.section,
    summit: body.summit,
    previousSectionJsx: body.previousSectionJsx ?? null,
    regenerationNote: body.regenerationNote ?? null,
    styleBrief: body.styleBrief ?? undefined,
    mockupImage: body.mockupImage ?? null,
    referenceImage: body.referenceImage ?? null,
  });
  return NextResponse.json(section);
}
