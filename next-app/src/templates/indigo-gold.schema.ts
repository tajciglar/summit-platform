import { z } from 'zod';
import { EventStatusSchema } from '../components/event-status';

/**
 * IndigoGold — warm "trusted family" aesthetic.
 * Deep-indigo brand + gold accent palette, Poppins headings + Source Sans 3
 * body. Ported from next-app/public/indigo-gold.html (the original
 * hand-designed page for the ADHD Parenting Summit 2026). The template key
 * is `indigo-gold` for historical reasons — the slots themselves are
 * niche-neutral and fillable for any summit.
 *
 * Every visible rendered string is a schema slot so operators can override
 * per-summit.
 */
export const IndigoGoldSchema = z.object({
  summit: z.object({
    name: z.string().min(1),
    tagline: z.string().min(1),
    startDate: z.string().date(),
    endDate: z.string().date(),
    timezone: z.string(),
  }),
  topBar: z.object({
    name: z.string().min(1),                    // "ADHD PARENTING SUMMIT 2026"
  }),
  hero: z.object({
    eyebrow: z.string().min(1),                 // "Become an Empowered Parent in 5 Days:"
    headline: z.string().min(1),
    headlineItalicTail: z.string().nullish(),   // italic trailing portion inside the h1
    subheadlineLead: z.string().min(1),         // "40+ Leading Experts"
    subheadlineTrail: z.string().min(1),        // " On Improving Focus, ..."
    ctaLabel: z.string().min(1),                // "Get Instant Access →"
    ctaNote: z.string().nullish(),              // "Claim your FREE ticket..."
    eventStatusLabel: z.string().nullish(),     // legacy free-form pill text; superseded by eventStatus
    eventStatus: EventStatusSchema.nullish(),   // 'before' | 'live' | 'ended'
    dateRangeLabel: z.string().nullish(),       // "3–5 May, 2026" — shown when eventStatus='before'
    liveLabel: z.string().nullish(),            // override for "Summit Now Live" copy
    endedLabel: z.string().nullish(),           // override for "Event Ended" copy
    giftNoteLead: z.string().min(1),            // "Register now to get a "
    giftNoteAccent: z.string().min(1),          // "FREE GIFT"
    giftNoteTrail: z.string().min(1),           // ": The ADHD Parenting Mastery Collection"
    ratingLead: z.string().min(1),              // "Loved by "
    ratingCount: z.string().min(1),             // "73,124"
    ratingTrail: z.string().min(1),             // " committed parents"
    collageSpeakerIds: z.array(z.string().uuid()).min(1).max(6),
    // Optional photo URLs used if speakers don't have photos (or to override).
    // Length may be shorter than collageSpeakerIds; the component falls back
    // to the speaker's own photoUrl or initials otherwise.
    collagePhotoUrls: z.array(z.string().url()).max(6).nullish(),
  }),
  press: z.object({
    eyebrow: z.string().min(1),                 // "Our Speakers Have Been Featured In"
    outlets: z.array(z.string().min(1)).min(3).max(20),
  }),
  trustBadges: z.object({
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
    eyebrow: z.string().min(1),                 // "What Is This?"
    headline: z.string().min(1),
    bodyParagraphs: z.array(z.string().min(1)).min(1).max(10),
    ctaLabel: z.string().min(1),                // "Claim Your Free Seat"
    cardHeadline: z.string().min(1),            // "5 Days. 40+ Experts. 100% Free."
    cardSubhead: z.string().min(1),             // "Watch live or catch the replays"
    imageUrl: z.string().url().nullish(),        // optional hero-right image
  }),
  speakersDay: z.object({
    dayBadge: z.string().min(1),                // "DAY 1"
    headline: z.string().min(1),                // "Understanding Your Child's Brain"
    speakerIds: z.array(z.string().uuid()).min(1),
    // Optional outer heading shown above the day list ("Learn From These" / "40+ World-Leading Experts").
    sectionEyebrow: z.string().nullish(),
    sectionHeadline: z.string().nullish(),
    // Optional per-day breakdown. If supplied with items, renders the full
    // multi-day layout. An empty array or null/undefined falls back to the
    // single-day grid driven by the top-level `speakerIds` list.
    days: z
      .array(
        z.object({
          badge: z.string().min(1),
          title: z.string().min(1),
          speakerIds: z.array(z.string().uuid()).min(1),
        }),
      )
      .max(7)
      .nullish(),
  }),
  outcomes: z.object({
    eyebrow: z.string().min(1),                 // "What You'll Walk Away With"
    headline: z.string().min(1),
    items: z.array(z.object({
      title: z.string().min(1),
      description: z.string().min(1),
      icon: z.enum(['brain', 'chat', 'clock', 'heart', 'school', 'users']),
      tone: z.enum(['brand', 'gold']),
    })).length(6),
  }),
  freeGift: z.object({
    eyebrow: z.string().min(1),                 // "Register Now & Get This Free"
    headline: z.string().min(1),                // "The ADHD Parenting Mastery Collection"
    body: z.string().min(1),
    bullets: z.array(z.string().min(1)).min(2).max(6),
    ctaLabel: z.string().min(1),                // "Get Instant Access + Free Gift →"
    badgeLabel: z.string().min(1),              // "FREE GIFT"
    cardTitle: z.string().min(1),               // "The ADHD Parenting Mastery Collection"
    cardNote: z.string().min(1),                // "FREE with registration"
  }),
  bonuses: z.object({
    eyebrow: z.string().min(1),                 // "Plus Free Bonuses"
    headline: z.string().min(1),                // "Three Bonuses Worth $291 — Yours Free"
    items: z.array(z.object({
      valueLabel: z.string().min(1),            // "$97 VALUE"
      title: z.string().min(1),
      description: z.string().min(1),
      bullets: z.array(z.string().min(1)).min(1).max(5),
    })).min(1).max(5),
    ctaLabel: z.string().min(1),
  }),
  founders: z.object({
    headline: z.string().min(1),                // "From the Founders"
    items: z.array(z.object({
      name: z.string().min(1),
      role: z.string().min(1),
      quote: z.string().min(1),
      initials: z.string().min(1).max(4),
    })).length(2),
  }),
  testimonials: z.object({
    eyebrow: z.string().min(1),                 // "What Parents Say"
    headline: z.string().min(1),                // "73,124 Parents. One Common Theme."
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
    eyebrow: z.string().min(1),                 // "Why This Matters"
    headline: z.string().min(1),
    items: z.array(z.object({
      value: z.string().min(1),
      description: z.string().min(1),
    })).length(6),
  }),
  shifts: z.object({
    eyebrow: z.string().min(1),                 // "Five Big Shifts"
    headline: z.string().min(1),                // "What Changes By Day 5"
    items: z.array(z.object({
      title: z.string().min(1),
      description: z.string().min(1),
    })).length(5),
  }),
  closing: z.object({
    headline: z.string().min(1),                // "Your Free Seat Is Waiting"
    chips: z.array(z.string().min(1)).min(2).max(8),
    ctaLabel: z.string().min(1),                // "CLAIM YOUR FREE SEAT →"
  }),
  faqSection: z.object({
    eyebrow: z.string().min(1),                 // "Common Questions"
    headline: z.string().min(1),                // "Frequently Asked Questions"
  }),
  faqs: z.array(z.object({
    question: z.string().min(1),
    answer: z.string().min(1),
  })).min(3).max(10),
  mobileCta: z.object({
    ctaLabel: z.string().min(1),                // "Get Instant Access — It's Free →"
  }),
  footer: z.object({
    brandName: z.string().min(1),
    tagline: z.string().min(1),                 // "Parenting you can rely on"
    brandInitial: z.string().min(1).max(2),     // "A"
    links: z.array(z.object({
      label: z.string().min(1),
      href: z.string().min(1),
    })).min(1).max(6),
    copyright: z.string().min(1),
  }),
});

export type IndigoGoldContent = z.infer<typeof IndigoGoldSchema>;
