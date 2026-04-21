/**
 * Section keys for the RustCream template. Shared with `registry.metadata.ts`
 * so Filament can render a per-section enable/disable control, and with
 * `RustCream.tsx` so the component honors the operator's selection at render
 * time.
 *
 * RustCream differs from the LimeInk/CreamSage shape in two ways: it has a
 * dedicated `trust` block after `press`, and `closing-cta` appears *before*
 * `faq` rather than after.
 */
export const rustCreamSupportedSections = [
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

export type RustCreamSectionKey = (typeof rustCreamSupportedSections)[number];

export const rustCreamSectionOrder: readonly RustCreamSectionKey[] =
  rustCreamSupportedSections;

export const rustCreamDefaultEnabledSections: readonly RustCreamSectionKey[] =
  rustCreamSupportedSections;
