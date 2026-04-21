import { describe, expect, it } from 'vitest';
import { CreamSageSchema } from './cream-sage.schema';
import { creamSageFixture } from './__fixtures__/cream-sage.fixture';

describe('CreamSageSchema', () => {
  it('accepts the known-good fixture', () => {
    expect(() => CreamSageSchema.parse(creamSageFixture)).not.toThrow();
  });

  it('rejects missing summit.name', () => {
    const bad = { ...creamSageFixture, summit: { ...creamSageFixture.summit, name: '' } };
    expect(() => CreamSageSchema.parse(bad)).toThrow();
  });

  it('rejects bonuses.items with zero entries', () => {
    const bad = { ...creamSageFixture, bonuses: { ...creamSageFixture.bonuses, items: [] } };
    expect(() => CreamSageSchema.parse(bad)).toThrow();
  });

  it('rejects faqs with fewer than 3 entries', () => {
    const bad = { ...creamSageFixture, faqs: creamSageFixture.faqs.slice(0, 2) };
    expect(() => CreamSageSchema.parse(bad)).toThrow();
  });

  it('requires hero.heroSpeakerIds to be UUIDs', () => {
    const bad = {
      ...creamSageFixture,
      hero: { ...creamSageFixture.hero, heroSpeakerIds: ['not-a-uuid'] },
    };
    expect(() => CreamSageSchema.parse(bad)).toThrow();
  });

  it('accepts closing without fineprint (optional field absent)', () => {
    const { fineprint: _ignored, ...closingWithout } = creamSageFixture.closing;
    const obj = { ...creamSageFixture, closing: closingWithout };
    expect(() => CreamSageSchema.parse(obj)).not.toThrow();
  });

  it('rejects figures with fewer than 6 items', () => {
    const bad = {
      ...creamSageFixture,
      figures: { ...creamSageFixture.figures, items: creamSageFixture.figures.items.slice(0, 5) },
    };
    expect(() => CreamSageSchema.parse(bad)).toThrow();
  });

  it('rejects outcomes with fewer than 6 items', () => {
    const bad = {
      ...creamSageFixture,
      outcomes: {
        ...creamSageFixture.outcomes,
        items: creamSageFixture.outcomes.items.slice(0, 5),
      },
    };
    expect(() => CreamSageSchema.parse(bad)).toThrow();
  });

  it('rejects shifts with fewer than 5 items', () => {
    const bad = {
      ...creamSageFixture,
      shifts: { ...creamSageFixture.shifts, items: creamSageFixture.shifts.items.slice(0, 4) },
    };
    expect(() => CreamSageSchema.parse(bad)).toThrow();
  });

  it('rejects invalid startDate', () => {
    const bad = {
      ...creamSageFixture,
      summit: { ...creamSageFixture.summit, startDate: 'not-a-date' },
    };
    expect(() => CreamSageSchema.parse(bad)).toThrow();
  });
});
