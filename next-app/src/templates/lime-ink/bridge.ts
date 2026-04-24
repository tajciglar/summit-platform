import type { LimeInkContent } from '../lime-ink.schema';

export type SectionContentMap = {
  'top-bar': LimeInkContent['topBar'];
  hero: LimeInkContent['hero'];
  press: LimeInkContent['press'];
  stats: LimeInkContent['stats'];
  overview: LimeInkContent['overview'];
  speakers: Record<string, never>;
  outcomes: LimeInkContent['outcomes'];
  'free-gift': LimeInkContent['freeGift'];
  bonuses: LimeInkContent['bonuses'];
  founders: LimeInkContent['founders'];

  testimonials: LimeInkContent['testimonials'];
  'pull-quote': LimeInkContent['pullQuote'];
  figures: LimeInkContent['figures'];
  shifts: LimeInkContent['shifts'];
  faq: { section: LimeInkContent['faqSection']; items: LimeInkContent['faqs'] };
  'closing-cta': LimeInkContent['closing'];
  footer: LimeInkContent['footer'];
  'sales-hero': NonNullable<LimeInkContent['salesHero']>;
  intro: NonNullable<LimeInkContent['intro']>;
  'vip-bonuses': NonNullable<LimeInkContent['vipBonuses']>;
  'free-gifts': NonNullable<LimeInkContent['freeGifts']>;
  'upgrade-section': NonNullable<LimeInkContent['upgradeSection']>;
  'price-card': NonNullable<LimeInkContent['priceCard']>;
  'sales-speakers': NonNullable<LimeInkContent['salesSpeakers']>;
  'comparison-table': NonNullable<LimeInkContent['comparisonTable']>;
  guarantee: NonNullable<LimeInkContent['guarantee']>;
  'why-section': NonNullable<LimeInkContent['whySection']>;
};

/**
 * Slice template content into per-section payloads. Sales pages share this
 * template's schema but only carry sales keys, so optin section content is
 * absent. Build each entry only if the backing content is present; the
 * layout filters on enabled_sections anyway and skips entries whose content
 * is missing.
 */
export function limeInkContentToSections(c: Partial<LimeInkContent>): Partial<SectionContentMap> {
  return {
    ...(c.topBar && { 'top-bar': c.topBar }),
    ...(c.hero && { hero: c.hero }),
    ...(c.press && { press: c.press }),
    ...(c.stats && { stats: c.stats }),
    ...(c.overview && { overview: c.overview }),
    speakers: {} as Record<string, never>,
    ...(c.outcomes && { outcomes: c.outcomes }),
    ...(c.freeGift && { 'free-gift': c.freeGift }),
    ...(c.bonuses && { bonuses: c.bonuses }),
    ...(c.founders && { founders: c.founders }),
    ...(c.testimonials && { testimonials: c.testimonials }),
    ...(c.pullQuote && { 'pull-quote': c.pullQuote }),
    ...(c.figures && { figures: c.figures }),
    ...(c.shifts && { shifts: c.shifts }),
    ...(c.faqSection && c.faqs && { faq: { section: c.faqSection, items: c.faqs } }),
    ...(c.closing && { 'closing-cta': c.closing }),
    ...(c.footer && { footer: c.footer }),
    ...(c.salesHero && { 'sales-hero': c.salesHero }),
    ...(c.intro && { intro: c.intro }),
    ...(c.vipBonuses && { 'vip-bonuses': c.vipBonuses }),
    ...(c.freeGifts && { 'free-gifts': c.freeGifts }),
    ...(c.upgradeSection && { 'upgrade-section': c.upgradeSection }),
    ...(c.priceCard && { 'price-card': c.priceCard }),
    ...(c.salesSpeakers && { 'sales-speakers': c.salesSpeakers }),
    ...(c.comparisonTable && { 'comparison-table': c.comparisonTable }),
    ...(c.guarantee && { guarantee: c.guarantee }),
    ...(c.whySection && { 'why-section': c.whySection }),
  };
}
