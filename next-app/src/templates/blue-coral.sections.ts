/**
 * Section keys for the BlueCoral template. Shared with `registry.metadata.ts`
 * so Filament can render a per-section enable/disable control, and with
 * `BlueCoral.tsx` so the component honors the operator's selection at render
 * time.
 *
 * BlueCoral shape matches RustCream — it has a dedicated `trust` block after
 * `press`, and `closing-cta` appears before `faq`.
 *
 * The family covers two page personalities under one visual brand:
 *   - Optin sections: top-bar, hero, press, trust, stats, overview, speakers,
 *     outcomes, free-gift, bonuses, founders, testimonials, pull-quote,
 *     figures, shifts, closing-cta, faq, footer.
 *   - Sales sections: sales-hero, intro, vip-bonuses, free-gifts,
 *     upgrade-section, price-card, sales-speakers, comparison-table,
 *     guarantee, why-section.
 *
 * Steps enable one subset via `enabled_sections`; both share palette,
 * typography, and spacing. Default enabled list is the optin subset since
 * optin is the most common step type.
 */
const blueCoralOptinSections = [
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

const blueCoralSalesSections = [
  'sales-hero',
  'intro',
  'vip-bonuses',
  'free-gifts',
  'upgrade-section',
  'price-card',
  'sales-speakers',
  'comparison-table',
  'guarantee',
  'why-section',
] as const;

export const blueCoralSupportedSections = [
  ...blueCoralOptinSections,
  ...blueCoralSalesSections,
] as const;

export type BlueCoralSectionKey = (typeof blueCoralSupportedSections)[number];

export const blueCoralSectionOrder: readonly BlueCoralSectionKey[] =
  blueCoralSupportedSections;

/**
 * Default enabled list is the optin subset — sales sections are opt-in per
 * step so the default preview renders as the familiar optin landing page.
 */
export const blueCoralDefaultEnabledSections: readonly BlueCoralSectionKey[] =
  blueCoralOptinSections;

export const blueCoralDefaultSalesSections: readonly BlueCoralSectionKey[] =
  blueCoralSalesSections;
