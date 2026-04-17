import { NextRequest, NextResponse } from 'next/server';

const LARAVEL = process.env.LARAVEL_API_URL ?? 'http://localhost:8000';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const res = await fetch(`${LARAVEL}/api/optins`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: { 'Content-Type': 'application/json' },
  });
}
