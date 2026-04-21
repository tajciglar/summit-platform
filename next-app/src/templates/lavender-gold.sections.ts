/**
 * Section keys for the LavenderGold template — a VIP-upsell/sales page rather
 * than a landing page, so the section set differs from the other templates.
 *
 * Shared with `registry.metadata.ts` so Filament can render a per-section
 * enable/disable control, and with `LavenderGold.tsx` so the component honors
 * the operator's selection at render time.
 *
 * Note: `price-card` appears three times in the template (after the intro,
 * after the comparison table, and after the why-section). A single
 * `price-card` key toggles all three instances together — the multi-card
 * cadence is a single design decision, not three independent ones.
 */
export const lavenderGoldSupportedSections = [
  'top-bar',
  'hero',
  'intro',
  'vip-bonuses',
  'free-gifts',
  'price-card',
  'speakers',
  'comparison-table',
  'guarantee',
  'why-section',
  'footer',
  'mobile-sticky-cta',
] as const;

export type LavenderGoldSectionKey = (typeof lavenderGoldSupportedSections)[number];

export const lavenderGoldSectionOrder: readonly LavenderGoldSectionKey[] =
  lavenderGoldSupportedSections;

export const lavenderGoldDefaultEnabledSections: readonly LavenderGoldSectionKey[] =
  lavenderGoldSupportedSections;
