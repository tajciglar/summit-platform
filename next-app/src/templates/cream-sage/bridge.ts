import type { CreamSageContent } from '../cream-sage.schema';

/**
 * CreamSage skins each receive the full `CreamSageContent` (mirroring the
 * monolithic functions they were extracted from). The bridge therefore maps
 * every section key to the same content, but only emits an entry when the
 * backing field on `content` is present so the layout can skip sections whose
 * data is missing (notably sales-only sections on optin pages and vice-versa).
 */
export type SectionContentMap = {
  'top-bar': CreamSageContent;
  hero: CreamSageContent;
  press: CreamSageContent;
  stats: CreamSageContent;
  overview: CreamSageContent;
  speakers: CreamSageContent;
  outcomes: CreamSageContent;
  'free-gift': CreamSageContent;
  bonuses: CreamSageContent;
  founders: CreamSageContent;
  testimonials: CreamSageContent;
  'pull-quote': CreamSageContent;
  figures: CreamSageContent;
  shifts: CreamSageContent;
  faq: CreamSageContent;
  'closing-cta': CreamSageContent;
  footer: CreamSageContent;
  'sales-hero': CreamSageContent;
  intro: CreamSageContent;
  'vip-bonuses': CreamSageContent;
  'free-gifts': CreamSageContent;
  'upgrade-section': CreamSageContent;
  'price-card': CreamSageContent;
  'sales-speakers': CreamSageContent;
  'comparison-table': CreamSageContent;
  guarantee: CreamSageContent;
  'why-section': CreamSageContent;
};

export function creamSageContentToSections(
  c: Partial<CreamSageContent>,
): Partial<SectionContentMap> {
  // The full content is the same object for every present key; the layout
  // uses the key only to pick the right skin and to honor `enabled_sections`.
  // We still gate on the per-section field so missing data → missing section.
  const full = c as CreamSageContent;
  return {
    ...(c.topBar && { 'top-bar': full }),
    ...(c.hero && { hero: full }),
    ...(c.press && { press: full }),
    ...(c.stats && { stats: full }),
    ...(c.overview && { overview: full }),
    // `speakers` is derived from the speakers prop at render time, not from
    // content. Always include it; the skin guards on speaker presence itself.
    ...(c && { speakers: full }),
    ...(c.outcomes && { outcomes: full }),
    ...(c.freeGift && { 'free-gift': full }),
    ...(c.bonuses && { bonuses: full }),
    ...(c.founders && { founders: full }),
    ...(c.testimonials && { testimonials: full }),
    ...(c.pullQuote && { 'pull-quote': full }),
    ...(c.figures && { figures: full }),
    ...(c.shifts && { shifts: full }),
    ...(c.faqSection && c.faqs && { faq: full }),
    ...(c.closing && { 'closing-cta': full }),
    ...(c.footer && { footer: full }),
    ...(c.salesHero && { 'sales-hero': full }),
    ...(c.intro && { intro: full }),
    ...(c.vipBonuses && { 'vip-bonuses': full }),
    ...(c.freeGifts && { 'free-gifts': full }),
    ...(c.upgradeSection && { 'upgrade-section': full }),
    ...(c.priceCard && { 'price-card': full }),
    ...(c.salesSpeakers && { 'sales-speakers': full }),
    ...(c.comparisonTable && { 'comparison-table': full }),
    ...(c.guarantee && { guarantee: full }),
    ...(c.whySection && { 'why-section': full }),
  };
}
