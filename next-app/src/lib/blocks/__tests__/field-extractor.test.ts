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

  it('strips props. prefix so values land at the correct level', () => {
    const ctx = {} as Record<string, unknown>;
    const updated = applyFieldValues(ctx, [
      { path: 'props.headline', kind: 'text', value: 'Hello' },
      { path: 'props.ctaHref', kind: 'url', value: '#go' },
    ]);
    expect(updated.headline).toBe('Hello');
    expect(updated.ctaHref).toBe('#go');
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

  it('passes array values through directly', () => {
    const ctx = {} as Record<string, unknown>;
    const updated = applyFieldValues(ctx, [
      { path: 'props.testimonials', kind: 'array', value: [{ name: 'Ada' }] },
    ]);
    expect((updated.testimonials as Array<{ name: string }>)[0].name).toBe('Ada');
  });

  it('reconstructs flat SectionField arrays into plain objects', () => {
    const ctx = {} as Record<string, unknown>;
    const updated = applyFieldValues(ctx, [
      {
        path: 'props.faqs',
        kind: 'array',
        value: [
          { kind: 'text', path: 'props.faqs[0].question', value: 'Q1?' },
          { kind: 'text', path: 'props.faqs[0].answer', value: 'A1' },
          { kind: 'text', path: 'props.faqs[1].question', value: 'Q2?' },
          { kind: 'text', path: 'props.faqs[1].answer', value: 'A2' },
        ],
      },
    ]);
    expect(updated.faqs).toEqual([
      { question: 'Q1?', answer: 'A1' },
      { question: 'Q2?', answer: 'A2' },
    ]);
  });

  it('reconstructs object-format SectionField arrays (TestimonialCarousel)', () => {
    const ctx = {} as Record<string, unknown>;
    const updated = applyFieldValues(ctx, [
      {
        path: 'props.testimonials',
        kind: 'array',
        value: [
          {
            name: { kind: 'text', path: 'props.testimonials[0].name', value: 'Ada' },
            rating: { kind: 'number', path: 'props.testimonials[0].rating', value: 5 },
          },
        ],
      },
    ]);
    expect(updated.testimonials).toEqual([
      { name: 'Ada', rating: 5 },
    ]);
  });
});
