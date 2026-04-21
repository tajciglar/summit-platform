import { describe, expect, it } from 'vitest';
import { GreenGoldSchema } from './green-gold.schema';
import { greenGoldFixture } from './__fixtures__/green-gold.fixture';

describe('GreenGoldSchema', () => {
  it('accepts the known-good fixture', () => {
    expect(() => GreenGoldSchema.parse(greenGoldFixture)).not.toThrow();
  });

  it('rejects missing summit.name', () => {
    const bad = { ...greenGoldFixture, summit: { ...greenGoldFixture.summit, name: '' } };
    expect(() => GreenGoldSchema.parse(bad)).toThrow();
  });

  it('rejects bonuses.items with zero entries', () => {
    const bad = { ...greenGoldFixture, bonuses: { ...greenGoldFixture.bonuses, items: [] } };
    expect(() => GreenGoldSchema.parse(bad)).toThrow();
  });

  it('rejects faqs with fewer than 3 entries', () => {
    const bad = { ...greenGoldFixture, faqs: greenGoldFixture.faqs.slice(0, 2) };
    expect(() => GreenGoldSchema.parse(bad)).toThrow();
  });

  it('requires hero.heroSpeakerIds to be UUIDs', () => {
    const bad = {
      ...greenGoldFixture,
      hero: { ...greenGoldFixture.hero, heroSpeakerIds: ['not-a-uuid'] },
    };
    expect(() => GreenGoldSchema.parse(bad)).toThrow();
  });

  it('rejects figures with fewer than 6 items', () => {
    const bad = {
      ...greenGoldFixture,
      figures: {
        ...greenGoldFixture.figures,
        items: greenGoldFixture.figures.items.slice(0, 5),
      },
    };
    expect(() => GreenGoldSchema.parse(bad)).toThrow();
  });

  it('rejects shifts with fewer than 5 items', () => {
    const bad = {
      ...greenGoldFixture,
      shifts: {
        ...greenGoldFixture.shifts,
        items: greenGoldFixture.shifts.items.slice(0, 4),
      },
    };
    expect(() => GreenGoldSchema.parse(bad)).toThrow();
  });

  it('rejects outcomes with more than 6 items', () => {
    const bad = {
      ...greenGoldFixture,
      outcomes: {
        ...greenGoldFixture.outcomes,
        items: [...greenGoldFixture.outcomes.items, greenGoldFixture.outcomes.items[0]],
      },
    };
    expect(() => GreenGoldSchema.parse(bad)).toThrow();
  });

  it('rejects summit.startDate that is not a valid ISO date', () => {
    const bad = {
      ...greenGoldFixture,
      summit: { ...greenGoldFixture.summit, startDate: 'not-a-date' },
    };
    expect(() => GreenGoldSchema.parse(bad)).toThrow();
  });
});
