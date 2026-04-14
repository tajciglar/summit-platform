import type { BlockMeta } from '@/types/block'

export const meta: BlockMeta = {
  type: 'Footer',
  category: 'utility',
  version: 1,
  validOn: ['optin', 'sales_page', 'checkout', 'upsell', 'downsell', 'thank_you'],
  purpose: 'Page footer with logo, tagline, up to 10 legal/policy links, copyright, and an optional summit-dates reminder line. Goes on every funnel page. Links accept full URLs or anchors/paths — no schema enforcement so the footer can link to in-page sections as well as privacy/terms pages.',
  exampleProps: {
    tagline: 'Parent-built tools for raising kids with ADHD, ages 4-16.',
    links: [
      { label: 'Privacy Policy', url: '/privacy' },
      { label: 'Terms of Use', url: '/terms' },
      { label: 'Contact', url: 'mailto:hello@example.com' },
      { label: 'Speakers', url: '#speakers' },
    ],
    copyrightText: '\u00A9 2026 Althea Academy. All rights reserved.',
    summitDatesText: 'Free Virtual Event, MARCH 9-13, 2026',
  },
}
