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
};

export function opusV1ContentToSections(c: OchreInkContent): SectionContentMap {
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
