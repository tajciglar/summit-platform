import { describe, it, expect } from 'vitest';
import { applyFieldValues } from '../field-extractor';

describe('applyFieldValues', () => {
  it('substitutes a simple path into a context object', () => {
    const ctx = { heading: 'Original' };
    const updated = applyFieldValues(ctx, [
      { path: 'heading', kind: 'text', value: 'New' },
    ]);
    expect(updated.heading).toBe('New');
  });
  it('substitutes a nested array path', () => {
    const ctx = { speakers: [{ photo: 'old' }, { photo: 'old2' }] };
    const updated = applyFieldValues(ctx, [
      { path: 'speakers.0.photo', kind: 'image', value: 'new' },
    ]);
    expect((updated.speakers as Array<{photo:string}>)[0].photo).toBe('new');
    expect((updated.speakers as Array<{photo:string}>)[1].photo).toBe('old2');
  });
  it('auto-vivifies missing intermediate objects for runtime-generated props', () => {
    const ctx = { heading: 'x' } as Record<string, unknown>;
    const updated = applyFieldValues(ctx, [
      { path: 'missing.deep', kind: 'text', value: 'nope' },
    ]);
    expect(updated).toEqual({ heading: 'x', missing: { deep: 'nope' } });
  });

  it('supports array values under auto-created paths', () => {
    const ctx = {} as Record<string, unknown>;
    const updated = applyFieldValues(ctx, [
      { path: 'props.testimonials', kind: 'text', value: [{ name: 'Ada' }] as unknown as string },
    ]);
    expect((updated.props as { testimonials: Array<{ name: string }> }).testimonials[0].name).toBe('Ada');
  });
});
