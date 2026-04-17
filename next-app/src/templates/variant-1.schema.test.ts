import { describe, expect, it } from 'vitest';
import { Variant1Schema } from './variant-1.schema';
import { variant1Fixture } from './__fixtures__/variant-1.fixture';

describe('Variant1Schema', () => {
  it('accepts the known-good fixture', () => {
    expect(() => Variant1Schema.parse(variant1Fixture)).not.toThrow();
  });

  it('rejects missing summit.name', () => {
    const bad = { ...variant1Fixture, summit: { ...variant1Fixture.summit, name: '' } };
    expect(() => Variant1Schema.parse(bad)).toThrow();
  });

  it('rejects bonuses.items with zero entries', () => {
    const bad = {
      ...variant1Fixture,
      bonuses: { ...variant1Fixture.bonuses, items: [] },
    };
    expect(() => Variant1Schema.parse(bad)).toThrow();
  });

  it('rejects faqs with fewer than 3 entries', () => {
    const bad = { ...variant1Fixture, faqs: variant1Fixture.faqs.slice(0, 2) };
    expect(() => Variant1Schema.parse(bad)).toThrow();
  });

  it('requires hero.heroSpeakerIds to be UUIDs', () => {
    const bad = {
      ...variant1Fixture,
      hero: { ...variant1Fixture.hero, heroSpeakerIds: ['not-a-uuid'] },
    };
    expect(() => Variant1Schema.parse(bad)).toThrow();
  });

  it('rejects outcomes with fewer than 6 items', () => {
    const bad = {
      ...variant1Fixture,
      outcomes: {
        ...variant1Fixture.outcomes,
        items: variant1Fixture.outcomes.items.slice(0, 5),
      },
    };
    expect(() => Variant1Schema.parse(bad)).toThrow();
  });

  it('rejects outcome.accent values outside the enum', () => {
    const bad = {
      ...variant1Fixture,
      outcomes: {
        ...variant1Fixture.outcomes,
        items: [
          { ...variant1Fixture.outcomes.items[0], accent: 'tertiary' },
          ...variant1Fixture.outcomes.items.slice(1),
        ],
      },
    };
    expect(() => Variant1Schema.parse(bad)).toThrow();
  });

  it('rejects trust icon values outside the enum', () => {
    const bad = {
      ...variant1Fixture,
      trust: {
        items: [
          { label: 'Free', icon: 'rocket' },
          ...variant1Fixture.trust.items.slice(1),
        ],
      },
    };
    expect(() => Variant1Schema.parse(bad)).toThrow();
  });

  it('rejects stats with wrong item count', () => {
    const bad = {
      ...variant1Fixture,
      stats: { items: variant1Fixture.stats.items.slice(0, 2) },
    };
    expect(() => Variant1Schema.parse(bad)).toThrow();
  });

  it('rejects figures with fewer than 6 items', () => {
    const bad = {
      ...variant1Fixture,
      figures: {
        ...variant1Fixture.figures,
        items: variant1Fixture.figures.items.slice(0, 5),
      },
    };
    expect(() => Variant1Schema.parse(bad)).toThrow();
  });

  it('rejects shifts with fewer than 5 items', () => {
    const bad = {
      ...variant1Fixture,
      shifts: {
        ...variant1Fixture.shifts,
        items: variant1Fixture.shifts.items.slice(0, 4),
      },
    };
    expect(() => Variant1Schema.parse(bad)).toThrow();
  });
});
