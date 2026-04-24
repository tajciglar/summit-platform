import type { GreenGoldContent } from '../green-gold.schema';

/**
 * GreenGold uses a template-private bridge: every section skin receives the
 * full `GreenGoldContent` object and reads the slot it needs. This keeps the
 * mechanical port simple — section bodies render verbatim from the original
 * monolithic file with no shape changes.
 *
 * Each entry is present only if the backing field is populated, so the layout
 * can skip rendering when content is missing (e.g. optin pages omit
 * sales-section content).
 */
export type SectionContentMap = {
  'top-bar': GreenGoldContent;
  hero: GreenGoldContent;
  press: GreenGoldContent;
  trust: GreenGoldContent;
  stats: GreenGoldContent;
  overview: GreenGoldContent;
  speakers: GreenGoldContent;
  outcomes: GreenGoldContent;
  'free-gift': GreenGoldContent;
  bonuses: GreenGoldContent;
  founders: GreenGoldContent;
  testimonials: GreenGoldContent;
  'pull-quote': GreenGoldContent;
  figures: GreenGoldContent;
  shifts: GreenGoldContent;
  'closing-cta': GreenGoldContent;
  faq: GreenGoldContent;
  footer: GreenGoldContent;
  'sales-hero': GreenGoldContent;
  intro: GreenGoldContent;
  'vip-bonuses': GreenGoldContent;
  'free-gifts': GreenGoldContent;
  'upgrade-section': GreenGoldContent;
  'price-card': GreenGoldContent;
  'sales-speakers': GreenGoldContent;
  'comparison-table': GreenGoldContent;
  guarantee: GreenGoldContent;
  'why-section': GreenGoldContent;
};

export function greenGoldContentToSections(
  c: Partial<GreenGoldContent>,
): Partial<SectionContentMap> {
  // Cast-once: skins read individual slots and short-circuit if their slot is
  // missing. We pass the same content object to every enabled key.
  const full = c as GreenGoldContent;
  return {
    ...(c.topBar && { 'top-bar': full }),
    ...(c.hero && { hero: full }),
    ...(c.press && { press: full }),
    ...(c.trust && { trust: full }),
    ...(c.stats && { stats: full }),
    ...(c.overview && { overview: full }),
    // `speakers` is derived from the speakers prop at render time, so we
    // always expose it when any optin content is present (use topBar as a
    // proxy for "this is an optin page").
    ...(c.topBar && { speakers: full }),
    ...(c.outcomes && { outcomes: full }),
    ...(c.freeGift && { 'free-gift': full }),
    ...(c.bonuses && { bonuses: full }),
    ...(c.founders && { founders: full }),
    ...(c.testimonials && { testimonials: full }),
    ...(c.pullQuote && { 'pull-quote': full }),
    ...(c.figures && { figures: full }),
    ...(c.shifts && { shifts: full }),
    ...(c.closing && { 'closing-cta': full }),
    ...(c.faqs && c.faqSection && { faq: full }),
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
