import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockCreate = vi.fn();

vi.mock('@anthropic-ai/sdk', () => {
  function MockAnthropic() {
    return { messages: { create: mockCreate } };
  }
  return { default: MockAnthropic };
});

import { claudeGenerateCode } from '../claude-coder';
import type { ClaudeCoderInput } from '../claude-coder';

const baseInput: ClaudeCoderInput = {
  registry: 'component registry text',
  section: { type: 'hero', purpose: 'intro', position: 1, total: 5 },
  summit: {
    name: 'Test Summit',
    date: '2026-05-01',
    brandColors: { primary: '#ff0000' },
    mode: 'light',
    speakers: [],
    toneBrief: 'professional',
    product: null,
  },
  mockupImage: null,
  skeleton: null,
  previousSectionJsx: null,
  regenerationNote: null,
};

const validEnvelope = {
  jsx: 'export default function S(props) { return <section>{props.headline}</section> }',
  fields: [{ path: 'props.headline', kind: 'text', value: 'Hello' }],
};

beforeEach(() => {
  vi.clearAllMocks();
  process.env.ANTHROPIC_API_KEY = 'test-key';
});

describe('claudeGenerateCode', () => {
  it('returns parsed envelope on valid JSON response', async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: 'text', text: JSON.stringify(validEnvelope) }],
    });

    const result = await claudeGenerateCode(baseInput);

    expect(result).not.toBeNull();
    expect(result?.jsx).toBe(validEnvelope.jsx);
    expect(result?.fields).toEqual(validEnvelope.fields);
  });

  it('handles markdown-fenced JSON response', async () => {
    const fenced = '```json\n' + JSON.stringify(validEnvelope) + '\n```';
    mockCreate.mockResolvedValueOnce({
      content: [{ type: 'text', text: fenced }],
    });

    const result = await claudeGenerateCode(baseInput);

    expect(result).not.toBeNull();
    expect(result?.jsx).toBe(validEnvelope.jsx);
  });

  it('returns null on unparseable response', async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: 'text', text: 'this is not json at all' }],
    });

    const result = await claudeGenerateCode(baseInput);

    expect(result).toBeNull();
  });

  it('includes mockup image in API call when provided', async () => {
    const mockImageInput: ClaudeCoderInput = {
      ...baseInput,
      mockupImage: { mime: 'image/png', data: 'base64encodeddata' },
    };

    mockCreate.mockResolvedValueOnce({
      content: [{ type: 'text', text: JSON.stringify(validEnvelope) }],
    });

    await claudeGenerateCode(mockImageInput);

    const callArgs = mockCreate.mock.calls[0][0] as {
      messages: Array<{ role: string; content: Array<{ type: string }> }>;
    };
    const content = callArgs.messages[0].content;
    expect(content.some((block) => block.type === 'image')).toBe(true);
  });

  it('returns null when ANTHROPIC_API_KEY is missing', async () => {
    delete process.env.ANTHROPIC_API_KEY;

    const result = await claudeGenerateCode(baseInput);

    expect(result).toBeNull();
    expect(mockCreate).not.toHaveBeenCalled();
  });
});
