import { describe, expect, it } from 'vitest';
import { Variant3Schema } from './variant-3.schema';
import { variant3Fixture } from './__fixtures__/variant-3.fixture';

describe('Variant3Schema', () => {
  it('accepts the known-good fixture', () => {
    expect(() => Variant3Schema.parse(variant3Fixture)).not.toThrow();
  });

  it('rejects missing summit.name', () => {
    const bad = { ...variant3Fixture, summit: { ...variant3Fixture.summit, name: '' } };
    expect(() => Variant3Schema.parse(bad)).toThrow();
  });

  it('rejects bonuses.items with zero entries', () => {
    const bad = { ...variant3Fixture, bonuses: { ...variant3Fixture.bonuses, items: [] } };
    expect(() => Variant3Schema.parse(bad)).toThrow();
  });

  it('rejects faqs with fewer than 3 entries', () => {
    const bad = { ...variant3Fixture, faqs: variant3Fixture.faqs.slice(0, 2) };
    expect(() => Variant3Schema.parse(bad)).toThrow();
  });

  it('requires hero.heroSpeakerIds to be UUIDs', () => {
    const bad = {
      ...variant3Fixture,
      hero: { ...variant3Fixture.hero, heroSpeakerIds: ['not-a-uuid'] },
    };
    expect(() => Variant3Schema.parse(bad)).toThrow();
  });

  it('rejects figures with fewer than 6 items', () => {
    const bad = {
      ...variant3Fixture,
      figures: {
        ...variant3Fixture.figures,
        items: variant3Fixture.figures.items.slice(0, 5),
      },
    };
    expect(() => Variant3Schema.parse(bad)).toThrow();
  });

  it('rejects shifts with fewer than 5 items', () => {
    const bad = {
      ...variant3Fixture,
      shifts: {
        ...variant3Fixture.shifts,
        items: variant3Fixture.shifts.items.slice(0, 4),
      },
    };
    expect(() => Variant3Schema.parse(bad)).toThrow();
  });

  it('rejects outcomes with more than 6 items', () => {
    const bad = {
      ...variant3Fixture,
      outcomes: {
        ...variant3Fixture.outcomes,
        items: [...variant3Fixture.outcomes.items, variant3Fixture.outcomes.items[0]],
      },
    };
    expect(() => Variant3Schema.parse(bad)).toThrow();
  });

  it('rejects summit.startDate that is not a valid ISO date', () => {
    const bad = {
      ...variant3Fixture,
      summit: { ...variant3Fixture.summit, startDate: 'not-a-date' },
    };
    expect(() => Variant3Schema.parse(bad)).toThrow();
  });
});
