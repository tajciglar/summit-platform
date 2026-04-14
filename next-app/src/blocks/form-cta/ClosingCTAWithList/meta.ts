import type { BlockMeta } from '@/types/block'

export const meta: BlockMeta = {
  type: 'ClosingCTAWithList',
  category: 'form-cta',
  version: 1,
  validOn: ['optin', 'sales_page', 'checkout', 'upsell'],
  purpose: 'Final call-to-action block — headline + optional body + 2-10 checkmark bullets + prominent CTA. Use at the end of long landing pages or right before the fold of a sales page to summarize what the visitor is about to get.',
  exampleProps: {
    eyebrow: 'Last call',
    headline: 'Here\u2019s everything you get when you register',
    bodyText: 'One click, 30 seconds. We\u2019ll email you the schedule and the first-day session link.',
    bullets: [
      '5 days of live summit sessions with 40+ experts',
      '24-hour replay on every session — watch when your kid is asleep',
      'Live Q&A windows with the day\u2019s speakers',
      'Day 1 welcome guide + printable session planner',
      'Private community for 90 days after the summit',
    ],
    ctaLabel: 'GET INSTANT ACCESS',
    ctaUrl: '#register',
    background: 'gradient',
  },
}
