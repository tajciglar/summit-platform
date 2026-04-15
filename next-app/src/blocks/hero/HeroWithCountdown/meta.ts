import type { BlockMeta } from '@/types/block'

export const meta: BlockMeta = {
  type: 'HeroWithCountdown',
  category: 'hero',
  version: 1,
  validOn: ['optin'],
  purpose: 'Above-the-fold hero with a prominent countdown timer, multiple CTAs, and a social proof stat. Ideal for time-sensitive summit launches or event opt-ins.',
  exampleProps: {
    eyebrowLabel: 'FREE VIRTUAL SUMMIT • MAR 3-7 2026',
    headline: 'Parenting a Child With ADHD Just Got Easier',
    body: 'Join thousands of parents and learn practical strategies to navigate ADHD challenges with confidence and calm. Get insights from leading experts.',
    primaryCtaLabel: 'GET INSTANT ACCESS',
    primaryCtaHref: '#',
    secondaryCtaLabel: 'Claim FREE ticket',
    secondaryCtaHref: '#',
    footerStat: '73,124 parents already registered!',
    countdownTarget: '2026-03-03T00:00:00Z', // Example: March 3rd, 2026
    countdownEventDate: 'MARCH 3-7, 2026',
    countdownLimitedSpotsLabel: 'LIMITED SPOTS',
  },
}