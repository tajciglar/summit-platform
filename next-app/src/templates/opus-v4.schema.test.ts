import { describe, expect, it } from 'vitest';
import { OpusV4Schema } from './opus-v4.schema';
import { opusV4Fixture } from './__fixtures__/opus-v4.fixture';

describe('OpusV4Schema', () => {
  it('accepts the known-good fixture', () => {
    expect(() => OpusV4Schema.parse(opusV4Fixture)).not.toThrow();
  });

  it('rejects missing summit.name', () => {
    const bad = { ...opusV4Fixture, summit: { ...opusV4Fixture.summit, name: '' } };
    expect(() => OpusV4Schema.parse(bad)).toThrow();
  });

  it('rejects bonuses.items with zero entries', () => {
    const bad = { ...opusV4Fixture, bonuses: { ...opusV4Fixture.bonuses, items: [] } };
    expect(() => OpusV4Schema.parse(bad)).toThrow();
  });

  it('rejects faqs with fewer than 3 entries', () => {
    const bad = { ...opusV4Fixture, faqs: opusV4Fixture.faqs.slice(0, 2) };
    expect(() => OpusV4Schema.parse(bad)).toThrow();
  });

  it('requires hero.heroSpeakerIds to be UUIDs', () => {
    const bad = {
      ...opusV4Fixture,
      hero: { ...opusV4Fixture.hero, heroSpeakerIds: ['not-a-uuid'] },
    };
    expect(() => OpusV4Schema.parse(bad)).toThrow();
  });

  it('accepts closing without fineprint (optional field absent)', () => {
    const { fineprint: _ignored, ...closingWithout } = opusV4Fixture.closing;
    const obj = { ...opusV4Fixture, closing: closingWithout };
    expect(() => OpusV4Schema.parse(obj)).not.toThrow();
  });

  it('rejects figures with fewer than 6 items', () => {
    const bad = {
      ...opusV4Fixture,
      figures: { ...opusV4Fixture.figures, items: opusV4Fixture.figures.items.slice(0, 5) },
    };
    expect(() => OpusV4Schema.parse(bad)).toThrow();
  });

  it('rejects figure trend values outside the enum', () => {
    const bad = {
      ...opusV4Fixture,
      figures: {
        ...opusV4Fixture.figures,
        items: [
          { ...opusV4Fixture.figures.items[0], trend: 'exploding' },
          ...opusV4Fixture.figures.items.slice(1),
        ],
      },
    };
    expect(() => OpusV4Schema.parse(bad)).toThrow();
  });

  it('rejects non-date summit.startDate', () => {
    const bad = {
      ...opusV4Fixture,
      summit: { ...opusV4Fixture.summit, startDate: 'tomorrow' },
    };
    expect(() => OpusV4Schema.parse(bad)).toThrow();
  });

  it('rejects shifts with exactly 4 items (requires 5)', () => {
    const bad = {
      ...opusV4Fixture,
      shifts: { ...opusV4Fixture.shifts, items: opusV4Fixture.shifts.items.slice(0, 4) },
    };
    expect(() => OpusV4Schema.parse(bad)).toThrow();
  });
});
