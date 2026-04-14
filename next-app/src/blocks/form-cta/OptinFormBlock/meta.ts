import type { BlockMeta } from '@/types/block'

export const meta: BlockMeta = {
  type: 'OptinFormBlock',
  category: 'form-cta',
  version: 1,
  validOn: ['optin'],
  purpose: 'Email + optional name optin form. Submits to Laravel POST /api/optin with the current funnel/step context. Required on any optin step — without this block, the page has no conversion mechanism. Three background styles for different page placements (hero-adjacent "primary", mid-page "light", bottom-of-page "dark").',
  exampleProps: {
    headline: 'Reserve your free seat',
    subheadline: 'We\u2019ll email you the schedule and day 1 session link.',
    fields: { name: true, email: true },
    submitLabel: 'Secure My Free Ticket',
    secondaryText: 'Grab your seat before the summit starts',
    privacyText: 'We\u2019ll send summit updates and occasional parenting resources. Unsubscribe anytime with one click.',
    backgroundStyle: 'primary',
  },
}
