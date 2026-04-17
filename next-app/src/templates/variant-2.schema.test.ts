import { describe, expect, it } from 'vitest';
import { Variant2Schema } from './variant-2.schema';
import { variant2Fixture } from './__fixtures__/variant-2.fixture';

describe('Variant2Schema', () => {
  it('accepts the known-good fixture', () => {
    expect(() => Variant2Schema.parse(variant2Fixture)).not.toThrow();
  });

  it('rejects missing summit.name', () => {
    const bad = { ...variant2Fixture, summit: { ...variant2Fixture.summit, name: '' } };
    expect(() => Variant2Schema.parse(bad)).toThrow();
  });

  it('rejects bonuses.items with zero entries', () => {
    const bad = { ...variant2Fixture, bonuses: { ...variant2Fixture.bonuses, items: [] } };
    expect(() => Variant2Schema.parse(bad)).toThrow();
  });

  it('rejects faqs with fewer than 3 entries', () => {
    const bad = { ...variant2Fixture, faqs: variant2Fixture.faqs.slice(0, 2) };
    expect(() => Variant2Schema.parse(bad)).toThrow();
  });

  it('requires hero.avatarSpeakerIds to be UUIDs', () => {
    const bad = {
      ...variant2Fixture,
      hero: { ...variant2Fixture.hero, avatarSpeakerIds: ['not-a-uuid'] },
    };
    expect(() => Variant2Schema.parse(bad)).toThrow();
  });

  it('rejects figures with fewer than 6 items', () => {
    const bad = {
      ...variant2Fixture,
      figures: { ...variant2Fixture.figures, items: variant2Fixture.figures.items.slice(0, 5) },
    };
    expect(() => Variant2Schema.parse(bad)).toThrow();
  });

  it('rejects closing.pills with fewer than 6 items', () => {
    const bad = {
      ...variant2Fixture,
      closing: { ...variant2Fixture.closing, pills: variant2Fixture.closing.pills.slice(0, 5) },
    };
    expect(() => Variant2Schema.parse(bad)).toThrow();
  });

  it('rejects trustBadges icon values outside the enum', () => {
    const bad = {
      ...variant2Fixture,
      trustBadges: {
        items: [
          { icon: 'bogus', label: 'Fake' },
          ...variant2Fixture.trustBadges.items.slice(1),
        ],
      },
    };
    expect(() => Variant2Schema.parse(bad)).toThrow();
  });

  it('rejects shifts with fewer than 5 items', () => {
    const bad = {
      ...variant2Fixture,
      shifts: { ...variant2Fixture.shifts, items: variant2Fixture.shifts.items.slice(0, 4) },
    };
    expect(() => Variant2Schema.parse(bad)).toThrow();
  });

  it('rejects outcomes with more than 6 items', () => {
    const bad = {
      ...variant2Fixture,
      outcomes: {
        ...variant2Fixture.outcomes,
        items: [...variant2Fixture.outcomes.items, variant2Fixture.outcomes.items[0]],
      },
    };
    expect(() => Variant2Schema.parse(bad)).toThrow();
  });
});
