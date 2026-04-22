/**
 * Section keys for the CreamSage ("cozy editorial") template. Shared with
 * `registry.metadata.ts` so Filament can render a per-section enable/disable
 * control, and with `CreamSage.tsx` so the component honors the operator's
 * selection at render time.
 *
 * The family covers two page personalities under one visual brand:
 *   - Optin sections: top-bar, hero, press, stats, overview, speakers,
 *     outcomes, free-gift, bonuses, founders, testimonials, pull-quote,
 *     figures, shifts, faq, closing-cta, footer.
 *   - Sales sections: sales-hero, intro, vip-bonuses, free-gifts,
 *     upgrade-section, price-card, sales-speakers, comparison-table,
 *     guarantee, why-section.
 *
 * Steps enable one subset via `enabled_sections`; both share palette,
 * typography, and spacing. Default enabled list is the optin subset since
 * optin is the most common step type.
 */
const creamSageOptinSections = [
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

const creamSageSalesSections = [
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

export const creamSageSupportedSections = [
  ...creamSageOptinSections,
  ...creamSageSalesSections,
] as const;

export type CreamSageSectionKey = (typeof creamSageSupportedSections)[number];

export const creamSageSectionOrder: readonly CreamSageSectionKey[] =
  creamSageSupportedSections;

/**
 * Default enabled list is the optin subset — sales sections are opt-in per
 * step so the default preview renders as the familiar optin landing page.
 */
export const creamSageDefaultEnabledSections: readonly CreamSageSectionKey[] =
  creamSageOptinSections;

export const creamSageDefaultSalesSections: readonly CreamSageSectionKey[] =
  creamSageSalesSections;
