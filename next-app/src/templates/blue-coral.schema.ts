import { z } from 'zod';

/**
 * Variant 2 — "friendly blue + coral" summit layout.
 *
 * Poppins + Source Sans 3 type system. Navy brand + coral accents + warm
 * blue gradients. Every visible rendered string is a schema slot so
 * operators can override per-summit. Section labels/eyebrows are all
 * operator-configurable.
 */
export const BlueCoralSchema = z.object({
  summit: z.object({
    name: z.string().min(1),
    tagline: z.string().min(1),
    startDate: z.string().date(),
    endDate: z.string().date(),
    timezone: z.string(),
  }),
  topBar: z.object({
    title: z.string().min(1), // "ADHD PARENTING SUMMIT 2026"
  }),
  hero: z.object({
    eyebrow: z.string().min(1),
    headline: z.string().min(1),
    subheadlineLead: z.string().min(1), // bold fragment "40+ Leading Experts"
    subheadlineTrail: z.string().min(1),
    ctaLabel: z.string().min(1),
    giftNotePrefix: z.string().min(1), // "Register now to get a "
    giftNoteHighlight: z.string().min(1), // "FREE GIFT"
    giftNoteSuffix: z.string().min(1), // ": The ADHD Parenting Mastery Collection"
    socialProofLead: z.string().min(1), // "Loved by "
    socialProofCount: z.string().min(1), // "73,124"
    socialProofSuffix: z.string().min(1), // " committed parents"
    avatarSpeakerIds: z.array(z.string().uuid()).min(1).max(4),
  }),
  press: z.object({
    eyebrow: z.string().min(1),
    outlets: z.array(z.string().min(1)).min(3).max(20),
  }),
  trustBadges: z.object({
    items: z.array(z.object({
      icon: z.enum(['shield', 'lock', 'info', 'star']),
      label: z.string().min(1),
    })).min(2).max(6),
  }),
  stats: z.object({
    items: z.array(z.object({
      value: z.string().min(1),
      label: z.string().min(1),
    })).length(3),
  }),
  overview: z.object({
    eyebrow: z.string().min(1),
    headline: z.string().min(1),
    bodyParagraphs: z.array(z.string().min(1)).min(1).max(3),
    ctaLabel: z.string().min(1),
    illustrationCaption: z.string().min(1), // "5 Days. 40+ Experts. 100% Free."
    illustrationSubcaption: z.string().min(1), // "Watch live or catch the replays"
  }),
  speakersDay: z.object({
    dayLabel: z.string().min(1), // "DAY 1"
    headline: z.string().min(1),
    speakerIds: z.array(z.string().uuid()).min(1),
  }),
  outcomes: z.object({
    eyebrow: z.string().min(1),
    headline: z.string().min(1),
    items: z.array(z.object({
      title: z.string().min(1),
      description: z.string().min(1),
    })).length(6),
  }),
  freeGift: z.object({
    eyebrow: z.string().min(1),
    headline: z.string().min(1),
    body: z.string().min(1),
    bullets: z.array(z.string().min(1)).min(2).max(6),
    ctaLabel: z.string().min(1),
    badge: z.string().min(1), // "FREE GIFT"
    cardTitle: z.string().min(1),
    cardSubtitle: z.string().min(1), // "FREE with registration"
  }),
  bonuses: z.object({
    eyebrow: z.string().min(1),
    headline: z.string().min(1),
    ctaLabel: z.string().min(1),
    items: z.array(z.object({
      valueLabel: z.string().min(1),
      title: z.string().min(1),
      description: z.string().min(1),
      bullets: z.array(z.string().min(1)).min(1).max(5),
    })).min(1).max(5),
  }),
  founders: z.object({
    headline: z.string().min(1),
    items: z.array(z.object({
      name: z.string().min(1),
      role: z.string().min(1),
      quote: z.string().min(1),
      initials: z.string().min(1).max(4),
    })).length(2),
  }),
  testimonials: z.object({
    eyebrow: z.string().min(1),
    headline: z.string().min(1),
    featured: z.object({
      quote: z.string().min(1),
      name: z.string().min(1),
      location: z.string().min(1),
      initials: z.string().min(1).max(4),
    }),
    supporting: z.array(z.object({
      quote: z.string().min(1),
      name: z.string().min(1),
      location: z.string().min(1),
      initials: z.string().min(1).max(4),
    })).length(2),
  }),
  pullQuote: z.object({
    quote: z.string().min(1),
    attribution: z.string().min(1),
  }),
  figures: z.object({
    eyebrow: z.string().min(1),
    headline: z.string().min(1),
    items: z.array(z.object({
      value: z.string().min(1),
      description: z.string().min(1),
    })).length(6),
  }),
  shifts: z.object({
    eyebrow: z.string().min(1),
    headline: z.string().min(1),
    items: z.array(z.object({
      title: z.string().min(1),
      description: z.string().min(1),
    })).length(5),
  }),
  closing: z.object({
    headline: z.string().min(1),
    pills: z.array(z.string().min(1)).length(6),
    ctaLabel: z.string().min(1),
  }),
  faqSection: z.object({
    eyebrow: z.string().min(1),
    headline: z.string().min(1),
  }),
  faqs: z.array(z.object({
    question: z.string().min(1),
    answer: z.string().min(1),
  })).min(3).max(10),
  footer: z.object({
    brandInitial: z.string().min(1).max(2),
    brandName: z.string().min(1),
    tagline: z.string().min(1),
    links: z.array(z.object({
      label: z.string().min(1),
      href: z.string().min(1),
    })).min(1).max(6),
    copyright: z.string().min(1),
  }),

  salesHero: z.object({
    badge: z.string().min(1),
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

export type BlueCoralContent = z.infer<typeof BlueCoralSchema>;
