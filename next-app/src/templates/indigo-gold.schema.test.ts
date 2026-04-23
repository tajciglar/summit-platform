import { describe, expect, it } from 'vitest';
import { IndigoGoldSchema } from './indigo-gold.schema';
import { indigoGoldFixture } from './__fixtures__/indigo-gold.fixture';

describe('IndigoGoldSchema', () => {
  it('accepts the known-good fixture', () => {
    expect(() => IndigoGoldSchema.parse(indigoGoldFixture)).not.toThrow();
  });

  it('rejects missing summit.name', () => {
    const bad = { ...indigoGoldFixture, summit: { ...indigoGoldFixture.summit, name: '' } };
    expect(() => IndigoGoldSchema.parse(bad)).toThrow();
  });

  it('rejects bonuses.items with zero entries', () => {
    const bad = { ...indigoGoldFixture, bonuses: { ...indigoGoldFixture.bonuses, items: [] } };
    expect(() => IndigoGoldSchema.parse(bad)).toThrow();
  });

  it('rejects faqs with fewer than 3 entries', () => {
    const bad = { ...indigoGoldFixture, faqs: indigoGoldFixture.faqs.slice(0, 2) };
    expect(() => IndigoGoldSchema.parse(bad)).toThrow();
  });

  it('requires hero.collageSpeakerIds to be UUIDs', () => {
    const bad = {
      ...indigoGoldFixture,
      hero: { ...indigoGoldFixture.hero, collageSpeakerIds: ['not-a-uuid'] },
    };
    expect(() => IndigoGoldSchema.parse(bad)).toThrow();
  });

  it('rejects figures with fewer than 6 items', () => {
    const bad = {
      ...indigoGoldFixture,
      figures: {
        ...indigoGoldFixture.figures,
        items: indigoGoldFixture.figures.items.slice(0, 5),
      },
    };
    expect(() => IndigoGoldSchema.parse(bad)).toThrow();
  });

  it('rejects shifts with fewer than 5 items', () => {
    const bad = {
      ...indigoGoldFixture,
      shifts: {
        ...indigoGoldFixture.shifts,
        items: indigoGoldFixture.shifts.items.slice(0, 4),
      },
    };
    expect(() => IndigoGoldSchema.parse(bad)).toThrow();
  });

  it('rejects outcome icon values outside the enum', () => {
    const bad = {
      ...indigoGoldFixture,
      outcomes: {
        ...indigoGoldFixture.outcomes,
        items: [
          { ...indigoGoldFixture.outcomes.items[0], icon: 'unicorn' },
          ...indigoGoldFixture.outcomes.items.slice(1),
        ],
      },
    };
    expect(() => IndigoGoldSchema.parse(bad)).toThrow();
  });

  it('rejects trust badge icon values outside the enum', () => {
    const bad = {
      ...indigoGoldFixture,
      trustBadges: {
        items: [
          { label: 'Whatever', icon: 'fire' },
          ...indigoGoldFixture.trustBadges.items.slice(1),
        ],
      },
    };
    expect(() => IndigoGoldSchema.parse(bad)).toThrow();
  });

  it('requires stats to have exactly 3 items', () => {
    const bad = {
      ...indigoGoldFixture,
      stats: { items: indigoGoldFixture.stats.items.slice(0, 2) },
    };
    expect(() => IndigoGoldSchema.parse(bad)).toThrow();
  });

  it('requires founders to have exactly 2 items', () => {
    const bad = {
      ...indigoGoldFixture,
      founders: {
        ...indigoGoldFixture.founders,
        items: [indigoGoldFixture.founders.items[0]],
      },
    };
    expect(() => IndigoGoldSchema.parse(bad)).toThrow();
  });

  it('accepts startDate/endDate as ISO date strings', () => {
    const obj = {
      ...indigoGoldFixture,
      summit: {
        ...indigoGoldFixture.summit,
        startDate: '2027-03-01',
        endDate: '2027-03-05',
      },
    };
    expect(() => IndigoGoldSchema.parse(obj)).not.toThrow();
  });

  it('rejects startDate that is not a valid ISO date', () => {
    const bad = {
      ...indigoGoldFixture,
      summit: { ...indigoGoldFixture.summit, startDate: 'not-a-date' },
    };
    expect(() => IndigoGoldSchema.parse(bad)).toThrow();
  });

  it('accepts optional hero.backgroundImageId and footer.logoMediaId as UUIDs', () => {
    const input = {
      ...indigoGoldFixture,
      hero: {
        ...indigoGoldFixture.hero,
        backgroundImageId: '550e8400-e29b-41d4-a716-446655440000',
      },
      footer: {
        ...indigoGoldFixture.footer,
        logoMediaId: '550e8400-e29b-41d4-a716-446655440001',
      },
    };
    expect(IndigoGoldSchema.safeParse(input).success).toBe(true);
  });

  it('accepts drafts without any image-slot fields (all optional)', () => {
    expect(IndigoGoldSchema.safeParse(indigoGoldFixture).success).toBe(true);
  });

  it('rejects non-UUID values for image-slot fields', () => {
    const bad = {
      ...indigoGoldFixture,
      hero: { ...indigoGoldFixture.hero, backgroundImageId: 'not-uuid' },
    };
    expect(IndigoGoldSchema.safeParse(bad).success).toBe(false);
  });
});
