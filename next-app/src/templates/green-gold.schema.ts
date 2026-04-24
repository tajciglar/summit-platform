import { z } from 'zod';

/**
 * Variant 3 — "ADHD-green timeline" aesthetic.
 * Brand-green + gold + soft-cream palette. Poppins heading + Source Sans 3 body.
 *
 * Every visible rendered string is a schema slot so operators can override
 * per-summit. Section eyebrows and headlines are all operator-configurable.
 *
 * The template is a family: optin-style sections (hero, press, bonuses,
 * founders, testimonials, faqs, etc.) and sales-style sections (salesHero,
 * vipBonuses, freeGifts, priceCard, comparisonTable, guarantee, whySection)
 * live in the same schema. Each step type enables a subset via
 * `enabled_sections`; the rendered pages share brand/typography/palette but
 * differ structurally because different sections render. Sales sections are
 * all optional so optin steps validate without supplying them.
 *
 * Sales-field shapes MUST match IndigoGold / OchreInk verbatim so shared
 * PHP `GoldenTemplates::vipContent()` data satisfies every template's schema.
 */
export const GreenGoldSchema = z.object({
  summit: z.object({
    name: z.string().min(1),
    tagline: z.string().min(1),
    startDate: z.string().date(),
    endDate: z.string().date(),
    timezone: z.string(),
  }),
  topBar: z.object({
    title: z.string().min(1),                    // centered title, no CTA
  }),
  hero: z.object({
    eyebrow: z.string().min(1),                  // "Become an Empowered Parent in 5 Days:"
    headline: z.string().min(1),
    subheadline: z.string().min(1),              // first bold + trailing copy, single string
    primaryCtaLabel: z.string().min(1),
    giftLine: z.string().min(1),                 // "Register now to get a FREE GIFT..."
    readerCount: z.string().min(1),              // "73,124"
    readerCountSuffix: z.string().min(1),        // "committed parents"
    speakerCountLabel: z.string().min(1),        // "40+ Expert Speakers"
    heroSpeakerIds: z.array(z.string().uuid()).min(1).max(6),
    socialProofAvatarIds: z.array(z.string().uuid()).min(1).max(4),
    blobCard: z.object({
      daysLabel: z.string().min(1),              // "5 Days. 40+ Experts."
      freeLabel: z.string().min(1),              // "100% Free."
      subLabel: z.string().min(1),               // "Watch live or catch the replays"
    }),
  }),
  press: z.object({
    eyebrow: z.string().min(1),                  // "OUR SPEAKERS HAVE BEEN FEATURED IN"
    outlets: z.array(z.string().min(1)).min(3).max(20),
  }),
  trust: z.object({
    items: z.array(z.string().min(1)).min(2).max(6),
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
    cardDaysLabel: z.string().min(1),            // "5 Days. 40+ Experts. 100% Free."
    cardSubLabel: z.string().min(1),
  }),
  // Speakers section derived at render time from the summit's Speaker
  // table: one day block per distinct `speaker.day_number`.
  outcomes: z.object({
    eyebrow: z.string().min(1),                  // "What You'll Walk Away With"
    headline: z.string().min(1),
    items: z.array(z.object({
      title: z.string().min(1),
      description: z.string().min(1),
    })).length(6),
  }),
  freeGift: z.object({
    eyebrow: z.string().min(1),                  // "Register Now & Get This Free"
    headline: z.string().min(1),
    body: z.string().min(1),
    bullets: z.array(z.string().min(1)).min(2).max(6),
    ctaLabel: z.string().min(1),
    bookTitle: z.string().min(1),
    bookSubLabel: z.string().min(1),             // "FREE with registration"
    badge: z.string().min(1),                    // "FREE GIFT"
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
    headline: z.string().min(1),
    items: z.array(z.object({
      title: z.string().min(1),
      description: z.string().min(1),
    })).length(5),
  }),
  closing: z.object({
    headline: z.string().min(1),                 // "Your Free Seat Is Waiting"
    features: z.array(z.string().min(1)).min(2).max(8),
    ctaLabel: z.string().min(1),
  }),
  faqSection: z.object({
    eyebrow: z.string().min(1),                  // "Common Questions"
    headline: z.string().min(1),
  }),
  faqs: z.array(z.object({
    question: z.string().min(1),
    answer: z.string().min(1),
  })).min(3).max(10),
  mobileCtaLabel: z.string().min(1),             // sticky mobile CTA label
  footer: z.object({
    brandName: z.string().min(1),
    tagline: z.string().min(1),
    brandInitial: z.string().min(1).max(2),      // "A"
    links: z.array(z.object({
      label: z.string().min(1),
      href: z.string().min(1),
    })).min(1).max(6),
    copyright: z.string().min(1),
  }),

  // ─────────────────────────────────────────────────────────────────
  // Sales-page sections (all optional — only sales_page steps enable them).
  // Shapes are copied verbatim from indigo-gold.schema.ts so shared PHP
  // data satisfies every template-family schema. Visual styling is
  // re-skinned in GreenGold.tsx with the heartland-green + gold palette.
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

export type GreenGoldContent = z.infer<typeof GreenGoldSchema>;
