import { z } from 'zod';

export type MediaIdMetadata = {
  /** Semantic role, e.g. 'hero-background', 'host-photo', 'bonus-thumbnail'. */
  role: string;
  /** MediaCategory key — mirrors app/Enums/MediaCategory.php. */
  category: 'landing_page' | 'product' | 'speakers' | 'brand' | 'downloadable';
  /**
   * Optional sub-category filter — must come from
   * MediaCategory::subCategoryOptions() for the chosen category
   * (e.g. landing_page → 'hero' | 'side' | 'section' | 'press_logo' |
   * 'testimonial' | 'background'; brand → 'logo' | 'favicon' | 'og_image').
   */
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
