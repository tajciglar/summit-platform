import type { BlockMeta } from '@/types/block'

export const meta: BlockMeta = {
  type: 'WhyThisMattersStats',
  category: 'content',
  version: 1,
  validOn: ['optin', 'sales_page'],
  purpose: 'Problem-framing statistics grid for "why this matters" sections — 3-8 scary/motivating stats with icon, big number/phrase, and a short explanatory label. Use before a solution pitch; pairs well after the hero.',
  exampleProps: {
    eyebrow: 'Why this matters now',
    headline: 'ADHD in kids is not a phase — it\u2019s a quiet epidemic',
    introText: 'The numbers most parents don\u2019t see until they\u2019re already in the middle of it.',
    stats: [
      { iconName: 'users', bigText: '1 in 7', label: 'U.S. children have been diagnosed with ADHD by age 17.' },
      { iconName: 'trending-down', bigText: '3x', label: 'Higher risk of anxiety and depression in untreated kids with ADHD.' },
      { iconName: 'book-x', bigText: '40%', label: 'Of kids with ADHD will be held back at least one grade.' },
      { iconName: 'heart-pulse', bigText: '80%', label: 'Of parents report significant marital stress over ADHD parenting.' },
    ],
  },
}
