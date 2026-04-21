import { describe, expect, it } from 'vitest';
import { OchreInkSchema } from './ochre-ink.schema';
import { ochreInkFixture } from './__fixtures__/ochre-ink.fixture';

describe('OchreInkSchema', () => {
  it('accepts the known-good fixture', () => {
    expect(() => OchreInkSchema.parse(ochreInkFixture)).not.toThrow();
  });

  it('rejects missing summit.name', () => {
    const bad = { ...ochreInkFixture, summit: { ...ochreInkFixture.summit, name: '' } };
    expect(() => OchreInkSchema.parse(bad)).toThrow();
  });

  it('rejects bonusStack with zero entries', () => {
    const bad = { ...ochreInkFixture, bonusStack: [] };
    expect(() => OchreInkSchema.parse(bad)).toThrow();
  });

  it('rejects faqs with fewer than 3 entries', () => {
    const bad = { ...ochreInkFixture, faqs: ochreInkFixture.faqs.slice(0, 2) };
    expect(() => OchreInkSchema.parse(bad)).toThrow();
  });

  it('requires speakersByDay[].speakerIds to be UUIDs', () => {
    const bad = {
      ...ochreInkFixture,
      speakersByDay: [{ ...ochreInkFixture.speakersByDay[0], speakerIds: ['not-a-uuid'] }],
    };
    expect(() => OchreInkSchema.parse(bad)).toThrow();
  });

  it('accepts hero without ctaSubtext (optional field absent)', () => {
    const { ctaSubtext: _ignored, ...heroWithout } = ochreInkFixture.hero;
    const obj = { ...ochreInkFixture, hero: heroWithout };
    expect(() => OchreInkSchema.parse(obj)).not.toThrow();
  });

  it('rejects bonusStack with more than 5 entries', () => {
    const base = ochreInkFixture.bonusStack[0];
    const bad = {
      ...ochreInkFixture,
      bonusStack: Array.from({ length: 6 }, () => base),
    };
    expect(() => OchreInkSchema.parse(bad)).toThrow();
  });

  it('rejects faqs with more than 10 entries', () => {
    const base = ochreInkFixture.faqs[0];
    const bad = {
      ...ochreInkFixture,
      faqs: Array.from({ length: 11 }, () => base),
    };
    expect(() => OchreInkSchema.parse(bad)).toThrow();
  });
});
