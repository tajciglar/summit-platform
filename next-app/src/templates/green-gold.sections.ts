/**
 * Section keys for the GreenGold template family. Shared with
 * `registry.metadata.ts` so Filament can render a per-section enable/disable
 * control, and with `GreenGold.tsx` so the component honors the operator's
 * selection at render time.
 *
 * GreenGold shape matches RustCream/BlueCoral — `trust` after `press`, and
 * `closing-cta` before `faq`.
 *
 * The family covers two page personalities under one visual brand:
 *   - Optin sections: top-bar, hero, press, trust, stats, overview,
 *     speakers, outcomes, free-gift, bonuses, founders, testimonials,
 *     pull-quote, figures, shifts, closing-cta, faq, footer.
 *   - Sales sections: sales-hero, intro, vip-bonuses, free-gifts,
 *     upgrade-section, price-card, sales-speakers, comparison-table,
 *     guarantee, why-section.
 *
 * Steps enable one subset via `enabled_sections`; both share palette,
 * typography, and spacing. Default enabled list is the optin subset since
 * optin is the most common step type.
 */
const greenGoldOptinSections = [
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

const greenGoldSalesSections = [
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

export const greenGoldSupportedSections = [
  ...greenGoldOptinSections,
  ...greenGoldSalesSections,
] as const;

export type GreenGoldSectionKey = (typeof greenGoldSupportedSections)[number];

export const greenGoldSectionOrder: readonly GreenGoldSectionKey[] =
  greenGoldSupportedSections;

/**
 * Default enabled list is the optin subset — sales sections are opt-in per
 * step so the default preview renders as the familiar optin landing page.
 */
export const greenGoldDefaultEnabledSections: readonly GreenGoldSectionKey[] =
  greenGoldOptinSections;

export const greenGoldDefaultSalesSections: readonly GreenGoldSectionKey[] =
  greenGoldSalesSections;
