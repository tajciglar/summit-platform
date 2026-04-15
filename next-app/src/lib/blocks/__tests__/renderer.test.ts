import { describe, it, expect } from 'vitest';
import { renderSection } from '../renderer';
import { makeSection } from '../types';

describe('renderSection', () => {
  it('renders simple section to HTML', async () => {
    const section = makeSection({
      type: 'hero',
      jsx: `export default function S({heading='default'}:{heading?:string}){ return <h1>{heading}</h1>; }`,
      fields: [{ path: 'heading', kind: 'text', value: 'Hello World' }],
    });
    const html = await renderSection(section, { heading: 'default' });
    expect(html).toContain('Hello World');
    expect(html).toContain('<h1');
  });
  it('throws for failed section status', async () => {
    const section = { ...makeSection({ type: 'x', jsx: '', fields: [] }), status: 'failed' as const };
    await expect(renderSection(section, {})).rejects.toThrow();
  });
});
