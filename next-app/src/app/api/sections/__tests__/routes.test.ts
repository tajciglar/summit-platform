import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/blocks/design-phase', () => ({
  designSection: vi.fn(async () => ({
    id: 'x', type: 'hero', jsx: 'export default function S(){return null}',
    fields: [], status: 'ready', regeneration_note: null, source_section_id: null,
  })),
}));

import { POST as generate } from '../generate/route';

describe('POST /api/sections/generate', () => {
  beforeEach(() => { process.env.INTERNAL_API_TOKEN = 'test'; });

  it('returns section JSON when authorized', async () => {
    const req = new Request('http://localhost/api/sections/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer test' },
      body: JSON.stringify({
        section: { type: 'hero', purpose: '', position: 1, total: 1 },
        summit: { name: '', date: '', brandColors: {}, mode: 'light', speakers: [], toneBrief: '', product: null },
      }),
    });
    const res = await generate(req);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.status).toBe('ready');
  });

  it('rejects missing token', async () => {
    const req = new Request('http://localhost/api/sections/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    });
    const res = await generate(req);
    expect(res.status).toBe(401);
  });
});
