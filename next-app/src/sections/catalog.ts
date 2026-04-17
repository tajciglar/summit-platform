import type { CatalogEntry } from './types';
import { HeroSchema } from './hero.schema';
import { MastheadSchema } from './masthead.schema';
import { MarqueeSchema } from './marquee.schema';
import { SummitOverviewSchema } from './summit-overview.schema';
import { ValuePropSchema } from './value-prop.schema';
import { SpeakersByDaySchema } from './speakers-by-day.schema';
import { BonusStackSchema } from './bonus-stack.schema';
import { SupplementSchema } from './supplement.schema';
import { HostFounderSchema } from './host-founder.schema';
import { TestimonialsAttendeesSchema } from './testimonials-attendees.schema';
import { PullQuoteSchema } from './pull-quote.schema';
import { FactsStatsSchema } from './facts-stats.schema';
import { ReasonsToAttendSchema } from './reasons-to-attend.schema';
import { StatsHeroSchema } from './stats-hero.schema';
import { FaqSchema } from './faq.schema';
import { ClosingCtaSchema } from './closing-cta.schema';
import { FooterSchema } from './footer.schema';

export const catalog: Record<string, CatalogEntry> = {
  masthead:                 { key: 'masthead',                 label: 'Masthead / nav',        description: 'Sticky top navigation',                        pageTypes: ['landing'], tier: 'core',     schema: MastheadSchema,               defaultOrder: 5  },
  hero:                     { key: 'hero',                     label: 'Hero',                  description: 'Above-the-fold headline + dates + CTA',        pageTypes: ['landing'], tier: 'core',     schema: HeroSchema,                   defaultOrder: 10 },
  marquee:                  { key: 'marquee',                  label: 'Press marquee',         description: 'Scrolling strip of publication names',         pageTypes: ['landing'], tier: 'optional', schema: MarqueeSchema,                defaultOrder: 20 },
  'stats-hero':             { key: 'stats-hero',               label: 'Big-numbers stats',     description: 'Three social-proof big numbers',               pageTypes: ['landing'], tier: 'optional', schema: StatsHeroSchema,              defaultOrder: 25 },
  'summit-overview':        { key: 'summit-overview',          label: 'Summit overview',       description: 'What this summit is about + editors note',     pageTypes: ['landing'], tier: 'core',     schema: SummitOverviewSchema,         defaultOrder: 30 },
  'speakers-by-day':        { key: 'speakers-by-day',          label: 'Speakers by day',       description: 'Speakers grouped by summit day',               pageTypes: ['landing'], tier: 'core',     schema: SpeakersByDaySchema,          defaultOrder: 40 },
  'value-prop':             { key: 'value-prop',               label: "What you'll get",       description: 'Transformations / outcomes list',              pageTypes: ['landing'], tier: 'optional', schema: ValuePropSchema,              defaultOrder: 50 },
  supplement:               { key: 'supplement',               label: 'Free supplement',       description: 'Free gift / included bonus card',              pageTypes: ['landing'], tier: 'optional', schema: SupplementSchema,             defaultOrder: 55 },
  'bonus-stack':            { key: 'bonus-stack',              label: 'Bonus stack',           description: 'Grid of included bonus items',                 pageTypes: ['landing'], tier: 'optional', schema: BonusStackSchema,             defaultOrder: 60 },
  'host-founder':           { key: 'host-founder',             label: 'Meet the host',         description: 'Founders / hosts with quotes',                 pageTypes: ['landing'], tier: 'core',     schema: HostFounderSchema,            defaultOrder: 70 },
  'testimonials-attendees': { key: 'testimonials-attendees',   label: 'Attendee testimonials', description: 'Past attendee quotes',                         pageTypes: ['landing'], tier: 'optional', schema: TestimonialsAttendeesSchema,  defaultOrder: 80 },
  'pull-quote':             { key: 'pull-quote',               label: 'Pull quote',            description: 'Divider pull-quote band',                      pageTypes: ['landing'], tier: 'optional', schema: PullQuoteSchema,              defaultOrder: 85 },
  'facts-stats':            { key: 'facts-stats',              label: 'Problem-space facts',   description: 'Grid of problem-domain data points',           pageTypes: ['landing'], tier: 'optional', schema: FactsStatsSchema,             defaultOrder: 90 },
  'reasons-to-attend':      { key: 'reasons-to-attend',        label: 'Reasons to attend',     description: 'Numbered reasons to register',                 pageTypes: ['landing'], tier: 'optional', schema: ReasonsToAttendSchema,        defaultOrder: 95 },
  faq:                      { key: 'faq',                      label: 'FAQ',                   description: 'Expandable Q&A list',                          pageTypes: ['landing'], tier: 'core',     schema: FaqSchema,                    defaultOrder: 100 },
  'closing-cta':            { key: 'closing-cta',              label: 'Closing CTA',           description: 'Final call to action',                         pageTypes: ['landing'], tier: 'core',     schema: ClosingCtaSchema,             defaultOrder: 110 },
  footer:                   { key: 'footer',                   label: 'Footer',                description: 'Legal + links footer',                         pageTypes: ['landing'], tier: 'core',     schema: FooterSchema,                 defaultOrder: 120 },
};

export const catalogKeys = Object.keys(catalog) as (keyof typeof catalog)[];
