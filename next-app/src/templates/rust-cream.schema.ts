import { z } from 'zod';

/**
 * Variant 1 — warm editorial summit aesthetic.
 * Brown/tan/rust palette with rust primary (#C2703E), dark brown CTA (#8B4513),
 * gold accent (#D4A04A), sage supporting green. Poppins heading + Source Sans 3
 * body + Playfair Display for press logos.
 *
 * Every visible rendered string is a schema slot so operators can override
 * per-summit. Eyebrows, section labels, pill labels, CTA copy — all configurable.
 */
export const RustCreamSchema = z.object({
  summit: z.object({
    name: z.string().min(1),
    tagline: z.string().min(1),
    startDate: z.string().date(),
    endDate: z.string().date(),
    timezone: z.string(),
  }),
  topBar: z.object({
    name: z.string().min(1),                     // "ADHD PARENTING SUMMIT 2026"
  }),
  hero: z.object({
    eyebrow: z.string().min(1),                  // "Become an Empowered Parent in 5 Days:"
    headline: z.string().min(1),
    subheadline: z.string().min(1),
    subheadlineLead: z.string().min(1),          // "40+ Leading Experts"
    ctaLabel: z.string().min(1),                 // "Get Instant Access →"
    freeGiftLine: z.string().min(1),             // "Register now to get a"
    freeGiftEmphasis: z.string().min(1),         // "FREE GIFT"
    freeGiftSuffix: z.string().min(1),           // ": The ADHD Parenting Mastery Collection"
    readerCount: z.string().min(1),              // "73,124"
    readerCountPrefix: z.string().min(1),        // "Loved by"
    readerCountSuffix: z.string().min(1),        // "parents"
    heroSpeakerIds: z.array(z.string().uuid()).min(1).max(8),
  }),
  press: z.object({
    eyebrow: z.string().min(1),                  // "Our Speakers Have Been Featured In"
    outlets: z.array(z.string().min(1)).min(3).max(20),
  }),
  trust: z.object({
    items: z.array(z.object({
      label: z.string().min(1),
      icon: z.enum(['shield', 'lock', 'info', 'star']),
    })).min(2).max(6),
  }),
  stats: z.object({
    items: z.array(z.object({
      value: z.string().min(1),
      label: z.string().min(1),
    })).length(3),
  }),
  overview: z.object({
    eyebrow: z.string().min(1),                  // "What Is This?"
    headline: z.string().min(1),
    bodyParagraphs: z.array(z.string().min(1)).min(1).max(3),
    ctaLabel: z.string().min(1),
    cardHeadline: z.string().min(1),             // "5 Days. 40+ Experts. 100% Free."
    cardSubtext: z.string().min(1),              // "Watch live or catch the replays"
  }),
  // Speakers section derived at render time from the summit's Speaker
  // table: one day block per distinct `speaker.day_number`.
  outcomes: z.object({
    eyebrow: z.string().min(1),                  // "What You'll Walk Away With"
    headline: z.string().min(1),
    items: z.array(z.object({
      title: z.string().min(1),
      description: z.string().min(1),
      accent: z.enum(['primary', 'secondary']),
    })).length(6),
  }),
  freeGift: z.object({
    eyebrow: z.string().min(1),                  // "Register Now & Get This Free"
    headline: z.string().min(1),
    body: z.string().min(1),
    bullets: z.array(z.string().min(1)).min(2).max(6),
    ctaLabel: z.string().min(1),
    badgeLabel: z.string().min(1),               // "FREE GIFT"
    mockupTitle: z.string().min(1),              // "The ADHD Parenting Mastery Collection"
    mockupSubtitle: z.string().min(1),           // "FREE with registration"
  }),
  bonuses: z.object({
    eyebrow: z.string().min(1),                  // "Plus Free Bonuses"
    headline: z.string().min(1),
    ctaLabel: z.string().min(1),
    items: z.array(z.object({
      valueLabel: z.string().min(1),             // "$97 VALUE"
      title: z.string().min(1),
      description: z.string().min(1),
      bullets: z.array(z.string().min(1)).min(1).max(5),
    })).min(1).max(5),
  }),
  founders: z.object({
    headline: z.string().min(1),                 // "From the Founders"
    items: z.array(z.object({
      name: z.string().min(1),
      role: z.string().min(1),
      quote: z.string().min(1),
      initials: z.string().min(1).max(4),
    })).length(2),
  }),
  testimonials: z.object({
    eyebrow: z.string().min(1),                  // "What Parents Say"
    headline: z.string().min(1),
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
    eyebrow: z.string().min(1),                  // "Why This Matters"
    headline: z.string().min(1),
    items: z.array(z.object({
      value: z.string().min(1),
      description: z.string().min(1),
    })).length(6),
  }),
  shifts: z.object({
    eyebrow: z.string().min(1),                  // "Five Big Shifts"
    headline: z.string().min(1),                 // "What Changes By Day 5"
    items: z.array(z.object({
      title: z.string().min(1),
      description: z.string().min(1),
    })).length(5),
  }),
  closing: z.object({
    headline: z.string().min(1),                 // "Your Free Seat Is Waiting"
    ctaLabel: z.string().min(1),
    pills: z.array(z.string().min(1)).min(2).max(8),
  }),
  faqSection: z.object({
    eyebrow: z.string().min(1),                  // "Common Questions"
    headline: z.string().min(1),                 // "Frequently Asked Questions"
  }),
  faqs: z.array(z.object({
    question: z.string().min(1),
    answer: z.string().min(1),
  })).min(3).max(10),
  mobileCta: z.object({
    label: z.string().min(1),
  }),
  footer: z.object({
    brandInitial: z.string().min(1).max(2),      // "A"
    brandName: z.string().min(1),
    tagline: z.string().min(1),
    links: z.array(z.object({
      label: z.string().min(1),
      href: z.string().min(1),
    })).min(1).max(6),
    copyright: z.string().min(1),
  }),

  // Sales-page sections — all optional. Optin steps omit them entirely;
  // sales steps enable the subset they need via `enabled_sections`.
  // Shapes mirror the IndigoGold family contract so operators see the
  // same editable fields across templates.
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

export type RustCreamContent = z.infer<typeof RustCreamSchema>;
