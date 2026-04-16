import { NextRequest, NextResponse } from 'next/server';
import { polishSection } from '@/lib/blocks/polish-stage';

export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (token !== process.env.INTERNAL_API_TOKEN) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body?.jsx || !body?.sectionType) {
    return NextResponse.json({ error: 'invalid body: jsx and sectionType required' }, { status: 400 });
  }

  const result = await polishSection({
    jsx: body.jsx,
    styleBrief: body.styleBrief ?? {},
    skeleton: body.skeleton ?? null,
    sectionType: body.sectionType,
  });

  return NextResponse.json(result);
}
