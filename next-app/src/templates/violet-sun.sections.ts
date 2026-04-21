/**
 * Section keys for the VioletSun template. Shared with `registry.metadata.ts`
 * so Filament can render a per-section enable/disable control, and with
 * `VioletSun.tsx` so the component honors the operator's selection at render
 * time. Lightweight pattern — no per-section skin extraction yet.
 */
export const violetSunSupportedSections = [
  'top-bar',
  'hero',
  'press',
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
  'faq',
  'closing-cta',
  'footer',
] as const;

export type VioletSunSectionKey = (typeof violetSunSupportedSections)[number];

export const violetSunSectionOrder: readonly VioletSunSectionKey[] =
  violetSunSupportedSections;

export const violetSunDefaultEnabledSections: readonly VioletSunSectionKey[] =
  violetSunSupportedSections;
