import type { BlockMeta } from '@/types/block'

export const meta: BlockMeta = {
  type: 'BonusStack',
  category: 'content',
  version: 1,
  validOn: ['optin', 'sales_page', 'checkout'],
  purpose: 'Bonus offer stack — 1-8 exclusive bonuses with title, description, optional value chip ("($19 value)"), and optional image. Classic "Register today and also receive..." section. Ends with a single CTA. Use before checkout to stack perceived value.',
  exampleProps: {
    eyebrow: 'Register today and also get',
    headline: 'Four exclusive bonuses — only when you register by the start of the summit',
    introText: 'These are included with every ticket and disappear when the summit goes live.',
    bonuses: [
      { title: 'Parenting Playbook PDF', description: '120-page actionable guide distilling the summit\u2019s key strategies by age group.', valueLabel: '($29 value)' },
      { title: 'Live Q&A with Day 1 Speakers', description: 'Join speakers live for an open Q&A on focus and attention strategies.', valueLabel: '($49 value)' },
      { title: 'Private Community Access', description: '90 days in a moderated community of 1,000+ parents working through the same tools.', valueLabel: '($99 value)' },
      { title: 'Morning Routine Templates', description: 'Printable morning routine boards designed specifically for ADHD kids.', valueLabel: '($19 value)' },
    ],
    ctaLabel: 'GET INSTANT ACCESS',
    ctaUrl: '#register',
  },
}
