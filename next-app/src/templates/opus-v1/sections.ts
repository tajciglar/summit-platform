import { Masthead } from './skins/Masthead';
import { Hero } from './skins/Hero';
import { Marquee } from './skins/Marquee';
import { StatsHero } from './skins/StatsHero';
import { SummitOverview } from './skins/SummitOverview';
import { SpeakersByDay } from './skins/SpeakersByDay';
import { ValueProp } from './skins/ValueProp';
import { Supplement } from './skins/Supplement';
import { BonusStack } from './skins/BonusStack';
import { HostFounder } from './skins/HostFounder';
import { TestimonialsAttendees } from './skins/TestimonialsAttendees';
import { PullQuote } from './skins/PullQuote';
import { FactsStats } from './skins/FactsStats';
import { ReasonsToAttend } from './skins/ReasonsToAttend';
import { Faq } from './skins/Faq';
import { ClosingCta } from './skins/ClosingCta';
import { Footer } from './skins/Footer';

export const opusV1Sections = {
  masthead: Masthead,
  hero: Hero,
  marquee: Marquee,
  'stats-hero': StatsHero,
  'summit-overview': SummitOverview,
  'speakers-by-day': SpeakersByDay,
  'value-prop': ValueProp,
  supplement: Supplement,
  'bonus-stack': BonusStack,
  'host-founder': HostFounder,
  'testimonials-attendees': TestimonialsAttendees,
  'pull-quote': PullQuote,
  'facts-stats': FactsStats,
  'reasons-to-attend': ReasonsToAttend,
  faq: Faq,
  'closing-cta': ClosingCta,
  footer: Footer,
} as const;

export const opusV1SupportedSections = Object.keys(opusV1Sections) as (keyof typeof opusV1Sections)[];

export const opusV1SectionOrder: string[] = [
  'masthead',
  'hero',
  'marquee',
  'stats-hero',
  'summit-overview',
  'speakers-by-day',
  'value-prop',
  'supplement',
  'bonus-stack',
  'host-founder',
  'testimonials-attendees',
  'pull-quote',
  'facts-stats',
  'reasons-to-attend',
  'faq',
  'closing-cta',
  'footer',
];

export const opusV1DefaultEnabledSections: string[] = [
  'masthead',
  'hero',
  'summit-overview',
  'speakers-by-day',
  'value-prop',
  'host-founder',
  'testimonials-attendees',
  'faq',
  'closing-cta',
  'footer',
];
