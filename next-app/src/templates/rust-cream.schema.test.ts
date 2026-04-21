import { describe, expect, it } from 'vitest';
import { RustCreamSchema } from './rust-cream.schema';
import { rustCreamFixture } from './__fixtures__/rust-cream.fixture';

describe('RustCreamSchema', () => {
  it('accepts the known-good fixture', () => {
    expect(() => RustCreamSchema.parse(rustCreamFixture)).not.toThrow();
  });

  it('rejects missing summit.name', () => {
    const bad = { ...rustCreamFixture, summit: { ...rustCreamFixture.summit, name: '' } };
    expect(() => RustCreamSchema.parse(bad)).toThrow();
  });

  it('rejects bonuses.items with zero entries', () => {
    const bad = {
      ...rustCreamFixture,
      bonuses: { ...rustCreamFixture.bonuses, items: [] },
    };
    expect(() => RustCreamSchema.parse(bad)).toThrow();
  });

  it('rejects faqs with fewer than 3 entries', () => {
    const bad = { ...rustCreamFixture, faqs: rustCreamFixture.faqs.slice(0, 2) };
    expect(() => RustCreamSchema.parse(bad)).toThrow();
  });

  it('requires hero.heroSpeakerIds to be UUIDs', () => {
    const bad = {
      ...rustCreamFixture,
      hero: { ...rustCreamFixture.hero, heroSpeakerIds: ['not-a-uuid'] },
    };
    expect(() => RustCreamSchema.parse(bad)).toThrow();
  });

  it('rejects outcomes with fewer than 6 items', () => {
    const bad = {
      ...rustCreamFixture,
      outcomes: {
        ...rustCreamFixture.outcomes,
        items: rustCreamFixture.outcomes.items.slice(0, 5),
      },
    };
    expect(() => RustCreamSchema.parse(bad)).toThrow();
  });

  it('rejects outcome.accent values outside the enum', () => {
    const bad = {
      ...rustCreamFixture,
      outcomes: {
        ...rustCreamFixture.outcomes,
        items: [
          { ...rustCreamFixture.outcomes.items[0], accent: 'tertiary' },
          ...rustCreamFixture.outcomes.items.slice(1),
        ],
      },
    };
    expect(() => RustCreamSchema.parse(bad)).toThrow();
  });

  it('rejects trust icon values outside the enum', () => {
    const bad = {
      ...rustCreamFixture,
      trust: {
        items: [
          { label: 'Free', icon: 'rocket' },
          ...rustCreamFixture.trust.items.slice(1),
        ],
      },
    };
    expect(() => RustCreamSchema.parse(bad)).toThrow();
  });

  it('rejects stats with wrong item count', () => {
    const bad = {
      ...rustCreamFixture,
      stats: { items: rustCreamFixture.stats.items.slice(0, 2) },
    };
    expect(() => RustCreamSchema.parse(bad)).toThrow();
  });

  it('rejects figures with fewer than 6 items', () => {
    const bad = {
      ...rustCreamFixture,
      figures: {
        ...rustCreamFixture.figures,
        items: rustCreamFixture.figures.items.slice(0, 5),
      },
    };
    expect(() => RustCreamSchema.parse(bad)).toThrow();
  });

  it('rejects shifts with fewer than 5 items', () => {
    const bad = {
      ...rustCreamFixture,
      shifts: {
        ...rustCreamFixture.shifts,
        items: rustCreamFixture.shifts.items.slice(0, 4),
      },
    };
    expect(() => RustCreamSchema.parse(bad)).toThrow();
  });
});
