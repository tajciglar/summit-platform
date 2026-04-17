import { describe, expect, it } from 'vitest';
import { AdhdSummitSchema } from './adhd-summit.schema';
import { adhdSummitFixture } from './__fixtures__/adhd-summit.fixture';

describe('AdhdSummitSchema', () => {
  it('accepts the known-good fixture', () => {
    expect(() => AdhdSummitSchema.parse(adhdSummitFixture)).not.toThrow();
  });

  it('rejects missing summit.name', () => {
    const bad = { ...adhdSummitFixture, summit: { ...adhdSummitFixture.summit, name: '' } };
    expect(() => AdhdSummitSchema.parse(bad)).toThrow();
  });

  it('rejects bonuses.items with zero entries', () => {
    const bad = { ...adhdSummitFixture, bonuses: { ...adhdSummitFixture.bonuses, items: [] } };
    expect(() => AdhdSummitSchema.parse(bad)).toThrow();
  });

  it('rejects faqs with fewer than 3 entries', () => {
    const bad = { ...adhdSummitFixture, faqs: adhdSummitFixture.faqs.slice(0, 2) };
    expect(() => AdhdSummitSchema.parse(bad)).toThrow();
  });

  it('requires hero.collageSpeakerIds to be UUIDs', () => {
    const bad = {
      ...adhdSummitFixture,
      hero: { ...adhdSummitFixture.hero, collageSpeakerIds: ['not-a-uuid'] },
    };
    expect(() => AdhdSummitSchema.parse(bad)).toThrow();
  });

  it('rejects figures with fewer than 6 items', () => {
    const bad = {
      ...adhdSummitFixture,
      figures: {
        ...adhdSummitFixture.figures,
        items: adhdSummitFixture.figures.items.slice(0, 5),
      },
    };
    expect(() => AdhdSummitSchema.parse(bad)).toThrow();
  });

  it('rejects shifts with fewer than 5 items', () => {
    const bad = {
      ...adhdSummitFixture,
      shifts: {
        ...adhdSummitFixture.shifts,
        items: adhdSummitFixture.shifts.items.slice(0, 4),
      },
    };
    expect(() => AdhdSummitSchema.parse(bad)).toThrow();
  });

  it('rejects outcome icon values outside the enum', () => {
    const bad = {
      ...adhdSummitFixture,
      outcomes: {
        ...adhdSummitFixture.outcomes,
        items: [
          { ...adhdSummitFixture.outcomes.items[0], icon: 'unicorn' },
          ...adhdSummitFixture.outcomes.items.slice(1),
        ],
      },
    };
    expect(() => AdhdSummitSchema.parse(bad)).toThrow();
  });

  it('rejects trust badge icon values outside the enum', () => {
    const bad = {
      ...adhdSummitFixture,
      trustBadges: {
        items: [
          { label: 'Whatever', icon: 'fire' },
          ...adhdSummitFixture.trustBadges.items.slice(1),
        ],
      },
    };
    expect(() => AdhdSummitSchema.parse(bad)).toThrow();
  });

  it('requires stats to have exactly 3 items', () => {
    const bad = {
      ...adhdSummitFixture,
      stats: { items: adhdSummitFixture.stats.items.slice(0, 2) },
    };
    expect(() => AdhdSummitSchema.parse(bad)).toThrow();
  });

  it('requires founders to have exactly 2 items', () => {
    const bad = {
      ...adhdSummitFixture,
      founders: {
        ...adhdSummitFixture.founders,
        items: [adhdSummitFixture.founders.items[0]],
      },
    };
    expect(() => AdhdSummitSchema.parse(bad)).toThrow();
  });

  it('accepts startDate/endDate as ISO date strings', () => {
    const obj = {
      ...adhdSummitFixture,
      summit: {
        ...adhdSummitFixture.summit,
        startDate: '2027-03-01',
        endDate: '2027-03-05',
      },
    };
    expect(() => AdhdSummitSchema.parse(obj)).not.toThrow();
  });

  it('rejects startDate that is not a valid ISO date', () => {
    const bad = {
      ...adhdSummitFixture,
      summit: { ...adhdSummitFixture.summit, startDate: 'not-a-date' },
    };
    expect(() => AdhdSummitSchema.parse(bad)).toThrow();
  });
});
