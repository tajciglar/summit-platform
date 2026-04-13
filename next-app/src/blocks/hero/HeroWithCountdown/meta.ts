import type { BlockMeta } from '@/types/block'

export const meta: BlockMeta = {
  type: 'HeroWithCountdown',
  category: 'hero',
  version: 1,
  validOn: ['optin'],
  purpose: 'Above-the-fold hero for summit optins. Large headline + subhead + live countdown timer + primary/secondary CTAs + speaker count callout. Use for time-sensitive summit launches.',
  exampleProps: {
    eyebrow: 'LIVE MARCH 9–13, 2026',
    headline: "WORLD'S LARGEST ADHD PARENTING SUMMIT",
    subheadline: 'Become Empowered Parent In 5 Days',
    bodyLines: ['40+ Leading Experts', 'Covering focus, impulsivity, outbursts & screen management'],
    speakerCountLabel: '40+ Leading Experts',
    countdownTarget: '2026-03-09T00:00:00Z',
    primaryCtaLabel: 'GET INSTANT ACCESS',
    secondaryCtaLabel: 'Claim your FREE ticket',
    backgroundStyle: 'gradient',
  },
}
