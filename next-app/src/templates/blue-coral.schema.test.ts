import { describe, expect, it } from 'vitest';
import { BlueCoralSchema } from './blue-coral.schema';
import { blueCoralFixture } from './__fixtures__/blue-coral.fixture';

describe('BlueCoralSchema', () => {
  it('accepts the known-good fixture', () => {
    expect(() => BlueCoralSchema.parse(blueCoralFixture)).not.toThrow();
  });

  it('rejects missing summit.name', () => {
    const bad = { ...blueCoralFixture, summit: { ...blueCoralFixture.summit, name: '' } };
    expect(() => BlueCoralSchema.parse(bad)).toThrow();
  });

  it('rejects bonuses.items with zero entries', () => {
    const bad = { ...blueCoralFixture, bonuses: { ...blueCoralFixture.bonuses, items: [] } };
    expect(() => BlueCoralSchema.parse(bad)).toThrow();
  });

  it('rejects faqs with fewer than 3 entries', () => {
    const bad = { ...blueCoralFixture, faqs: blueCoralFixture.faqs.slice(0, 2) };
    expect(() => BlueCoralSchema.parse(bad)).toThrow();
  });

  it('requires hero.avatarSpeakerIds to be UUIDs', () => {
    const bad = {
      ...blueCoralFixture,
      hero: { ...blueCoralFixture.hero, avatarSpeakerIds: ['not-a-uuid'] },
    };
    expect(() => BlueCoralSchema.parse(bad)).toThrow();
  });

  it('rejects figures with fewer than 6 items', () => {
    const bad = {
      ...blueCoralFixture,
      figures: { ...blueCoralFixture.figures, items: blueCoralFixture.figures.items.slice(0, 5) },
    };
    expect(() => BlueCoralSchema.parse(bad)).toThrow();
  });

  it('rejects closing.pills with fewer than 6 items', () => {
    const bad = {
      ...blueCoralFixture,
      closing: { ...blueCoralFixture.closing, pills: blueCoralFixture.closing.pills.slice(0, 5) },
    };
    expect(() => BlueCoralSchema.parse(bad)).toThrow();
  });

  it('rejects trustBadges icon values outside the enum', () => {
    const bad = {
      ...blueCoralFixture,
      trustBadges: {
        items: [
          { icon: 'bogus', label: 'Fake' },
          ...blueCoralFixture.trustBadges.items.slice(1),
        ],
      },
    };
    expect(() => BlueCoralSchema.parse(bad)).toThrow();
  });

  it('rejects shifts with fewer than 5 items', () => {
    const bad = {
      ...blueCoralFixture,
      shifts: { ...blueCoralFixture.shifts, items: blueCoralFixture.shifts.items.slice(0, 4) },
    };
    expect(() => BlueCoralSchema.parse(bad)).toThrow();
  });

  it('rejects outcomes with more than 6 items', () => {
    const bad = {
      ...blueCoralFixture,
      outcomes: {
        ...blueCoralFixture.outcomes,
        items: [...blueCoralFixture.outcomes.items, blueCoralFixture.outcomes.items[0]],
      },
    };
    expect(() => BlueCoralSchema.parse(bad)).toThrow();
  });

  it('accepts optional image slots (hero, overview, per-bonus, per-founder, footer)', () => {
    const uuid = '550e8400-e29b-41d4-a716-446655440000';
    const input = {
      ...blueCoralFixture,
      hero: { ...blueCoralFixture.hero, lifestyleImageId: uuid },
      overview: { ...blueCoralFixture.overview, featureImageId: uuid },
      bonuses: {
        ...blueCoralFixture.bonuses,
        items: blueCoralFixture.bonuses.items.map((b) => ({ ...b, thumbnailMediaId: uuid })),
      },
      founders: {
        ...blueCoralFixture.founders,
        items: blueCoralFixture.founders.items.map((f) => ({ ...f, photoMediaId: uuid })),
      },
      footer: { ...blueCoralFixture.footer, logoMediaId: uuid },
    };
    expect(BlueCoralSchema.safeParse(input).success).toBe(true);
  });

  it('accepts drafts without any image-slot fields (all optional)', () => {
    expect(BlueCoralSchema.safeParse(blueCoralFixture).success).toBe(true);
  });

  it('rejects non-UUID values for image-slot fields', () => {
    const bad = { ...blueCoralFixture, hero: { ...blueCoralFixture.hero, lifestyleImageId: 'x' } };
    expect(BlueCoralSchema.safeParse(bad).success).toBe(false);
  });
});
