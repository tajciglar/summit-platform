import type { OpusV1Content } from '../opus-v1.schema';

export type SectionContentMap = {
  masthead: OpusV1Content['masthead'];
  hero: OpusV1Content['hero'];
  marquee: { items: string[] };
  'stats-hero': OpusV1Content['socialProof'];
  'summit-overview': {
    roman: string;
    headline: string;
    bodyParagraphs: readonly [string, string] | string[];
    ctaLabel: string;
    featureBand: OpusV1Content['featureBand'];
  };
  'speakers-by-day': { days: OpusV1Content['speakersByDay'] };
  'value-prop': OpusV1Content['transformations'];
  supplement: OpusV1Content['supplement'];
  'bonus-stack': {
    roman: string;
    headline: string;
    subhead: string;
    ctaLabel: string;
    items: OpusV1Content['bonusStack'];
  };
  'host-founder': OpusV1Content['founders'];
  'testimonials-attendees': OpusV1Content['testimonials'];
  'pull-quote': OpusV1Content['pullQuote'];
  'facts-stats': OpusV1Content['figures'];
  'reasons-to-attend': OpusV1Content['shifts'];
  faq: { items: OpusV1Content['faqs'] };
  'closing-cta': OpusV1Content['closing'];
  footer: OpusV1Content['footer'];
};

export function opusV1ContentToSections(c: OpusV1Content): SectionContentMap {
  return {
    masthead: c.masthead,
    hero: c.hero,
    marquee: { items: [...c.featuredIn] },
    'stats-hero': c.socialProof,
    'summit-overview': {
      roman: c.whatIsThis.roman,
      headline: c.whatIsThis.headline,
      bodyParagraphs: c.whatIsThis.bodyParagraphs,
      ctaLabel: c.whatIsThis.ctaLabel,
      featureBand: c.featureBand,
    },
    'speakers-by-day': { days: c.speakersByDay },
    'value-prop': c.transformations,
    supplement: c.supplement,
    'bonus-stack': {
      roman: c.bonusStackSection.roman,
      headline: c.bonusStackSection.headline,
      subhead: c.bonusStackSection.subhead,
      ctaLabel: c.bonusStackSection.ctaLabel,
      items: c.bonusStack,
    },
    'host-founder': c.founders,
    'testimonials-attendees': c.testimonials,
    'pull-quote': c.pullQuote,
    'facts-stats': c.figures,
    'reasons-to-attend': c.shifts,
    faq: { items: c.faqs },
    'closing-cta': c.closing,
    footer: c.footer,
  };
}
