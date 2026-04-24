import { TopBar } from './skins/TopBar';
import { Hero } from './skins/Hero';
import { Press } from './skins/Press';
import { Trust } from './skins/Trust';
import { Stats } from './skins/Stats';
import { Overview } from './skins/Overview';
import { Speakers } from './skins/Speakers';
import { Outcomes } from './skins/Outcomes';
import { FreeGift } from './skins/FreeGift';
import { Bonuses } from './skins/Bonuses';
import { Founders } from './skins/Founders';
import { Testimonials } from './skins/Testimonials';
import { PullQuote } from './skins/PullQuote';
import { Figures } from './skins/Figures';
import { Shifts } from './skins/Shifts';
import { ClosingCta } from './skins/ClosingCta';
import { Faq } from './skins/Faq';
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

export const rustCreamSections = {
  'top-bar': TopBar,
  hero: Hero,
  press: Press,
  trust: Trust,
  stats: Stats,
  overview: Overview,
  speakers: Speakers,
  outcomes: Outcomes,
  'free-gift': FreeGift,
  bonuses: Bonuses,
  founders: Founders,
  testimonials: Testimonials,
  'pull-quote': PullQuote,
  figures: Figures,
  shifts: Shifts,
  'closing-cta': ClosingCta,
  faq: Faq,
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

export {
  rustCreamSupportedSections,
  rustCreamSectionOrder,
  rustCreamDefaultEnabledSections,
  rustCreamDefaultSalesSections,
  type RustCreamSectionKey,
} from '../rust-cream.sections';
