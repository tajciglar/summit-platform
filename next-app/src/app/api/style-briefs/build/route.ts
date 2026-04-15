import { NextResponse } from 'next/server';
import { screenshotUrl } from '@/lib/blocks/playwright-service';
import { extractBriefFromScreenshot } from '@/lib/blocks/vision-brief-extractor';

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
  const url: string = body?.url ?? '';
  const summitContext = body?.summit_context ?? {};

  if (!url) return NextResponse.json({ error: 'missing url' }, { status: 400 });

  // Try screenshot first — separable failure mode from vision call.
  let shotBase64 = '';
  let shotMime: 'image/png' = 'image/png';
  try {
    const shot = await screenshotUrl(url);
    shotBase64 = shot.base64;
    shotMime = shot.mime;
  } catch (err) {
    return NextResponse.json(
      { status: 'failed_screenshot', error: (err as Error).message ?? 'unknown' },
      { status: 200 },
    );
  }

  try {
    const brief = await extractBriefFromScreenshot(shotBase64, summitContext, url);
    return NextResponse.json({
      status: 'ready',
      brief,
      reference_png_base64: shotBase64,
      reference_png_mime: shotMime,
    });
  } catch (err) {
    return NextResponse.json(
      {
        status: 'failed_vision',
        error: (err as Error).message ?? 'unknown',
        // Operator can still use the screenshot even if vision broke.
        reference_png_base64: shotBase64,
        reference_png_mime: shotMime,
      },
      { status: 200 },
    );
  }
}
