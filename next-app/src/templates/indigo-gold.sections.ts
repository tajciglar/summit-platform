/**
 * Section keys for the IndigoGold (aps-parenting) template. Shared with
 * `registry.metadata.ts` so Filament can render a per-section enable/disable
 * control, and with `IndigoGold.tsx` so the component honors the operator's
 * selection at render time.
 *
 * IndigoGold is monolithic (no per-section skin components yet); this registry
 * is the lightweight way to honor `enabled_sections` without extracting every
 * block. Phase 2b will replace this with the catalog architecture.
 */
export const indigoGoldSupportedSections = [
  'top-bar',
  'hero',
  'press',
  'trust-badges',
  'stats',
  'overview',
  'speakers',
  'outcomes',
  'free-gift',
  'founders',
  'testimonials',
  'bonuses',
  'pull-quote',
  'figures',
  'shifts',
  'closing-cta',
  'faq',
  'footer',
  'sticky-mobile-cta',
] as const;

export type IndigoGoldSectionKey = (typeof indigoGoldSupportedSections)[number];

export const indigoGoldSectionOrder: readonly IndigoGoldSectionKey[] =
  indigoGoldSupportedSections;

export const indigoGoldDefaultEnabledSections: readonly IndigoGoldSectionKey[] =
  indigoGoldSupportedSections;
