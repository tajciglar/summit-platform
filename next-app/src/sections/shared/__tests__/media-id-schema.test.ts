import { describe, it, expect } from 'vitest';
import { MediaIdSchema } from '../media-id-schema';

describe('MediaIdSchema', () => {
  it('accepts a UUID and rejects non-UUIDs', () => {
    const s = MediaIdSchema({ role: 'hero-background', category: 'landing_page' });
    expect(s.safeParse('550e8400-e29b-41d4-a716-446655440000').success).toBe(true);
    expect(s.safeParse('not-a-uuid').success).toBe(false);
  });

  it('is optional + nullable by default (empty slot)', () => {
    const s = MediaIdSchema({ role: 'hero-background', category: 'landing_page' });
    expect(s.safeParse(undefined).success).toBe(true);
    expect(s.safeParse(null).success).toBe(true);
  });

  it('embeds x-media metadata in the schema description', () => {
    const s = MediaIdSchema({
      role: 'hero-background',
      category: 'landing_page',
      subCategory: 'background',
    });
    expect(s.description).toContain('"x-media"');
    const parsed = JSON.parse(s.description!);
    expect(parsed['x-media']).toEqual({
      role: 'hero-background',
      category: 'landing_page',
      subCategory: 'background',
    });
  });
});
