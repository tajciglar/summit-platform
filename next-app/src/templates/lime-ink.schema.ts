import { z } from 'zod';
import { EventStatusSchema } from '../components/event-status';

/**
 * Opus V2 — "technical / dev-console" aesthetic.
 * Lime + indigo + ink palette. Inter + JetBrains Mono type system.
 *
 * Every visible rendered string is a schema slot so operators can override
 * per-summit. Section labels like "01 → HERO" / "02 → BY THE NUMBERS" /
 * "OUR SPEAKERS HAVE APPEARED IN" are all operator-configurable.
 */
export const LimeInkSchema = z.object({
  summit: z.object({
    name: z.string().min(1),
    tagline: z.string().min(1),
    startDate: z.string().date(),
    endDate: z.string().date(),
    timezone: z.string(),
  }),
  topBar: z.object({
    codeTag: z.string().min(1),                  // "[ADHD-SUMMIT]"
    name: z.string().min(1),
    statusPill: z.string().min(1),               // "FREE · FEB 2026"
    ctaLabel: z.string().min(1),                 // "Register →"
  }),
  hero: z.object({
    sectionLabel: z.string().min(1),             // "01 → HERO"
    dateRangeLabel: z.string().min(1),           // "Feb 10–14 · 2026"
    eventStatus: EventStatusSchema.optional(),   // 'before' | 'live' | 'ended'
    liveLabel: z.string().optional(),
    endedLabel: z.string().optional(),
    eyebrow: z.string().min(1),                  // "A 5-day intensive · for parents · science-backed"
    heroLine1: z.string().min(1),                // First line, rendered before <br>
    headlineLead: z.string().min(1),             // Second line, before accent
    headlineAccent: z.string().min(1),           // Second line, lime-colored fragment
    headlineTrail: z.string().min(1),            // Second line, after accent
    subheadline: z.string().min(3),
    primaryCtaLabel: z.string().min(1),          // "Register free"
    secondaryCtaLabel: z.string().min(1),        // "See what's inside"
    readerCount: z.string().min(1),              // "73,124"
    readerCountSuffix: z.string().min(1),        // "parents registered"
    ratingLabel: z.string().min(1),              // "4.9/5"
    featuredLabel: z.string().min(1),            // "FEATURED / DAY ONE"
    moreLabel: z.string().min(1),                // "+36 MORE THIS WEEK →"
    heroSpeakerIds: z.array(z.string().uuid()).min(1).max(4),
  }),
  press: z.object({
    eyebrow: z.string().min(1),                  // "OUR SPEAKERS HAVE APPEARED IN"
    outlets: z.array(z.string().min(1)).min(3).max(20),
  }),
  stats: z.object({
    sectionLabel: z.string().min(1),             // "02 → BY THE NUMBERS"
    items: z.array(z.object({
      label: z.string().min(1),                  // "DURATION"
      value: z.string().min(1),                  // "5"
      suffix: z.string().min(1).optional(),      // "+" / "K"
      description: z.string().min(1),
    })).length(3),
  }),
  overview: z.object({
    sectionLabel: z.string().min(1),             // "03 → OVERVIEW"
    headlineLead: z.string().min(1),             // "It's a five-day ADHD "
    headlineAccent: z.string().min(1),           // "operating system"
    headlineTrail: z.string().min(1),            // " update for your family."
    bodyParagraphs: z.array(z.string().min(1)).min(1).max(3),
    ctaLabel: z.string().min(1),
    systemCardLabel: z.string().min(1),          // "SYSTEM COMPONENTS"
    components: z.array(z.object({
      title: z.string().min(1),
      description: z.string().min(1),
    })).length(3),
  }),
  // Speakers section derived at render time from the summit's Speaker
  // table: one day block per distinct `speaker.day_number`.
  outcomes: z.object({
    sectionLabel: z.string().min(1),             // "05 → OUTCOMES"
    headlineLead: z.string().min(1),             // "Six shifts by Day Five. "
    headlineAccent: z.string().min(1).optional(),// optional lime-colored fragment
    headlineTrail: z.string().min(1),            // "Measured, not aspirational."
    itemBadge: z.string().min(1),                // "OUTCOME"
    items: z.array(z.object({
      title: z.string().min(1),
      description: z.string().min(1),
    })).length(6),
  }),
  freeGift: z.object({
    codeEyebrow: z.string().min(1),              // "INCLUDED.WITH.REGISTRATION"
    headline: z.string().min(1),
    body: z.string().min(1),
    bullets: z.array(z.string().min(1)).min(2).max(6),
    ctaLabel: z.string().min(1),
    cardFilename: z.string().min(1),             // "COLLECTION.ZIP"
    cardTitle: z.string().min(1),                // "ADHD Parenting Mastery"
    cardFiles: z.array(z.string().min(1)).min(2).max(8),
    cardCommand: z.string().min(1),              // "$ download --free"
    cardBadge: z.string().min(1),                // "$127 VALUE · FREE"
  }),
  bonuses: z.object({
    sectionLabel: z.string().min(1),             // "06 → BONUSES"
    headlineLead: z.string().min(1),             // "Three bonuses, "
    headlineAccent: z.string().min(1),           // "$291 value"
    headlineTrail: z.string().min(1),            // ", zero cost."
    subhead: z.string().min(1),
    ctaLabel: z.string().min(1),
    items: z.array(z.object({
      filename: z.string().min(1),               // "BONUS_01.md"
      valueLabel: z.string().min(1),             // "$97 VALUE"
      title: z.string().min(1),
      description: z.string().min(1),
      bullets: z.array(z.string().min(1)).min(1).max(5),
    })).min(1).max(5),
  }),
  founders: z.object({
    sectionLabel: z.string().min(1),             // "07 → TEAM"
    headline: z.string().min(1),
    items: z.array(z.object({
      name: z.string().min(1),
      role: z.string().min(1),
      quote: z.string().min(1),
      initials: z.string().min(1).max(4),
    })).length(2),
  }),
  testimonials: z.object({
    sectionLabel: z.string().min(1),             // "08 → REVIEWS"
    headlineLead: z.string().min(1),             // "73,124 parents. "
    headlineAccent: z.string().min(1).optional(),// optional lime-colored fragment
    headlineTrail: z.string().min(1),            // "4.9 / 5."
    subhead: z.string().min(1),
    items: z.array(z.object({
      quote: z.string().min(1),
      name: z.string().min(1),
      location: z.string().min(1),
      initials: z.string().min(1).max(4),
    })).length(3),
  }),
  pullQuote: z.object({
    eyebrow: z.string().min(1),                  // "// PULL QUOTE"
    quote: z.string().min(1),
    attribution: z.string().min(1),
  }),
  figures: z.object({
    sectionLabel: z.string().min(1),             // "09 → WHY THIS MATTERS"
    headline: z.string().min(1),
    items: z.array(z.object({
      label: z.string().min(1),                  // "FIG 01 / DIAGNOSIS"
      value: z.string().min(1),
      description: z.string().min(1),
      trend: z.enum(['rising', 'plateau', 'falling', 'volatile']),
    })).length(6),
  }),
  shifts: z.object({
    sectionLabel: z.string().min(1),             // "10 → SHIFTS"
    headline: z.string().min(1),
    items: z.array(z.object({
      title: z.string().min(1),
      description: z.string().min(1),
    })).length(5),
  }),
  faqSection: z.object({
    sectionLabel: z.string().min(1),             // "11 → FAQ"
    headline: z.string().min(1),                 // "Frequently asked"
  }),
  faqs: z.array(z.object({
    question: z.string().min(1),
    answer: z.string().min(1),
  })).min(3).max(10),
  closing: z.object({
    eyebrow: z.string().min(1),                  // "// REGISTRATION.CLOSES → FEB 09 2026"
    headline: z.string().min(1),
    subheadline: z.string().min(1),
    ctaLabel: z.string().min(1),
    fineprint: z.string().min(1).optional(),
  }),
  footer: z.object({
    codeTag: z.string().min(1),                  // "[ADHD-SUMMIT]"
    brandName: z.string().min(1),
    tagline: z.string().min(1),
    summitLinksLabel: z.string().min(1),         // "SUMMIT"
    summitLinks: z.array(z.object({
      label: z.string().min(1),
      href: z.string().min(1),
    })).min(1).max(6),
    legalLinksLabel: z.string().min(1),          // "LEGAL"
    legalLinks: z.array(z.object({
      label: z.string().min(1),
      href: z.string().min(1),
    })).min(1).max(6),
    contactLabel: z.string().min(1),             // "CONTACT"
    contactEmail: z.string().min(1),
    copyright: z.string().min(1),
  }),

  // ─────────────────────────────────────────────────────────────────
  // Sales-page sections (all optional — only sales_page steps enable them).
  // Shapes match indigo-gold exactly so shared PHP vipContent() payload
  // validates against both templates under the family model.
  // ─────────────────────────────────────────────────────────────────
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

export type LimeInkContent = z.infer<typeof LimeInkSchema>;
