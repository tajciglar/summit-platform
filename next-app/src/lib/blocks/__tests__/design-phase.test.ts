import { describe, it, expect, vi, beforeEach } from 'vitest';
import { designSection } from '../design-phase';

vi.mock('../gemini-client', () => ({ callGemini: vi.fn() }));
vi.mock('../validator', () => ({ validateJsx: vi.fn(() => ({ ok: true })) }));
vi.mock('../design-prompt', () => ({ buildDesignPrompt: async () => ({ text: 'prompt' }) }));

import { callGemini } from '../gemini-client';
import { validateJsx } from '../validator';

const input = {
  section: { type: 'hero', purpose: '', position: 1, total: 1 },
  summit: { name: '', date: '', brandColors: {}, mode: 'light' as const, speakers: [], toneBrief: '', product: null },
  previousSectionJsx: null,
  regenerationNote: null,
};

beforeEach(() => vi.clearAllMocks());

describe('designSection', () => {
  it('returns ready section on first-pass success', async () => {
    vi.mocked(callGemini).mockResolvedValueOnce(JSON.stringify({
      jsx: 'export default function S(){return null}',
      fields: [],
    }));
    const result = await designSection(input);
    expect(result.status).toBe('ready');
    expect(result.fields).toEqual([]);
  });

  it('retries once on validator failure then marks failed', async () => {
    vi.mocked(callGemini).mockResolvedValue(JSON.stringify({ jsx: 'bad', fields: [] }));
    vi.mocked(validateJsx).mockReturnValue({ ok: false, error: 'forbidden import' });
    const result = await designSection(input);
    expect(result.status).toBe('failed');
    expect(vi.mocked(callGemini).mock.calls.length).toBe(2);
  });

  it('marks failed on malformed JSON twice', async () => {
    vi.mocked(callGemini).mockResolvedValue('not json');
    const result = await designSection(input);
    expect(result.status).toBe('failed');
  });
});
