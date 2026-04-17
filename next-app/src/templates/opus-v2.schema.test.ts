import { describe, expect, it } from 'vitest';
import { OpusV2Schema } from './opus-v2.schema';
import { opusV2Fixture } from './__fixtures__/opus-v2.fixture';

describe('OpusV2Schema', () => {
  it('accepts the known-good fixture', () => {
    expect(() => OpusV2Schema.parse(opusV2Fixture)).not.toThrow();
  });

  it('rejects missing summit.name', () => {
    const bad = { ...opusV2Fixture, summit: { ...opusV2Fixture.summit, name: '' } };
    expect(() => OpusV2Schema.parse(bad)).toThrow();
  });

  it('rejects bonuses.items with zero entries', () => {
    const bad = { ...opusV2Fixture, bonuses: { ...opusV2Fixture.bonuses, items: [] } };
    expect(() => OpusV2Schema.parse(bad)).toThrow();
  });

  it('rejects faqs with fewer than 3 entries', () => {
    const bad = { ...opusV2Fixture, faqs: opusV2Fixture.faqs.slice(0, 2) };
    expect(() => OpusV2Schema.parse(bad)).toThrow();
  });

  it('requires hero.heroSpeakerIds to be UUIDs', () => {
    const bad = {
      ...opusV2Fixture,
      hero: { ...opusV2Fixture.hero, heroSpeakerIds: ['not-a-uuid'] },
    };
    expect(() => OpusV2Schema.parse(bad)).toThrow();
  });

  it('accepts closing without fineprint (optional field absent)', () => {
    const { fineprint: _ignored, ...closingWithout } = opusV2Fixture.closing;
    const obj = { ...opusV2Fixture, closing: closingWithout };
    expect(() => OpusV2Schema.parse(obj)).not.toThrow();
  });

  it('rejects figures with fewer than 6 items', () => {
    const bad = {
      ...opusV2Fixture,
      figures: { ...opusV2Fixture.figures, items: opusV2Fixture.figures.items.slice(0, 5) },
    };
    expect(() => OpusV2Schema.parse(bad)).toThrow();
  });

  it('rejects figure trend values outside the enum', () => {
    const bad = {
      ...opusV2Fixture,
      figures: {
        ...opusV2Fixture.figures,
        items: [
          { ...opusV2Fixture.figures.items[0], trend: 'exploding' },
          ...opusV2Fixture.figures.items.slice(1),
        ],
      },
    };
    expect(() => OpusV2Schema.parse(bad)).toThrow();
  });
});
