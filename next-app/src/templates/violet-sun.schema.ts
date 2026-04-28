import { z } from 'zod';

/**
 * Opus V4 — "violet + sun" editorial aesthetic.
 * Violet gradients, sun-yellow accents, mist neutrals. Space Grotesk display +
 * DM Serif Display italic + Inter body.
 *
 * Every visible rendered string is a schema slot so operators can override
 * per-summit. Section eyebrows ("What is this?", "Day 01 · Opening Circle",
 * "Why this matters", etc.) are all operator-configurable.
 */
export const VioletSunSchema = z.object({
  summit: z.object({
    name: z.string().min(1),
    tagline: z.string().min(1),
    startDate: z.string().date(),
    endDate: z.string().date(),
    eventStatusLabel: z.string().optional(),     // computed by backend: e.g. "ONLINE Event, 27–29 April"
  }),
  topBar: z.object({
    brandName: z.string().min(1),                // "ADHD Parenting Summit"
    dateLabel: z.string().min(1),                // "Feb 10–14, 2026 · 100% free"
    ctaLabel: z.string().min(1),                 // "Reserve Seat →"
  }),
  hero: z.object({
    pillLabel: z.string().min(1),                // "Seventh annual · Feb 10–14, 2026"
    headlineAccent: z.string().optional(),           // italic-serif fragment: "Rewire"
    headlineTrail: z.string().min(1),            // " the way your family handles hard moments."
    subheadline: z.string().min(3),
    primaryCtaLabel: z.string().min(1),          // "Claim your free seat"
    secondaryCtaLabel: z.string().min(1),        // "See what's inside"
    ratingLabel: z.string().min(1),              // "4.9 / 5"
    readerCountLead: z.string().min(1),          // "Loved by"
    readerCount: z.string().min(1),              // "73,124"
    readerCountSuffix: z.string().min(1),        // "parents"
    freeBadge: z.string().min(1),                // "100% FREE"
    moreLabel: z.string().min(1),                // "+36 more contributors this week"
    heroSpeakerIds: z.array(z.string().uuid()).min(1).max(4),
  }),
  press: z.object({
    eyebrow: z.string().min(1),                  // "Our speakers have appeared in"
    outlets: z.array(z.string().min(1)).min(3).max(20),
  }),
  stats: z.object({
    eyebrow: z.string().min(1),                  // "By the numbers"
    items: z.array(z.object({
      value: z.string().min(1),                  // "5"
      suffix: z.string().min(1).optional(),      // "+" / "K"
      description: z.string().min(1),
    })).length(3),
  }),
  overview: z.object({
    eyebrow: z.string().min(1),                  // "What is this?"
    headlineLead: z.string().min(1),             // "A "
    headlineHighlight: z.string().min(1),        // "5-day intensive" (yellow highlight)
    headlineMid: z.string().min(1),              // " for the parent who is "
    headlineAccent: z.string().optional(),           // italic-serif "done winging it"
    headlineTrail: z.string().min(1),            // "."
    bodyParagraphs: z.array(z.string().min(1)).min(1).max(3),
    ctaLabel: z.string().min(1),
    cardEyebrow: z.string().min(1),              // "What's inside"
    components: z.array(z.object({
      title: z.string().min(1),
      description: z.string().min(1),
    })).length(3),
  }),
  // Speakers section derived at render time from the summit's Speaker
  // table: one day block per distinct `speaker.day_number`.
  outcomes: z.object({
    eyebrow: z.string().min(1),                  // "Six shifts by Day 5"
    headlineLead: z.string().min(1),             // "What the end of the week "
    headlineAccent: z.string().optional(),           // italic-serif "may sound like"
    items: z.array(z.object({
      title: z.string().min(1),
      description: z.string().min(1),
    })).length(6),
  }),
  freeGift: z.object({
    eyebrow: z.string().min(1),                  // "Included with Registration"
    headlineLead: z.string().min(1),             // "The Parenting Mastery "
    headlineAccent: z.string().optional(),           // italic-serif "Collection"
    headlineTrail: z.string().min(1),            // "."
    body: z.string().min(1),
    bullets: z.array(z.string().min(1)).min(2).max(6),
    ctaLabel: z.string().min(1),
    cardTitle: z.string().min(1),                // "The ADHD Parenting Mastery Collection"
    cardSubtitle: z.string().min(1),             // "FREE with registration · 2026 Edition"
    cardBadge: z.string().min(1),                // "$127 VALUE · FREE"
  }),
  bonuses: z.object({
    eyebrow: z.string().min(1),                  // "Plus three bonuses"
    headlineHighlight: z.string().min(1),        // "$291 value" (yellow hl)
    headlineTrail: z.string().min(1),            // " — yours free."
    ctaLabel: z.string().min(1),
    items: z.array(z.object({
      label: z.string().min(1),                  // "Bonus 01"
      valueLabel: z.string().min(1),             // "$97 VALUE"
      title: z.string().min(1),
      description: z.string().min(1),
      bullets: z.array(z.string().min(1)).min(1).max(5),
    })).min(1).max(5),
  }),
  founders: z.object({
    headlineLead: z.string().min(1),             // "From the "
    headlineAccent: z.string().optional(),           // italic-serif "founders"
    items: z.array(z.object({
      name: z.string().min(1),
      role: z.string().min(1),
      quote: z.string().min(1),
      initials: z.string().min(1).max(4),
    })).length(2),
  }),
  testimonials: z.object({
    eyebrow: z.string().min(1),                  // "Reviews"
    headlineLead: z.string().min(1),             // "73,124 parents. "
    headlineAccent: z.string().optional(),           // italic-serif "4.9 out of 5."
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
    eyebrow: z.string().min(1),                  // "Why this matters"
    headlineLead: z.string().min(1),             // "The "
    headlineAccent: z.string().optional(),           // italic-serif "reality"
    headlineTrail: z.string().min(1),            // " of ADHD in families today."
    items: z.array(z.object({
      label: z.string().min(1),                  // "Fig. 01"
      value: z.string().min(1),
      description: z.string().min(1),
      trend: z.enum(['rising', 'plateau', 'falling', 'volatile']),
    })).length(6),
  }),
  shifts: z.object({
    eyebrow: z.string().min(1),                  // "Five big shifts"
    headlineLead: z.string().min(1),             // "What changes by "
    headlineAccent: z.string().optional(),           // italic-serif "Day Five"
    items: z.array(z.object({
      title: z.string().min(1),
      description: z.string().min(1),
    })).length(5),
  }),
  faqSection: z.object({
    eyebrow: z.string().min(1),                  // "Common questions"
    headlineLead: z.string().min(1),             // "Quick "
    headlineAccent: z.string().optional(),           // italic-serif "answers"
  }),
  faqs: z.array(z.object({
    question: z.string().min(1),
    answer: z.string().min(1),
  })).min(3).max(10),
  closing: z.object({
    eyebrow: z.string().min(1),                  // "Registration closes Feb 9"
    headlineLead: z.string().min(1),             // "Rewire your family's "
    headlineAccent: z.string().optional(),           // italic-serif "hard moments"
    headlineTrail: z.string().min(1),            // "."
    subheadline: z.string().min(1),
    ctaLabel: z.string().min(1),
    fineprint: z.string().min(1).optional(),
  }),
  footer: z.object({
    brandName: z.string().min(1),
    tagline: z.string().min(1),
    summitLinksLabel: z.string().min(1),         // "Summit"
    summitLinks: z.array(z.object({
      label: z.string().min(1),
      href: z.string().min(1),
    })).min(1).max(6),
    legalLinksLabel: z.string().min(1),          // "Legal"
    legalLinks: z.array(z.object({
      label: z.string().min(1),
      href: z.string().min(1),
    })).min(1).max(6),
    contactLabel: z.string().min(1),             // "Contact"
    contactEmail: z.string().min(1),
    copyright: z.string().min(1),
    signoff: z.string().min(1),                  // "Made with care, for the parent..."
  }),

  // ─────────────────────────────────────────────────────────────────
  // Sales-page sections (all optional — only sales_page steps enable them).
  // Styled in violet-sun's editorial palette: violet gradients, sun-yellow
  // accents, DM Serif Display italic highlights, Space Grotesk display.
  // ─────────────────────────────────────────────────────────────────
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

export type VioletSunContent = z.infer<typeof VioletSunSchema>;
