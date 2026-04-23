import { z } from 'zod';

export type MediaIdMetadata = {
  /** Semantic role, e.g. 'hero-background', 'host-photo', 'bonus-thumbnail'. */
  role: string;
  /** MediaCategory key — matches app/Enums/MediaCategory.php. */
  category: 'hero' | 'product' | 'downloadables' | 'speaker' | 'logo' | 'brand';
  /** Optional sub-category filter for the picker. */
  subCategory?: string;
};

/**
 * Optional media-id slot in a content schema. Stored as a UUID string referring
 * to a MediaItem. Filament renders a MediaPickerField; the API attaches a
 * resolved `{ url, alt, width, height }` sidecar before sending to Next.js.
 */
export function MediaIdSchema(meta: MediaIdMetadata) {
  return z
    .string()
    .uuid()
    .nullish()
    .describe(JSON.stringify({ 'x-media': meta }));
}
