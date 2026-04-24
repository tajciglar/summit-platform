import { z } from 'zod';
import { EventStatusSchema } from '../components/event-status';

export const OchreInkSchema = z.object({
  summit: z.object({
    name: z.string().min(1),
    tagline: z.string().min(1),
    startDate: z.string().date(),
    endDate: z.string().date(),
    timezone: z.string(),
  }),
  masthead: z.object({
    volume: z.string().min(1),                // e.g. "Vol. VII · Feb 2026"
    eyebrow: z.string().min(1),               // e.g. "An Annual Reader"
  }),
  hero: z.object({
    issueLabel: z.string().min(1),            // e.g. "Issue No. VII"
    dateRangeLabel: z.string().min(1),        // e.g. "Feb 10–14, 2026"
    eventStatus: EventStatusSchema.optional(),
    liveLabel: z.string().optional(),
    endedLabel: z.string().optional(),
    metaLabel: z.string().min(1),             // e.g. "100% Free · Online"
    readerCount: z.string().min(1),           // e.g. "73,124 Readers"
    eyebrow: z.string().min(1),
    headline: z.string().min(3),
    subheadline: z.string().min(3),
    ctaLabel: z.string().min(1),
    ctaSubtext: z.string().min(1).optional(),
    ratingText: z.string().min(1),            // e.g. "Loved by 73,124 committed parents"
    figCaption: z.string().min(1),            // e.g. "Fig. 1 — A selection of this issue's contributors"
    heroSpeakerIds: z.array(z.string().uuid()).min(1).max(4),
  }),
  featuredIn: z.array(z.string().min(1)).min(3).max(20),
  socialProof: z.object({
    statLabel1: z.string().min(1), statValue1: z.string().min(1),
    statLabel2: z.string().min(1), statValue2: z.string().min(1),
    statLabel3: z.string().min(1), statValue3: z.string().min(1),
  }),
  whatIsThis: z.object({
    roman: z.string().min(1),                 // e.g. "II."
    headline: z.string().min(1),
    bodyParagraphs: z.array(z.string().min(1)).length(2),
    ctaLabel: z.string().min(1),
  }),
  featureBand: z.object({
    eyebrow: z.string().min(1),               // "Editors' Note"
    headline: z.string().min(1),
    body: z.string().min(1),
    bullets: z.array(z.string()).length(3),
  }),
  speakersByDay: z.array(z.object({
    dayLabel: z.string().min(1),              // e.g. "Contributors — Day One"
    dayDate: z.string().date(),
    dayTheme: z.string().min(1).optional(),   // e.g. "Understanding Your Child's Brain"
    roman: z.string().min(1).optional(),      // e.g. "III."
    speakerIds: z.array(z.string().uuid()),
  })).min(1),
  transformations: z.object({
    roman: z.string().min(1),                 // e.g. "IV."
    headline: z.string().min(1),
    subhead: z.string().min(1),
    items: z.array(z.object({
      title: z.string().min(1),
      description: z.string().min(1),
    })).length(6),
  }),
  supplement: z.object({
    cardLabel: z.string().min(1),             // e.g. "Supplement"
    cardTitle: z.string().min(1),
    cardFooter: z.string().min(1),            // e.g. "Issued with your complimentary seat"
    cardVolume: z.string().min(1),            // e.g. "Vol. VII · 2026"
    badgeLabel: z.string().min(1),            // e.g. "ENCLOSED FREE"
    eyebrow: z.string().min(1),
    headline: z.string().min(1),
    body: z.string().min(1),
    bullets: z.array(z.string().min(1)).min(2).max(6),
    ctaLabel: z.string().min(1),
  }),
  bonusStackSection: z.object({
    roman: z.string().min(1),                 // e.g. "V."
    headline: z.string().min(1),
    subhead: z.string().min(1),
    ctaLabel: z.string().min(1),
  }),
  bonusStack: z.array(z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    valueLabel: z.string().min(1),
    bullets: z.array(z.string().min(1)).min(1).max(5).optional(),
  })).min(1).max(5),
  founders: z.object({
    roman: z.string().min(1),                 // e.g. "VI."
    headline: z.string().min(1),
    items: z.array(z.object({
      name: z.string().min(1),
      role: z.string().min(1),
      quote: z.string().min(1),
      initials: z.string().min(1).max(4),
    })).length(2),
  }),
  testimonials: z.object({
    roman: z.string().min(1),                 // e.g. "VII."
    headline: z.string().min(1),
    subhead: z.string().min(1),
    items: z.array(z.object({
      quote: z.string().min(1),
      name: z.string().min(1),
      location: z.string().min(1),
      initials: z.string().min(1).max(4),
    })).length(3),
  }),
  pullQuote: z.object({
    quote: z.string().min(1),
    attribution: z.string().min(1),
  }),
  figures: z.object({
    roman: z.string().min(1),                 // e.g. "VIII."
    headline: z.string().min(1),
    subhead: z.string().min(1),
    items: z.array(z.object({
      label: z.string().min(1),
      value: z.string().min(1),
      description: z.string().min(1),
    })).length(6),
  }),
  shifts: z.object({
    roman: z.string().min(1),                 // e.g. "IX."
    headline: z.string().min(1),
    items: z.array(z.object({
      title: z.string().min(1),
      description: z.string().min(1),
    })).length(5),
  }),
  faqs: z.array(z.object({
    question: z.string().min(1),
    answer: z.string().min(1),
  })).min(3).max(10),
  closing: z.object({
    eyebrow: z.string().min(1).optional(),
    headline: z.string().min(1),
    subheadline: z.string().min(1),
    ctaLabel: z.string().min(1),
    fineprint: z.string().min(1).optional(),
  }),
  footer: z.object({
    tagline: z.string().min(1),
    volume: z.string().min(1),
    copyright: z.string().min(1),
  }),

  salesHero: z.object({
    badge: z.string().min(1).optional(),
    headline: z.string().min(1),
    subheadline: z.string().min(1),
    productLabel: z.string().min(1),
    totalValue: z.string().min(1),
    ctaLabel: z.string().min(1),
    ctaNote: z.string().min(1),
  }).optional(),
  intro: z.object({
    eyebrow: z.string().min(1),
    headline: z.string().min(1),
    paragraphs: z.array(z.string().min(1)).min(1).max(4),
  }).optional(),
  vipBonuses: z.object({
    eyebrow: z.string().min(1),
    headline: z.string().min(1),
    items: z.array(z.object({
      icon: z.enum(['infinity', 'clipboard', 'headphones', 'captions', 'file-text', 'book']),
      title: z.string().min(1),
      description: z.string().min(1),
      valueLabel: z.string().min(1),
    })).min(1).max(8),
  }).optional(),
  freeGifts: z.object({
    eyebrow: z.string().min(1),
    headline: z.string().min(1),
    items: z.array(z.object({
      giftNumber: z.number().int().min(1),
      title: z.string().min(1),
      description: z.string().min(1),
      valueLabel: z.string().min(1),
    })).min(1).max(6),
    deliveryNote: z.string().min(1),
  }).optional(),
  upgradeSection: z.object({
    eyebrow: z.string().min(1),
    headline: z.string().min(1),
    paragraphs: z.array(z.string().min(1)).min(1).max(6),
  }).optional(),
  priceCard: z.object({
    badge: z.string().min(1),
    headline: z.string().min(1),
    note: z.string().min(1),
    features: z.array(z.string().min(1)).min(1).max(10),
    giftsBoxTitle: z.string().min(1),
    giftItems: z.array(z.string().min(1)).min(1).max(6),
    totalValue: z.string().min(1),
    regularPrice: z.string().min(1),
    currentPrice: z.string().min(1),
    savings: z.string().min(1),
    ctaLabel: z.string().min(1),
    guarantee: z.string().min(1),
  }).optional(),
  salesSpeakers: z.object({
    eyebrow: z.string().min(1),
    headline: z.string().min(1),
  }).optional(),
  comparisonTable: z.object({
    eyebrow: z.string().min(1),
    headline: z.string().min(1),
    rows: z.array(z.object({
      label: z.string().min(1),
      freePass: z.boolean(),
      vipPass: z.boolean(),
    })).min(1).max(12),
  }).optional(),
  guarantee: z.object({
    heading: z.string().min(1),
    body: z.string().min(1),
    days: z.number().int().min(1),
  }).optional(),
  whySection: z.object({
    headline: z.string().min(1),
    subheadline: z.string().min(1),
    paragraphs: z.array(z.string().min(1)).min(1).max(6),
  }).optional(),
});

export type OchreInkContent = z.infer<typeof OchreInkSchema>;
