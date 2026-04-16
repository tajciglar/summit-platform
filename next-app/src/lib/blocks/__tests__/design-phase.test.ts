import { describe, it, expect, vi, beforeEach } from 'vitest';
import { designSection } from '../design-phase';

vi.mock('../image-stage', () => ({
  designSectionImage: vi.fn(),
}));
vi.mock('../claude-coder', () => ({
  claudeGenerateCode: vi.fn(),
}));
vi.mock('../validator', () => ({
  validateJsx: vi.fn(() => ({ ok: true })),
}));
vi.mock('../component-registry', () => ({
  buildComponentRegistry: vi.fn(() => 'REGISTRY_STUB'),
}));

import { designSectionImage } from '../image-stage';
import { claudeGenerateCode } from '../claude-coder';
import { validateJsx } from '../validator';

const input = {
  section: { type: 'HeroWithCountdown', purpose: 'Main hero', position: 1, total: 8 },
  summit: { name: 'Test', date: '2026-05-01', brandColors: {}, mode: 'light' as const, speakers: [], toneBrief: 'warm', product: null },
  previousSectionJsx: null,
  regenerationNote: null,
  styleBrief: { palette: { primary: '#704fe6' } },
};

beforeEach(() => vi.clearAllMocks());

describe('designSection (V3 multi-stage)', () => {
  it('generates mockup then code on happy path', async () => {
    vi.mocked(designSectionImage).mockResolvedValueOnce({ mime: 'image/png', base64: 'mockup_data' });
    vi.mocked(claudeGenerateCode).mockResolvedValueOnce({
      jsx: 'export default function S(props) { return <section>Test</section> }',
      fields: [{ path: 'props.headline', kind: 'text', value: 'Test' }],
    });

    const result = await designSection(input);
    expect(result.status).toBe('ready');
    expect(result.jsx).toContain('export default function S');
    expect(result.fields).toHaveLength(1);

    expect(vi.mocked(designSectionImage)).toHaveBeenCalledOnce();
    expect(vi.mocked(claudeGenerateCode)).toHaveBeenCalledWith(
      expect.objectContaining({
        mockupImage: { mime: 'image/png', data: 'mockup_data' },
      }),
    );
  });

  it('continues without mockup when image stage fails', async () => {
    vi.mocked(designSectionImage).mockRejectedValueOnce(new Error('Gemini image timeout'));
    vi.mocked(claudeGenerateCode).mockResolvedValueOnce({
      jsx: 'export default function S(props) { return null }',
      fields: [],
    });

    const result = await designSection(input);
    expect(result.status).toBe('ready');

    expect(vi.mocked(claudeGenerateCode)).toHaveBeenCalledWith(
      expect.objectContaining({
        mockupImage: null,
      }),
    );
  });

  it('retries Claude once on validation failure', async () => {
    vi.mocked(designSectionImage).mockResolvedValue({ mime: 'image/png', base64: 'data' });
    vi.mocked(claudeGenerateCode).mockResolvedValue({
      jsx: 'import bad from "lucide-react";\nexport default function S(){return null}',
      fields: [],
    });
    vi.mocked(validateJsx)
      .mockReturnValueOnce({ ok: false, error: 'forbidden import: lucide-react' })
      .mockReturnValueOnce({ ok: false, error: 'forbidden import: lucide-react' });

    const result = await designSection(input);
    expect(result.status).toBe('failed');
    expect(vi.mocked(claudeGenerateCode).mock.calls.length).toBe(2);
  });

  it('marks failed when Claude returns null', async () => {
    vi.mocked(designSectionImage).mockResolvedValue({ mime: 'image/png', base64: 'data' });
    vi.mocked(claudeGenerateCode).mockResolvedValue(null);

    const result = await designSection(input);
    expect(result.status).toBe('failed');
    expect(result.error).toContain('empty or unparseable');
  });

  it('skips image stage when mockupImage is pre-supplied', async () => {
    vi.mocked(claudeGenerateCode).mockResolvedValueOnce({
      jsx: 'export default function S(props) { return null }',
      fields: [],
    });

    const result = await designSection({
      ...input,
      mockupImage: { mime: 'image/png', data: 'pre_supplied' },
    });

    expect(result.status).toBe('ready');
    expect(vi.mocked(designSectionImage)).not.toHaveBeenCalled();
    expect(vi.mocked(claudeGenerateCode)).toHaveBeenCalledWith(
      expect.objectContaining({
        mockupImage: { mime: 'image/png', data: 'pre_supplied' },
      }),
    );
  });
});
