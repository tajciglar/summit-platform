import type { BlockMeta } from '@/types/block'

export const meta: BlockMeta = {
  type: 'SocialProofBadge',
  category: 'social-proof',
  version: 1,
  validOn: ['optin', 'sales_page', 'checkout', 'thank_you'],
  purpose: 'Single-line social proof badge with an optional icon, a large highlight number/word, and a short descriptor. Place directly under the hero to establish trust via volume (e.g. "73,124 committed parents"). Keep the descriptor short and specific — generic praise ("trusted by thousands") reads as filler.',
  exampleProps: {
    headline: 'Loved by 73,124 committed parents',
    badgeText: '73,124',
    backgroundColor: 'light',
  },
}
