import { describe, expect, it } from 'vitest';
import { LimeInkSchema } from './lime-ink.schema';
import { limeInkFixture } from './__fixtures__/lime-ink.fixture';

describe('LimeInkSchema', () => {
  it('accepts the known-good fixture', () => {
    expect(() => LimeInkSchema.parse(limeInkFixture)).not.toThrow();
  });

  it('rejects missing summit.name', () => {
    const bad = { ...limeInkFixture, summit: { ...limeInkFixture.summit, name: '' } };
    expect(() => LimeInkSchema.parse(bad)).toThrow();
  });

  it('rejects bonuses.items with zero entries', () => {
    const bad = { ...limeInkFixture, bonuses: { ...limeInkFixture.bonuses, items: [] } };
    expect(() => LimeInkSchema.parse(bad)).toThrow();
  });

  it('rejects faqs with fewer than 3 entries', () => {
    const bad = { ...limeInkFixture, faqs: limeInkFixture.faqs.slice(0, 2) };
    expect(() => LimeInkSchema.parse(bad)).toThrow();
  });

  it('requires hero.heroSpeakerIds to be UUIDs', () => {
    const bad = {
      ...limeInkFixture,
      hero: { ...limeInkFixture.hero, heroSpeakerIds: ['not-a-uuid'] },
    };
    expect(() => LimeInkSchema.parse(bad)).toThrow();
  });

  it('accepts closing without fineprint (optional field absent)', () => {
    const { fineprint: _ignored, ...closingWithout } = limeInkFixture.closing;
    const obj = { ...limeInkFixture, closing: closingWithout };
    expect(() => LimeInkSchema.parse(obj)).not.toThrow();
  });

  it('rejects figures with fewer than 6 items', () => {
    const bad = {
      ...limeInkFixture,
      figures: { ...limeInkFixture.figures, items: limeInkFixture.figures.items.slice(0, 5) },
    };
    expect(() => LimeInkSchema.parse(bad)).toThrow();
  });

  it('rejects figure trend values outside the enum', () => {
    const bad = {
      ...limeInkFixture,
      figures: {
        ...limeInkFixture.figures,
        items: [
          { ...limeInkFixture.figures.items[0], trend: 'exploding' },
          ...limeInkFixture.figures.items.slice(1),
        ],
      },
    };
    expect(() => LimeInkSchema.parse(bad)).toThrow();
  });
});
