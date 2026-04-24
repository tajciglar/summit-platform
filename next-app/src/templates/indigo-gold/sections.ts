import { TopBar } from './skins/TopBar';
import { Hero } from './skins/Hero';
import { Press } from './skins/Press';
import { TrustBadges } from './skins/TrustBadges';
import { StatPills } from './skins/StatPills';
import { Overview } from './skins/Overview';
import { SpeakersGrid } from './skins/SpeakersGrid';
import { Outcomes } from './skins/Outcomes';
import { FreeGift } from './skins/FreeGift';
import { Founders } from './skins/Founders';
import { Testimonials } from './skins/Testimonials';
import { Bonuses } from './skins/Bonuses';
import { PullQuote } from './skins/PullQuote';
import { Figures } from './skins/Figures';
import { Shifts } from './skins/Shifts';
import { ClosingCta } from './skins/ClosingCta';
import { Faq } from './skins/Faq';
import { Footer } from './skins/Footer';
import { StickyMobileCta } from './skins/StickyMobileCta';
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

export const indigoGoldSections = {
  'top-bar': TopBar,
  hero: Hero,
  press: Press,
  'trust-badges': TrustBadges,
  stats: StatPills,
  overview: Overview,
  speakers: SpeakersGrid,
  outcomes: Outcomes,
  'free-gift': FreeGift,
  founders: Founders,
  testimonials: Testimonials,
  bonuses: Bonuses,
  'pull-quote': PullQuote,
  figures: Figures,
  shifts: Shifts,
  'closing-cta': ClosingCta,
  faq: Faq,
  footer: Footer,
  'sticky-mobile-cta': StickyMobileCta,
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

export {
  indigoGoldSupportedSections,
  indigoGoldSectionOrder,
  indigoGoldDefaultEnabledSections,
  indigoGoldDefaultSalesSections,
  type IndigoGoldSectionKey,
} from '../indigo-gold.sections';
