import type { OchreInkContent } from '../ochre-ink.schema';

export type SectionContentMap = {
  masthead: OchreInkContent['masthead'];
  hero: OchreInkContent['hero'];
  marquee: { items: string[] };
  'stats-hero': OchreInkContent['socialProof'];
  'summit-overview': {
    roman: string;
    headline: string;
    bodyParagraphs: readonly [string, string] | string[];
    ctaLabel: string;
    featureBand: OchreInkContent['featureBand'];
  };
  'speakers-by-day': { days: OchreInkContent['speakersByDay'] };
  'value-prop': OchreInkContent['transformations'];
  supplement: OchreInkContent['supplement'];
  'bonus-stack': {
    roman: string;
    headline: string;
    subhead: string;
    ctaLabel: string;
    items: OchreInkContent['bonusStack'];
  };
  'host-founder': OchreInkContent['founders'];
  'testimonials-attendees': OchreInkContent['testimonials'];
  'pull-quote': OchreInkContent['pullQuote'];
  'facts-stats': OchreInkContent['figures'];
  'reasons-to-attend': OchreInkContent['shifts'];
  faq: { items: OchreInkContent['faqs'] };
  'closing-cta': OchreInkContent['closing'];
  footer: OchreInkContent['footer'];
  'sales-hero': NonNullable<OchreInkContent['salesHero']>;
  intro: NonNullable<OchreInkContent['intro']>;
  'vip-bonuses': NonNullable<OchreInkContent['vipBonuses']>;
  'free-gifts': NonNullable<OchreInkContent['freeGifts']>;
  'upgrade-section': NonNullable<OchreInkContent['upgradeSection']>;
  'price-card': NonNullable<OchreInkContent['priceCard']>;
  'sales-speakers': NonNullable<OchreInkContent['salesSpeakers']>;
  'comparison-table': NonNullable<OchreInkContent['comparisonTable']>;
  guarantee: NonNullable<OchreInkContent['guarantee']>;
  'why-section': NonNullable<OchreInkContent['whySection']>;
};

export function opusV1ContentToSections(c: Partial<OchreInkContent>): Partial<SectionContentMap> {
  // Sales pages share this template's schema but only carry sales keys,
  // so optin section content is absent. Build each entry only if the
  // backing content is present; the layout filters on enabled_sections
  // anyway and skips entries whose content is missing.
  return {
    ...(c.masthead && { masthead: c.masthead }),
    ...(c.hero && {
      hero: {
        ...c.hero,
        // Prefer the backend-computed label over the hand-typed dateRangeLabel.
        eventStatusLabel: c.summit?.eventStatusLabel ?? c.hero.eventStatusLabel,
      },
    }),
    ...(c.featuredIn && { marquee: { items: [...c.featuredIn] } }),
    ...(c.socialProof && { 'stats-hero': c.socialProof }),
    ...(c.whatIsThis && c.featureBand && {
      'summit-overview': {
        roman: c.whatIsThis.roman,
        headline: c.whatIsThis.headline,
        bodyParagraphs: c.whatIsThis.bodyParagraphs,
        ctaLabel: c.whatIsThis.ctaLabel,
        featureBand: c.featureBand,
      },
    }),
    ...(c.speakersByDay && { 'speakers-by-day': { days: c.speakersByDay } }),
    ...(c.transformations && { 'value-prop': c.transformations }),
    ...(c.supplement && { supplement: c.supplement }),
    ...(c.bonusStackSection && c.bonusStack && {
      'bonus-stack': {
        roman: c.bonusStackSection.roman,
        headline: c.bonusStackSection.headline,
        subhead: c.bonusStackSection.subhead,
        ctaLabel: c.bonusStackSection.ctaLabel,
        items: c.bonusStack,
      },
    }),
    ...(c.founders && { 'host-founder': c.founders }),
    ...(c.testimonials && { 'testimonials-attendees': c.testimonials }),
    ...(c.pullQuote && { 'pull-quote': c.pullQuote }),
    ...(c.figures && { 'facts-stats': c.figures }),
    ...(c.shifts && { 'reasons-to-attend': c.shifts }),
    ...(c.faqs && { faq: { items: c.faqs } }),
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
