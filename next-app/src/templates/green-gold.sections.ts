/**
 * Section keys for the GreenGold template. Shared with `registry.metadata.ts`
 * so Filament can render a per-section enable/disable control, and with
 * `GreenGold.tsx` so the component honors the operator's selection at render
 * time.
 *
 * GreenGold shape matches RustCream/BlueCoral — `trust` after `press`, and
 * `closing-cta` before `faq`.
 */
export const greenGoldSupportedSections = [
  'top-bar',
  'hero',
  'press',
  'trust',
  'stats',
  'overview',
  'speakers',
  'outcomes',
  'free-gift',
  'bonuses',
  'founders',
  'testimonials',
  'pull-quote',
  'figures',
  'shifts',
  'closing-cta',
  'faq',
  'footer',
] as const;

export type GreenGoldSectionKey = (typeof greenGoldSupportedSections)[number];

export const greenGoldSectionOrder: readonly GreenGoldSectionKey[] =
  greenGoldSupportedSections;

export const greenGoldDefaultEnabledSections: readonly GreenGoldSectionKey[] =
  greenGoldSupportedSections;
