import { NextResponse } from 'next/server';
import { designSectionImage } from '@/lib/blocks/image-stage';

export const runtime = 'nodejs';
export const maxDuration = 120;

function authorize(req: Request): boolean {
  const expected = process.env.INTERNAL_API_TOKEN;
  if (!expected) return false;
  return req.headers.get('authorization') === `Bearer ${expected}`;
}

export async function POST(req: Request): Promise<Response> {
  if (!authorize(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  if (!body?.section?.type || !body?.summit) {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 });
  }

  try {
    const out = await designSectionImage({
      section: body.section,
      summit: body.summit,
      styleBrief: body.styleBrief ?? {},
      referenceImage: body.referenceImage ?? null,
    });
    return NextResponse.json({ status: 'ok', mime: out.mime, base64: out.base64 });
  } catch (err) {
    return NextResponse.json(
      { status: 'image_failed', error: (err as Error).message ?? 'unknown' },
      { status: 200 },
    );
  }
}
