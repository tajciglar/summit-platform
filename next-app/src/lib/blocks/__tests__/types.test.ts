import { describe, it, expect } from 'vitest';
import type { Section } from '../types';
import { isSectionReady, makeSection } from '../types';

describe('Section types', () => {
  it('makeSection returns ready section with uuid', () => {
    const s = makeSection({ type: 'speakers_grid', jsx: 'export default function S(){return null}', fields: [] });
    expect(s.id).toMatch(/[0-9a-f-]{36}/);
    expect(s.status).toBe('ready');
    expect(s.type).toBe('speakers_grid');
  });
  it('isSectionReady narrows status', () => {
    const s: Section = makeSection({ type: 't', jsx: '', fields: [] });
    expect(isSectionReady(s)).toBe(true);
  });
});
