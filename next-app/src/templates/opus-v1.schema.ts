import { z } from 'zod';

export const OpusV1Schema = z.object({
  summit: z.object({
    name: z.string().min(1),
    tagline: z.string().min(1),
    startDate: z.string().date(),
    endDate: z.string().date(),
    timezone: z.string(),
  }),
  hero: z.object({
    eyebrow: z.string().min(1),
    headline: z.string().min(3),
    subheadline: z.string().min(3),
    ctaLabel: z.string().min(1),
    ctaSubtext: z.string().min(1).optional(),
  }),
  socialProof: z.object({
    statLabel1: z.string().min(1), statValue1: z.string().min(1),
    statLabel2: z.string().min(1), statValue2: z.string().min(1),
    statLabel3: z.string().min(1), statValue3: z.string().min(1),
  }),
  featureBand: z.object({
    eyebrow: z.string().min(1),
    headline: z.string().min(1),
    body: z.string().min(1),
    bullets: z.array(z.string()).length(3),
  }),
  speakersByDay: z.array(z.object({
    dayLabel: z.string().min(1),             // "Day 1 — Diagnosis"
    dayDate: z.string().date(),
    speakerIds: z.array(z.string().uuid()),
  })).min(1),
  bonusStack: z.array(z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    valueLabel: z.string().min(1),
  })).min(1).max(5),
  faqs: z.array(z.object({
    question: z.string().min(1),
    answer: z.string().min(1),
  })).min(3).max(10),
  closing: z.object({
    headline: z.string().min(1),
    subheadline: z.string().min(1),
    ctaLabel: z.string().min(1),
  }),
});

export type OpusV1Content = z.infer<typeof OpusV1Schema>;
