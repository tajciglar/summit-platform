import { describe, it, expect } from 'vitest';
import { LavenderGoldSchema } from './lavender-gold.schema';
import { lavenderGoldFixture } from './__fixtures__/lavender-gold.fixture';

describe('LavenderGoldSchema', () => {
  it('accepts the canonical fixture', () => {
    const result = LavenderGoldSchema.safeParse(lavenderGoldFixture);
    expect(result.success).toBe(true);
  });

  it('rejects empty headline', () => {
    const result = LavenderGoldSchema.safeParse({ ...lavenderGoldFixture, hero: { ...lavenderGoldFixture.hero, headline: '' } });
    expect(result.success).toBe(false);
  });

  it('rejects more than 8 vip bonus items', () => {
    const extraItems = Array.from({ length: 9 }, (_, i) => ({
      icon: 'book' as const,
      title: `Item ${i}`,
      description: 'desc',
      valueLabel: '$0',
    }));
    const result = LavenderGoldSchema.safeParse({ ...lavenderGoldFixture, vipBonuses: { ...lavenderGoldFixture.vipBonuses, items: extraItems } });
    expect(result.success).toBe(false);
  });

  it('rejects comparison rows with more than 12 entries', () => {
    const rows = Array.from({ length: 13 }, (_, i) => ({ label: `Row ${i}`, freePass: true, vipPass: true }));
    const result = LavenderGoldSchema.safeParse({ ...lavenderGoldFixture, comparisonTable: { ...lavenderGoldFixture.comparisonTable, rows } });
    expect(result.success).toBe(false);
  });
});
