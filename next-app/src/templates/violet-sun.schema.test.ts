import { describe, expect, it } from 'vitest';
import { VioletSunSchema } from './violet-sun.schema';
import { violetSunFixture } from './__fixtures__/violet-sun.fixture';

describe('VioletSunSchema', () => {
  it('accepts the known-good fixture', () => {
    expect(() => VioletSunSchema.parse(violetSunFixture)).not.toThrow();
  });

  it('rejects missing summit.name', () => {
    const bad = { ...violetSunFixture, summit: { ...violetSunFixture.summit, name: '' } };
    expect(() => VioletSunSchema.parse(bad)).toThrow();
  });

  it('rejects bonuses.items with zero entries', () => {
    const bad = { ...violetSunFixture, bonuses: { ...violetSunFixture.bonuses, items: [] } };
    expect(() => VioletSunSchema.parse(bad)).toThrow();
  });

  it('rejects faqs with fewer than 3 entries', () => {
    const bad = { ...violetSunFixture, faqs: violetSunFixture.faqs.slice(0, 2) };
    expect(() => VioletSunSchema.parse(bad)).toThrow();
  });

  it('requires hero.heroSpeakerIds to be UUIDs', () => {
    const bad = {
      ...violetSunFixture,
      hero: { ...violetSunFixture.hero, heroSpeakerIds: ['not-a-uuid'] },
    };
    expect(() => VioletSunSchema.parse(bad)).toThrow();
  });

  it('accepts closing without fineprint (optional field absent)', () => {
    const { fineprint: _ignored, ...closingWithout } = violetSunFixture.closing;
    const obj = { ...violetSunFixture, closing: closingWithout };
    expect(() => VioletSunSchema.parse(obj)).not.toThrow();
  });

  it('rejects figures with fewer than 6 items', () => {
    const bad = {
      ...violetSunFixture,
      figures: { ...violetSunFixture.figures, items: violetSunFixture.figures.items.slice(0, 5) },
    };
    expect(() => VioletSunSchema.parse(bad)).toThrow();
  });

  it('rejects figure trend values outside the enum', () => {
    const bad = {
      ...violetSunFixture,
      figures: {
        ...violetSunFixture.figures,
        items: [
          { ...violetSunFixture.figures.items[0], trend: 'exploding' },
          ...violetSunFixture.figures.items.slice(1),
        ],
      },
    };
    expect(() => VioletSunSchema.parse(bad)).toThrow();
  });

  it('rejects non-date summit.startDate', () => {
    const bad = {
      ...violetSunFixture,
      summit: { ...violetSunFixture.summit, startDate: 'tomorrow' },
    };
    expect(() => VioletSunSchema.parse(bad)).toThrow();
  });

  it('rejects shifts with exactly 4 items (requires 5)', () => {
    const bad = {
      ...violetSunFixture,
      shifts: { ...violetSunFixture.shifts, items: violetSunFixture.shifts.items.slice(0, 4) },
    };
    expect(() => VioletSunSchema.parse(bad)).toThrow();
  });
});
