import type { ComponentType } from 'react';
import type { z } from 'zod';

export type TemplateTag =
  | 'editorial'
  | 'serif'
  | 'warm'
  | 'modern'
  | 'mono'
  | 'dark';

/**
 * Speaker as returned by the V2 Laravel API (Task 16 endpoint).
 *
 * Note: a different speaker shape exists in `src/lib/api-client.ts` for
 * the deprecated pipeline; that file will be removed in Phase 2. Do not
 * consolidate the two — the API endpoints they speak to return different
 * shapes.
 */
export interface Speaker {
  id: string;
  firstName: string;
  lastName: string;
  title: string | null;
  shortBio: string | null;
  longBio: string | null;
  photoUrl: string | null;
  masterclassTitle: string | null;
  masterclassDescription: string | null;
  rating: number | null;
  goesLiveAt: string | null;   // ISO datetime
  sortOrder: number;
  isFeatured: boolean;
}

export interface TemplateDefinition<TContent = unknown> {
  /** stable key stored in DB; must match file name */
  key: string;
  /** human-readable for UI */
  label: string;
  /** path under /public */
  thumbnail: string;
  /** Zod schema that validates TContent */
  schema: z.ZodType<TContent>;
  /** component accepting { content, speakers } */
  Component: ComponentType<{ content: TContent; speakers: Record<string, Speaker> }>;
  /** descriptive tags for filtering */
  tags: readonly TemplateTag[];
}

export interface PublishedContent {
  /** Snake case mirrors the wire format returned by Laravel's JSON response. */
  template_key: string;
  content: unknown;   // validated at render time by the template's schema
}
