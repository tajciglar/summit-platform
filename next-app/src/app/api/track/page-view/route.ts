import { NextRequest, NextResponse } from 'next/server';

const LARAVEL = process.env.LARAVEL_API_URL ?? 'http://localhost:8000';

export async function POST(req: NextRequest) {
  const body = await req.text();

  const res = await fetch(`${LARAVEL}/api/track/page-view`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body,
  });

  if (res.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: { 'Content-Type': res.headers.get('Content-Type') ?? 'application/json' },
  });
}
