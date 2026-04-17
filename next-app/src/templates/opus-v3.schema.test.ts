import { describe, expect, it } from 'vitest';
import { OpusV3Schema } from './opus-v3.schema';
import { opusV3Fixture } from './__fixtures__/opus-v3.fixture';

describe('OpusV3Schema', () => {
  it('accepts the known-good fixture', () => {
    expect(() => OpusV3Schema.parse(opusV3Fixture)).not.toThrow();
  });

  it('rejects missing summit.name', () => {
    const bad = { ...opusV3Fixture, summit: { ...opusV3Fixture.summit, name: '' } };
    expect(() => OpusV3Schema.parse(bad)).toThrow();
  });

  it('rejects bonuses.items with zero entries', () => {
    const bad = { ...opusV3Fixture, bonuses: { ...opusV3Fixture.bonuses, items: [] } };
    expect(() => OpusV3Schema.parse(bad)).toThrow();
  });

  it('rejects faqs with fewer than 3 entries', () => {
    const bad = { ...opusV3Fixture, faqs: opusV3Fixture.faqs.slice(0, 2) };
    expect(() => OpusV3Schema.parse(bad)).toThrow();
  });

  it('requires hero.heroSpeakerIds to be UUIDs', () => {
    const bad = {
      ...opusV3Fixture,
      hero: { ...opusV3Fixture.hero, heroSpeakerIds: ['not-a-uuid'] },
    };
    expect(() => OpusV3Schema.parse(bad)).toThrow();
  });

  it('accepts closing without fineprint (optional field absent)', () => {
    const { fineprint: _ignored, ...closingWithout } = opusV3Fixture.closing;
    const obj = { ...opusV3Fixture, closing: closingWithout };
    expect(() => OpusV3Schema.parse(obj)).not.toThrow();
  });

  it('rejects figures with fewer than 6 items', () => {
    const bad = {
      ...opusV3Fixture,
      figures: { ...opusV3Fixture.figures, items: opusV3Fixture.figures.items.slice(0, 5) },
    };
    expect(() => OpusV3Schema.parse(bad)).toThrow();
  });

  it('rejects outcomes with fewer than 6 items', () => {
    const bad = {
      ...opusV3Fixture,
      outcomes: {
        ...opusV3Fixture.outcomes,
        items: opusV3Fixture.outcomes.items.slice(0, 5),
      },
    };
    expect(() => OpusV3Schema.parse(bad)).toThrow();
  });

  it('rejects shifts with fewer than 5 items', () => {
    const bad = {
      ...opusV3Fixture,
      shifts: { ...opusV3Fixture.shifts, items: opusV3Fixture.shifts.items.slice(0, 4) },
    };
    expect(() => OpusV3Schema.parse(bad)).toThrow();
  });

  it('rejects invalid startDate', () => {
    const bad = {
      ...opusV3Fixture,
      summit: { ...opusV3Fixture.summit, startDate: 'not-a-date' },
    };
    expect(() => OpusV3Schema.parse(bad)).toThrow();
  });
});
