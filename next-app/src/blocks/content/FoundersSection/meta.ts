import type { BlockMeta } from '@/types/block'

export const meta: BlockMeta = {
  type: 'FoundersSection',
  category: 'content',
  version: 1,
  validOn: ['optin', 'sales_page'],
  purpose: 'About-the-organizers section — 1-4 founder headshots on one side, mission-statement body copy + optional CTA on the other. Use to put a human face on the event before asking for registration. Keep body under ~120 words; readers skim this.',
  exampleProps: {
    eyebrow: 'About the hosts',
    headline: 'Built by parents, for parents',
    bodyRich:
      'We ran our first summit in 2022 because we were drowning — two kids with ADHD, zero sleep, and no clear playbook. What we found was that the right experts, in the right order, could change everything.\n\nThis year\u2019s summit is the fifth iteration. Every session earned its spot.',
    founders: [
      { name: 'Jane Organizer', title: 'Co-founder, former teacher', photoUrl: 'https://placehold.co/400x400/5e4d9b/ffffff.png?text=JO' },
      { name: 'Alex Organizer', title: 'Co-founder, parent coach', photoUrl: 'https://placehold.co/400x400/00b553/ffffff.png?text=AO' },
    ],
    ctaLabel: 'Join us for Summit 2026',
    ctaUrl: '#register',
  },
}
