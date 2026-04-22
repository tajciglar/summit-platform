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
import { SalesHero } from './skins/SalesHero';
import { Intro } from './skins/Intro';
import { VipBonuses } from './skins/VipBonuses';
import { FreeGifts } from './skins/FreeGifts';
import { UpgradeSection } from './skins/UpgradeSection';
import { PriceCard } from './skins/PriceCard';
import { SalesSpeakers } from './skins/SalesSpeakers';
import { ComparisonTable } from './skins/ComparisonTable';
import { Guarantee } from './skins/Guarantee';
import { WhySection } from './skins/WhySection';

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
  'sales-hero': SalesHero,
  intro: Intro,
  'vip-bonuses': VipBonuses,
  'free-gifts': FreeGifts,
  'upgrade-section': UpgradeSection,
  'price-card': PriceCard,
  'sales-speakers': SalesSpeakers,
  'comparison-table': ComparisonTable,
  guarantee: Guarantee,
  'why-section': WhySection,
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
  'sales-hero',
  'intro',
  'vip-bonuses',
  'free-gifts',
  'upgrade-section',
  'price-card',
  'sales-speakers',
  'comparison-table',
  'guarantee',
  'why-section',
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

/**
 * Sales-page defaults — enabled automatically on `sales_page` steps so
 * new funnels render a distinct sales layout without manual configuration.
 */
export const opusV1DefaultSalesSections: string[] = [
  'sales-hero',
  'intro',
  'vip-bonuses',
  'free-gifts',
  'upgrade-section',
  'price-card',
  'sales-speakers',
  'comparison-table',
  'guarantee',
  'why-section',
];
