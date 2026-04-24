import type { BlueCoralContent } from '../blue-coral.schema';
import type { MediaSidecar } from './skins/shared';

type BonusItem = BlueCoralContent['bonuses']['items'][number];
type FounderItem = BlueCoralContent['founders']['items'][number];

/**
 * Render-time content type: Zod-inferred shape plus post-parse sidecars.
 * Only declare sidecars for slots the skin actually renders.
 */
export type BlueCoralRenderContent = Omit<BlueCoralContent, 'hero' | 'overview' | 'bonuses' | 'founders' | 'footer'> & {
  hero: BlueCoralContent['hero'] & { lifestyleImage?: MediaSidecar };
  overview: BlueCoralContent['overview'] & { featureImage?: MediaSidecar };
  bonuses: Omit<BlueCoralContent['bonuses'], 'items'> & {
    items: Array<BonusItem & { thumbnail?: MediaSidecar }>;
  };
  founders: Omit<BlueCoralContent['founders'], 'items'> & {
    items: Array<FounderItem & { photo?: MediaSidecar }>;
  };
  footer: BlueCoralContent['footer'] & { logo?: MediaSidecar };
};

export type SectionContentMap = {
  'top-bar': BlueCoralRenderContent['topBar'];
  hero: BlueCoralRenderContent['hero'];
  press: BlueCoralRenderContent['press'];
  trust: BlueCoralRenderContent['trustBadges'];
  stats: BlueCoralRenderContent['stats'];
  overview: BlueCoralRenderContent['overview'];
  speakers: { _present: true };
  outcomes: BlueCoralRenderContent['outcomes'];
  'free-gift': BlueCoralRenderContent['freeGift'];
  bonuses: BlueCoralRenderContent['bonuses'];
  founders: BlueCoralRenderContent['founders'];
  testimonials: BlueCoralRenderContent['testimonials'];
  'pull-quote': BlueCoralRenderContent['pullQuote'];
  figures: BlueCoralRenderContent['figures'];
  shifts: BlueCoralRenderContent['shifts'];
  'closing-cta': BlueCoralRenderContent['closing'];
  faq: { faqSection: BlueCoralRenderContent['faqSection']; items: BlueCoralRenderContent['faqs'] };
  footer: BlueCoralRenderContent['footer'];
  'sales-hero': NonNullable<BlueCoralRenderContent['salesHero']> & { topBarTitle: string };
  intro: NonNullable<BlueCoralRenderContent['intro']>;
  'vip-bonuses': NonNullable<BlueCoralRenderContent['vipBonuses']>;
  'free-gifts': NonNullable<BlueCoralRenderContent['freeGifts']>;
  'upgrade-section': NonNullable<BlueCoralRenderContent['upgradeSection']>;
  'price-card': NonNullable<BlueCoralRenderContent['priceCard']>;
  'sales-speakers': NonNullable<BlueCoralRenderContent['salesSpeakers']>;
  'comparison-table': NonNullable<BlueCoralRenderContent['comparisonTable']>;
  guarantee: NonNullable<BlueCoralRenderContent['guarantee']>;
  'why-section': NonNullable<BlueCoralRenderContent['whySection']>;
};

export function blueCoralContentToSections(c: Partial<BlueCoralRenderContent>): Partial<SectionContentMap> {
  // Sales pages share this template's schema but only carry sales keys,
  // so optin section content is absent. Build each entry only if the
  // backing content is present; the layout filters on enabled_sections
  // anyway and skips entries whose content is missing.
  return {
    ...(c.topBar && { 'top-bar': c.topBar }),
    ...(c.hero && { hero: c.hero }),
    ...(c.press && { press: c.press }),
    ...(c.trustBadges && { trust: c.trustBadges }),
    ...(c.stats && { stats: c.stats }),
    ...(c.overview && { overview: c.overview }),
    // Speakers section is rendered from the speakers prop, not page content.
    // Always present so the layout will mount it when enabled.
    speakers: { _present: true },
    ...(c.outcomes && { outcomes: c.outcomes }),
    ...(c.freeGift && { 'free-gift': c.freeGift }),
    ...(c.bonuses && { bonuses: c.bonuses }),
    ...(c.founders && { founders: c.founders }),
    ...(c.testimonials && { testimonials: c.testimonials }),
    ...(c.pullQuote && { 'pull-quote': c.pullQuote }),
    ...(c.figures && { figures: c.figures }),
    ...(c.shifts && { shifts: c.shifts }),
    ...(c.closing && { 'closing-cta': c.closing }),
    ...(c.faqSection && c.faqs && { faq: { faqSection: c.faqSection, items: c.faqs } }),
    ...(c.footer && { footer: c.footer }),
    ...(c.salesHero && c.topBar && { 'sales-hero': { ...c.salesHero, topBarTitle: c.topBar.title } }),
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
