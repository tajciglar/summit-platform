import type { BlockMeta } from '@/types/block'

export const meta: BlockMeta = {
  type: 'BenefitsGrid',
  category: 'content',
  version: 1,
  validOn: ['optin', 'sales_page', 'upsell'],
  purpose: 'Lighter-weight benefits grid — 3-8 icon+title+description items with no card chrome. Similar to LearningOutcomes but uses accent-colored inline icons and flows into the page background instead of boxed cards. Prefer for "Why attend" or "What makes this different" sections on sales/upsell pages.',
  exampleProps: {
    eyebrow: 'Why attend',
    headline: 'Four reasons this summit is unlike any you\u2019ve joined before',
    benefits: [
      { iconName: 'award', title: 'Practitioners, not performers', description: 'Every speaker works with families every week. No career keynote-circuit people.' },
      { iconName: 'clock', title: 'Watch on your schedule', description: '24-hour replay windows per day so bedtime doesn\u2019t beat you.' },
      { iconName: 'globe', title: 'Fully virtual, globally free', description: 'Join from wherever, on whatever. No travel, no hotels, no registration fee.' },
      { iconName: 'sparkles', title: 'Curated, not kitchen-sink', description: 'No filler panels. Every session earned its place.' },
    ],
  },
}
