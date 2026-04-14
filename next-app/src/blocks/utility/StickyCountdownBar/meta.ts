import type { BlockMeta } from '@/types/block'

export const meta: BlockMeta = {
  type: 'StickyCountdownBar',
  category: 'utility',
  version: 1,
  validOn: ['optin', 'sales_page', 'checkout'],
  purpose: 'Fixed, full-width bar pinned to the top or bottom of the viewport with a short urgency message, live countdown, and a single CTA. Use on time-sensitive summit pages to keep the deadline visible while visitors scroll. Auto-hides after the target when hideWhenExpired is true.',
  exampleProps: {
    message: 'Summit starts in',
    countdownTarget: '2026-03-09T00:00:00Z',
    ctaLabel: 'Claim Free Ticket',
    ctaUrl: '#register',
    hideWhenExpired: true,
    position: 'top',
    variant: 'gradient',
  },
}
