import type { BlockMeta } from '@/types/block'

export const meta: BlockMeta = {
  type: 'StatsBar3Item',
  category: 'social-proof',
  version: 1,
  validOn: ['optin', 'sales_page', 'checkout', 'upsell'],
  purpose: 'Three-column stats bar for summit highlights — "X days / Y speakers / Z attendees". Large value on top, short descriptor underneath, optional icon above each. Exactly 3 stats; use other blocks for longer numeric lists.',
  exampleProps: {
    stats: [
      { value: '5 DAYS', label: 'of transformative learning' },
      { value: '40+', label: 'World-class speakers' },
      { value: '50,000+', label: 'attendees expected' },
    ],
    backgroundColor: 'light',
  },
}
