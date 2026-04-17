import { describe, expect, it } from 'vitest';
import { OpusV1Schema } from './opus-v1.schema';
import { opusV1Fixture } from './__fixtures__/opus-v1.fixture';

describe('OpusV1Schema', () => {
  it('accepts the known-good fixture', () => {
    expect(() => OpusV1Schema.parse(opusV1Fixture)).not.toThrow();
  });

  it('rejects missing summit.name', () => {
    const bad = { ...opusV1Fixture, summit: { ...opusV1Fixture.summit, name: '' } };
    expect(() => OpusV1Schema.parse(bad)).toThrow();
  });

  it('rejects bonusStack with zero entries', () => {
    const bad = { ...opusV1Fixture, bonusStack: [] };
    expect(() => OpusV1Schema.parse(bad)).toThrow();
  });

  it('rejects faqs with fewer than 3 entries', () => {
    const bad = { ...opusV1Fixture, faqs: opusV1Fixture.faqs.slice(0, 2) };
    expect(() => OpusV1Schema.parse(bad)).toThrow();
  });

  it('requires speakersByDay[].speakerIds to be UUIDs', () => {
    const bad = {
      ...opusV1Fixture,
      speakersByDay: [{ ...opusV1Fixture.speakersByDay[0], speakerIds: ['not-a-uuid'] }],
    };
    expect(() => OpusV1Schema.parse(bad)).toThrow();
  });

  it('accepts hero without ctaSubtext (optional field absent)', () => {
    const { ctaSubtext: _ignored, ...heroWithout } = opusV1Fixture.hero;
    const obj = { ...opusV1Fixture, hero: heroWithout };
    expect(() => OpusV1Schema.parse(obj)).not.toThrow();
  });

  it('rejects bonusStack with more than 5 entries', () => {
    const base = opusV1Fixture.bonusStack[0];
    const bad = {
      ...opusV1Fixture,
      bonusStack: Array.from({ length: 6 }, () => base),
    };
    expect(() => OpusV1Schema.parse(bad)).toThrow();
  });

  it('rejects faqs with more than 10 entries', () => {
    const base = opusV1Fixture.faqs[0];
    const bad = {
      ...opusV1Fixture,
      faqs: Array.from({ length: 11 }, () => base),
    };
    expect(() => OpusV1Schema.parse(bad)).toThrow();
  });
});
