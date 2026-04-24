import type { VioletSunContent } from '../violet-sun.schema';

export type SectionContentMap = {
  'top-bar': VioletSunContent['topBar'];
  hero: VioletSunContent['hero'];
  press: VioletSunContent['press'];
  stats: VioletSunContent['stats'];
  overview: VioletSunContent['overview'];
  /** Speakers section reads from the `speakers` prop; content placeholder is empty. */
  speakers: Record<string, never>;
  outcomes: VioletSunContent['outcomes'];
  'free-gift': VioletSunContent['freeGift'];
  bonuses: VioletSunContent['bonuses'];
  founders: VioletSunContent['founders'];
  testimonials: VioletSunContent['testimonials'];
  'pull-quote': VioletSunContent['pullQuote'];
  figures: VioletSunContent['figures'];
  shifts: VioletSunContent['shifts'];
  faq: { section: VioletSunContent['faqSection']; items: VioletSunContent['faqs'] };
  'closing-cta': VioletSunContent['closing'];
  footer: VioletSunContent['footer'];
  'sales-hero': NonNullable<VioletSunContent['salesHero']>;
  intro: NonNullable<VioletSunContent['intro']>;
  'vip-bonuses': NonNullable<VioletSunContent['vipBonuses']>;
  'free-gifts': NonNullable<VioletSunContent['freeGifts']>;
  'upgrade-section': NonNullable<VioletSunContent['upgradeSection']>;
  'price-card': NonNullable<VioletSunContent['priceCard']>;
  'sales-speakers': NonNullable<VioletSunContent['salesSpeakers']>;
  'comparison-table': NonNullable<VioletSunContent['comparisonTable']>;
  guarantee: NonNullable<VioletSunContent['guarantee']>;
  'why-section': NonNullable<VioletSunContent['whySection']>;
};

export function violetSunContentToSections(
  c: Partial<VioletSunContent>,
): Partial<SectionContentMap> {
  return {
    ...(c.topBar && { 'top-bar': c.topBar }),
    ...(c.hero && { hero: c.hero }),
    ...(c.press && { press: c.press }),
    ...(c.stats && { stats: c.stats }),
    ...(c.overview && { overview: c.overview }),
    // speakers is always present (renderer falls back to placeholder when empty).
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
