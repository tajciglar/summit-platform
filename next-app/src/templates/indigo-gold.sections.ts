/**
 * Section keys for the IndigoGold family. Shared with `registry.metadata.ts`
 * so Filament can render a per-section enable/disable control, and with
 * `IndigoGold.tsx` so the component honors the operator's selection at
 * render time.
 *
 * The family covers two page personalities under one visual brand:
 *   - Optin sections: top-bar, hero, press, trust-badges, stats, overview,
 *     speakers, outcomes, free-gift, founders, testimonials, bonuses,
 *     pull-quote, figures, shifts, closing-cta, faq, footer, sticky-mobile-cta.
 *   - Sales sections: sales-hero, intro, vip-bonuses, free-gifts,
 *     upgrade-section, price-card, sales-speakers, comparison-table,
 *     guarantee, why-section.
 *
 * Steps enable one subset via `enabled_sections`; both share palette,
 * typography, and spacing. Default enabled list is the optin subset since
 * optin is the most common step type.
 */
const indigoGoldOptinSections = [
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

const indigoGoldSalesSections = [
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

export const indigoGoldSupportedSections = [
  ...indigoGoldOptinSections,
  ...indigoGoldSalesSections,
] as const;

export type IndigoGoldSectionKey = (typeof indigoGoldSupportedSections)[number];

export const indigoGoldSectionOrder: readonly IndigoGoldSectionKey[] =
  indigoGoldSupportedSections;

/**
 * Default enabled list is the optin subset — sales sections are opt-in per
 * step so the default preview renders as the familiar optin landing page.
 */
export const indigoGoldDefaultEnabledSections: readonly IndigoGoldSectionKey[] =
  indigoGoldOptinSections;

export const indigoGoldDefaultSalesSections: readonly IndigoGoldSectionKey[] =
  indigoGoldSalesSections;
