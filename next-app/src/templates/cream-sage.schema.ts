import { z } from 'zod';
import { EventStatusSchema } from '../components/event-status';

/**
 * Opus V3 — "gentle / cozy editorial" aesthetic.
 * Cream + sage + rose + clay palette. Fraunces (serif) + DM Sans + Nunito.
 *
 * Every visible rendered string is a schema slot so operators can override
 * per-summit. Eyebrows like "What is This?" / "Day One · Opening Circle" are
 * all operator-configurable.
 */
export const CreamSageSchema = z.object({
  summit: z.object({
    name: z.string().min(1),
    tagline: z.string().min(1),
    startDate: z.string().date(),
    endDate: z.string().date(),
    eventStatusLabel: z.string().optional(),     // computed by backend: e.g. "ONLINE Event, 27–29 April"
  }),
  topBar: z.object({
    brandName: z.string().min(1),                // "ADHD Parenting Summit"
    dateRangeLabel: z.string().min(1),           // "Feb 10–14, 2026 · Free"
    ctaLabel: z.string().min(1),                 // "Reserve seat"
  }),
  hero: z.object({
    badgeLabel: z.string().min(1),               // "Gentle 5-Day Summit"
    dateRangeLabel: z.string().min(1),           // "Feb 10–14, 2026 · Free & Online"
    eventStatus: EventStatusSchema.optional(),   // 'before' | 'live' | 'ended'
    liveLabel: z.string().optional(),
    endedLabel: z.string().optional(),
    headlineLead: z.string().min(1),             // "Your bright, "
    headlineAccent: z.string().optional(),           // "busy-minded" (italic/clay)
    headlineTrail: z.string().min(1),            // " child is not a problem to be solved."
    subheadline: z.string().min(3),
    primaryCtaLabel: z.string().min(1),          // "Reserve your free seat"
    secondaryCtaLabel: z.string().min(1),        // "Learn more"
    readerCount: z.string().min(1),              // "73,124"
    readerCountSuffix: z.string().min(1),        // "parents"
    readerLeadIn: z.string().min(1),             // "Loved by"
    ratingLabel: z.string().min(1),              // "★ ★ ★ ★ ★"
    heroSpeakerIds: z.array(z.string().uuid()).min(1).max(6),
  }),
  press: z.object({
    eyebrow: z.string().min(1),                  // "As Featured In"
    outlets: z.array(z.string().min(1)).min(3).max(20),
  }),
  stats: z.object({
    eyebrow: z.string().min(1),                  // "By the Numbers"
    items: z.array(z.object({
      value: z.string().min(1),                  // "5"
      suffix: z.string().min(1).optional(),      // "+" / "K"
      label: z.string().min(1),
    })).length(3),
  }),
  overview: z.object({
    eyebrow: z.string().min(1),                  // "What is This?"
    headlineLead: z.string().min(1),             // "An "
    headlineAccent: z.string().optional(),           // "unhurried"
    headlineTrail: z.string().min(1),            // " answer to an overwhelming question."
    bodyParagraphs: z.array(z.string().min(1)).min(1).max(3),
    ctaLabel: z.string().min(1),                 // "Reserve your seat"
    imageCaption: z.string().min(1),             // "Live talks · a printed Collection · a quiet community"
  }),
  // Speakers section derived at render time from the summit's Speaker
  // table: one day block per distinct `speaker.day_number`.
  outcomes: z.object({
    eyebrow: z.string().min(1),                  // "Six Shifts by Day Five"
    headlineLead: z.string().min(1),             // "What the end of the week "
    headlineAccent: z.string().optional(),           // "may sound like"
    headlineTrail: z.string().min(1).optional(),
    items: z.array(z.object({
      title: z.string().min(1),
      description: z.string().min(1),
    })).length(6),
  }),
  freeGift: z.object({
    eyebrow: z.string().min(1),                  // "Enclosed with Registration"
    headlineLead: z.string().min(1),             // "A "
    headlineAccent: z.string().optional(),           // "gentle collection"
    headlineTrail: z.string().min(1),            // ", enclosed."
    body: z.string().min(1),
    bullets: z.array(z.string().min(1)).min(2).max(6),
    ctaLabel: z.string().min(1),
    cardEyebrow: z.string().min(1),              // "A Gentle Collection"
    cardTitle: z.string().min(1),                // "The ADHD Parenting Mastery Collection"
    cardEnclosure: z.string().min(1),            // "Enclosed with your seat"
    cardVolume: z.string().min(1),               // "Vol. VII · 2026"
    cardBadge: z.string().min(1),                // "FREE GIFT"
  }),
  bonuses: z.object({
    eyebrow: z.string().min(1),                  // "Three Gentle Bonuses"
    headlineLead: z.string().min(1),             // "Three gifts, "
    headlineAccent: z.string().optional(),           // "worth $291"
    headlineTrail: z.string().min(1),            // ", yours free."
    ctaLabel: z.string().min(1),
    items: z.array(z.object({
      valueLabel: z.string().min(1),             // "$97 VALUE"
      title: z.string().min(1),
      description: z.string().min(1),
      bullets: z.array(z.string().min(1)).min(1).max(5),
    })).min(1).max(5),
  }),
  founders: z.object({
    headline: z.string().min(1),                 // "From the founders"
    items: z.array(z.object({
      name: z.string().min(1),
      role: z.string().min(1),
      quote: z.string().min(1),
      initials: z.string().min(1).max(4),
    })).length(2),
  }),
  testimonials: z.object({
    eyebrow: z.string().min(1),                  // "What Parents Say"
    headlineLead: z.string().min(1),             // "73,124 parents. "
    headlineAccent: z.string().optional(),           // "One common theme."
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
    eyebrow: z.string().min(1),                  // "Five Gentle Shifts"
    headlineLead: z.string().min(1),             // "What changes by "
    headlineAccent: z.string().optional(),           // "Day Five"
    headlineTrail: z.string().min(1).optional(),
    items: z.array(z.object({
      title: z.string().min(1),
      description: z.string().min(1),
    })).length(5),
  }),
  faqSection: z.object({
    eyebrow: z.string().min(1),                  // "Common Questions"
    headline: z.string().min(1),                 // "Gentle answers"
  }),
  faqs: z.array(z.object({
    question: z.string().min(1),
    answer: z.string().min(1),
  })).min(3).max(10),
  closing: z.object({
    badgeLabel: z.string().min(1),               // "Registration closes Feb 9, 2026"
    headlineLead: z.string().min(1),             // "Take a deep "
    headlineAccent: z.string().optional(),           // "breath"
    headlineTrail: z.string().min(1),            // ". Then reserve your seat."
    subheadline: z.string().min(1),
    ctaLabel: z.string().min(1),
    fineprint: z.string().min(1).optional(),
  }),
  footer: z.object({
    brandName: z.string().min(1),
    tagline: z.string().min(1),
    links: z.array(z.object({
      label: z.string().min(1),
      href: z.string().min(1),
    })).min(1).max(6),
    copyright: z.string().min(1),
  }),

  // Sales-page sections — optional; only sales steps enable them. Visually
  // styled to match the cozy editorial cream-sage aesthetic while the shape
  // mirrors the shared family contract so `GoldenTemplates::vipContent()`
  // validates.
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

export type CreamSageContent = z.infer<typeof CreamSageSchema>;
