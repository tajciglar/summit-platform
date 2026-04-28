import type { ComponentType } from 'react';
import type { z } from 'zod';
import type { Palette } from '@/lib/palette';

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
  /**
   * Optional per-summit short talk title (separate from masterclassTitle).
   * Lives on the speaker_summit pivot.
   */
  talkTitle: string | null;
  rating: number | null;
  sortOrder: number;
  /**
   * Operator-assigned day of the summit (1, 2, 3, ...). Null if the speaker
   * hasn't been slotted yet. Templates that render per-day speaker grids
   * filter by this field to show each speaker under the correct day.
   */
  dayNumber: number | null;
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
  /**
   * Component accepting { content, speakers, funnelId, enabledSections?, palette? }.
   * `enabledSections` and `palette` are shared across every template. Each
   * template decides what to do with them — templates that are already
   * catalog-aware (ochre-ink) or section-toggle-aware (indigo-gold) honor them;
   * the remaining monolithic templates accept the props but render everything
   * until they are refactored. See Phase 2b.
   */
  Component: ComponentType<{
    content: TContent;
    speakers: Record<string, Speaker>;
    funnelId: string;
    enabledSections?: string[];
    palette?: Palette | null;
    /**
     * Optional per-step design-token overrides (Phase 1 visual editor). Only
     * templates that opt-in (currently: cream-sage) consume this; others accept
     * the prop and ignore it.
     */
    tokens?: import('./shared/design-tokens').DesignTokens;
    /**
     * Optional per-section design-token overrides, keyed by section key
     * (`hero`, `press`, …). Sections that consume this apply CSS vars at
     * their own root so only that section is restyled.
     */
    sections?: Record<string, import('./shared/design-tokens').DesignTokens>;
    /**
     * Per-funnel WordPress cart URL used as the interim checkout handoff for
     * sales/upsell steps. When null, templates should fall back to the
     * in-progress native Stripe checkout (TBD).
     */
    wpCheckoutRedirectUrl?: string | null;
    wpThankyouRedirectUrl?: string | null;
  }>;
  /** descriptive tags for filtering */
  tags: readonly TemplateTag[];
  /**
   * Catalog keys this template knows how to render. When present, the manifest
   * emits `sectionSchemas` (keyed JSON-schemas) so Filament + the AI pipeline
   * can drive per-section editing. Templates without this field continue to
   * use the legacy whole-template `jsonSchema` block.
   */
  supportedSections?: readonly string[];
  /** Default render order when no per-funnel override exists. */
  sectionOrder?: readonly string[];
  /** Sections enabled by default for new funnels. */
  defaultEnabledSections?: readonly string[];
}

export interface PublishedContent {
  /** Snake case mirrors the wire format returned by Laravel's JSON response. */
  template_key: string;
  content: unknown;   // validated at render time by the template's schema
}
