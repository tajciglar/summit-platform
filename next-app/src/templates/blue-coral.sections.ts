/**
 * Section keys for the BlueCoral template. Shared with `registry.metadata.ts`
 * so Filament can render a per-section enable/disable control, and with
 * `BlueCoral.tsx` so the component honors the operator's selection at render
 * time.
 *
 * BlueCoral shape matches RustCream — it has a dedicated `trust` block after
 * `press`, and `closing-cta` appears before `faq`.
 */
export const blueCoralSupportedSections = [
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

export type BlueCoralSectionKey = (typeof blueCoralSupportedSections)[number];

export const blueCoralSectionOrder: readonly BlueCoralSectionKey[] =
  blueCoralSupportedSections;

export const blueCoralDefaultEnabledSections: readonly BlueCoralSectionKey[] =
  blueCoralSupportedSections;
