import type { RustCreamContent } from '../rust-cream.schema';

export type SectionContentMap = {
  'top-bar': RustCreamContent['topBar'];
  hero: RustCreamContent['hero'];
  press: RustCreamContent['press'];
  trust: RustCreamContent['trust'];
  stats: RustCreamContent['stats'];
  overview: RustCreamContent['overview'];
  speakers: Record<string, never>;
  outcomes: RustCreamContent['outcomes'];
  'free-gift': RustCreamContent['freeGift'];
  bonuses: RustCreamContent['bonuses'];
  founders: RustCreamContent['founders'];
  testimonials: RustCreamContent['testimonials'];
  'pull-quote': RustCreamContent['pullQuote'];
  figures: RustCreamContent['figures'];
  shifts: RustCreamContent['shifts'];
  'closing-cta': RustCreamContent['closing'];
  faq: { section: RustCreamContent['faqSection']; items: RustCreamContent['faqs'] };
  footer: RustCreamContent['footer'];
  'sales-hero': NonNullable<RustCreamContent['salesHero']>;
  intro: NonNullable<RustCreamContent['intro']>;
  'vip-bonuses': NonNullable<RustCreamContent['vipBonuses']>;
  'free-gifts': NonNullable<RustCreamContent['freeGifts']>;
  'upgrade-section': NonNullable<RustCreamContent['upgradeSection']>;
  'price-card': NonNullable<RustCreamContent['priceCard']>;
  'sales-speakers': NonNullable<RustCreamContent['salesSpeakers']>;
  'comparison-table': NonNullable<RustCreamContent['comparisonTable']>;
  guarantee: NonNullable<RustCreamContent['guarantee']>;
  'why-section': NonNullable<RustCreamContent['whySection']>;
};

export function rustCreamContentToSections(c: Partial<RustCreamContent>): Partial<SectionContentMap> {
  return {
    ...(c.topBar && { 'top-bar': c.topBar }),
    ...(c.hero && { hero: c.hero }),
    ...(c.press && { press: c.press }),
    ...(c.trust && { trust: c.trust }),
    ...(c.stats && { stats: c.stats }),
    ...(c.overview && { overview: c.overview }),
    speakers: {},
    ...(c.outcomes && { outcomes: c.outcomes }),
    ...(c.freeGift && { 'free-gift': c.freeGift }),
    ...(c.bonuses && { bonuses: c.bonuses }),
    ...(c.founders && { founders: c.founders }),
    ...(c.testimonials && { testimonials: c.testimonials }),
    ...(c.pullQuote && { 'pull-quote': c.pullQuote }),
    ...(c.figures && { figures: c.figures }),
    ...(c.shifts && { shifts: c.shifts }),
    ...(c.closing && { 'closing-cta': c.closing }),
    ...(c.faqSection && c.faqs && { faq: { section: c.faqSection, items: c.faqs } }),
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
