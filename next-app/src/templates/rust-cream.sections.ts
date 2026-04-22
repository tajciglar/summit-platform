/**
 * Section keys for the RustCream template. Shared with `registry.metadata.ts`
 * so Filament can render a per-section enable/disable control, and with
 * `RustCream.tsx` so the component honors the operator's selection at render
 * time.
 *
 * RustCream differs from the LimeInk/CreamSage shape in two ways: it has a
 * dedicated `trust` block after `press`, and `closing-cta` appears *before*
 * `faq` rather than after.
 *
 * The template is a family: optin-style sections (hero, press, trust, stats,
 * overview, speakers, outcomes, free-gift, bonuses, founders, testimonials,
 * pull-quote, figures, shifts, closing-cta, faq, footer) and sales-style
 * sections (sales-hero, intro, vip-bonuses, free-gifts, upgrade-section,
 * price-card, sales-speakers, comparison-table, guarantee, why-section) share
 * the same brand and render conditionally per step via `enabled_sections`.
 */
const rustCreamOptinSections = [
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

const rustCreamSalesSections = [
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

export const rustCreamSupportedSections = [
  ...rustCreamOptinSections,
  ...rustCreamSalesSections,
] as const;

export type RustCreamSectionKey = (typeof rustCreamSupportedSections)[number];

export const rustCreamSectionOrder: readonly RustCreamSectionKey[] =
  rustCreamSupportedSections;

/**
 * Default enabled list is the optin subset — sales sections are opt-in per
 * step so the default preview renders as the familiar optin landing page.
 */
export const rustCreamDefaultEnabledSections: readonly RustCreamSectionKey[] =
  rustCreamOptinSections;

export const rustCreamDefaultSalesSections: readonly RustCreamSectionKey[] =
  rustCreamSalesSections;
