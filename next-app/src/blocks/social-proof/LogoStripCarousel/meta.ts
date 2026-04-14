import type { BlockMeta } from '@/types/block'

export const meta: BlockMeta = {
  type: 'LogoStripCarousel',
  category: 'social-proof',
  version: 1,
  validOn: ['optin', 'sales_page', 'checkout', 'upsell', 'thank_you'],
  purpose: 'Horizontal logo strip for press/publication or partner mentions. Choose "scroll" for a continuous marquee when you have many logos (6+); choose "static" for a tight centered row with 3–6 logos. Logos render desaturated and lift to full color on hover.',
  exampleProps: {
    headline: 'As featured in',
    logos: [
      { name: 'The Atlantic', imageUrl: 'https://placehold.co/160x60/cccccc/333333.png?text=Atlantic' },
      { name: 'BBC', imageUrl: 'https://placehold.co/160x60/cccccc/333333.png?text=BBC' },
      { name: 'Forbes', imageUrl: 'https://placehold.co/160x60/cccccc/333333.png?text=Forbes' },
      { name: 'NYT', imageUrl: 'https://placehold.co/160x60/cccccc/333333.png?text=NYT' },
      { name: 'Time', imageUrl: 'https://placehold.co/160x60/cccccc/333333.png?text=Time' },
      { name: 'Guardian', imageUrl: 'https://placehold.co/160x60/cccccc/333333.png?text=Guardian' },
    ],
    animation: 'scroll',
  },
}
