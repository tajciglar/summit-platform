import { describe, it, expect } from 'vitest';
import { publishDraft } from '../publisher';
import { makeSection } from '../types';

describe('publishDraft', () => {
  it('concatenates sections and includes hydration script tag', async () => {
    const sections = [
      makeSection({ type: 'hero', jsx: `export default function S(){ return <h1>Hi</h1>; }`, fields: [] }),
      makeSection({ type: 'faq', jsx: `export default function S(){ return <div data-hydrate="accordion">A</div>; }`, fields: [] }),
    ];
    const out = await publishDraft(sections);
    expect(out.html).toContain('<h1>Hi</h1>');
    expect(out.html).toContain('data-hydrate="accordion"');
    expect(out.html).toContain('<script');
    expect(out.manifest.accordion).toBe(1);
  });
  it('throws if any section is failed', async () => {
    const bad = { ...makeSection({ type: 'x', jsx: '', fields: [] }), status: 'failed' as const };
    await expect(publishDraft([bad])).rejects.toThrow();
  });
});
