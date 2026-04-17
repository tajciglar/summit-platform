import type { OpusV1Content } from '../opus-v1.schema';

export const opusV1Fixture: OpusV1Content = {
  summit: {
    name: 'ADHD Parenting Summit 2026',
    tagline: 'Real strategies for real families',
    startDate: '2026-04-22',
    endDate: '2026-04-26',
    timezone: 'America/New_York',
  },
  hero: {
    eyebrow: 'FREE ONLINE EVENT',
    headline: 'Five days with twenty experts on ADHD parenting',
    subheadline: 'Practical, evidence-based masterclasses — free to attend live.',
    ctaLabel: 'Save my free seat',
    ctaSubtext: 'No credit card required',
  },
  socialProof: {
    statLabel1: 'families', statValue1: '38,000+',
    statLabel2: 'countries', statValue2: '42',
    statLabel3: 'avg rating', statValue3: '4.9 / 5',
  },
  featureBand: {
    eyebrow: 'WHY THIS MATTERS',
    headline: 'When parents have the right tools, families settle.',
    body: 'The gap between clinical advice and the kitchen floor at 7 a.m. is where most guides fail. These masterclasses are written for the kitchen floor.',
    bullets: [
      'Morning and bedtime routines that survive real life',
      'Scripts for the meltdown in aisle four',
      'How to protect siblings from ADHD fallout without guilt',
    ],
  },
  speakersByDay: [
    {
      dayLabel: 'Day 1 — Diagnosis & Foundations',
      dayDate: '2026-04-22',
      speakerIds: ['11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222'],
    },
    {
      dayLabel: 'Day 2 — Routines That Stick',
      dayDate: '2026-04-23',
      speakerIds: ['33333333-3333-4333-8333-333333333333'],
    },
  ],
  bonusStack: [
    { title: 'The Morning Routine Pack', description: 'Printable schedules for 3 age groups', valueLabel: '$49 value' },
    { title: 'Meltdown Scripts', description: '22 ready-made phrases for public outbursts', valueLabel: '$29 value' },
  ],
  faqs: [
    { question: 'Is this really free?', answer: 'Yes. Each masterclass is free to watch live.' },
    { question: 'Do I need to be there live?', answer: 'Live viewing is free; VIP pass unlocks replays.' },
    { question: 'Will I be pitched something?', answer: 'Yes — the VIP pass. You can ignore it and still get value.' },
  ],
  closing: {
    headline: 'Your family is not broken — the tools were wrong.',
    subheadline: 'Join us for five days of real help.',
    ctaLabel: 'Save my free seat',
  },
};
