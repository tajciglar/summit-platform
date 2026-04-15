import { describe, it, expect, vi } from 'vitest';
import { buildDesignPrompt } from '../design-prompt';

// Mock the prompt-parts module. The mock specifier MUST match the resolved
// module identity used by design-prompt.ts (which imports via
// '../../../scripts/lib/prompt-parts'). Vitest resolves both paths to the
// same absolute module URL, so mocking against the test-file-relative path
// works as long as it points to the same file.
vi.mock('../../../../scripts/lib/prompt-parts', () => ({
  loadDesignSystem: async () => 'DESIGN_SYSTEM_STUB',
  loadPrimitiveSources: async () => 'PRIMITIVE_STUB',
  loadReferenceImage: async () => null,
}));

describe('buildDesignPrompt', () => {
  it('includes section brief, summit context, and output contract', async () => {
    const prompt = await buildDesignPrompt({
      section: { type: 'speakers_grid', purpose: 'Show speakers', position: 3, total: 7 },
      summit: { name: 'AWS25', date: '2026-05-01', brandColors: { primary: '#14b8a6' }, mode: 'dark', speakers: [], toneBrief: 'warm', product: null },
      previousSectionJsx: null,
      regenerationNote: null,
    });
    expect(prompt.text).toContain('speakers_grid');
    expect(prompt.text).toContain('AWS25');
    expect(prompt.text).toContain('"jsx"');
    expect(prompt.text).toContain('"fields"');
    expect(prompt.text).toContain('DESIGN_SYSTEM_STUB');
  });

  it('includes regeneration note when present', async () => {
    const prompt = await buildDesignPrompt({
      section: { type: 'hero', purpose: '', position: 1, total: 1 },
      summit: { name: 'X', date: '', brandColors: {}, mode: 'light', speakers: [], toneBrief: '', product: null },
      previousSectionJsx: null,
      regenerationNote: 'make it bigger',
    });
    expect(prompt.text).toContain('make it bigger');
  });
});
