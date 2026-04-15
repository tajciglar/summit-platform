import type { BlockMeta } from '@/types/block';

export const meta: BlockMeta = {
  type: 'StickyCountdownBar',
  category: 'utility',
  version: 1,
  validOn: ['optin'],
  purpose: 'A sticky, full-width bar at the top of the page with a live countdown and a primary CTA. Creates urgency and keeps the call-to-action visible as the user scrolls.',
  exampleProps: {
    text: 'ADHD PARENTING SUMMIT 2026 STARTS IN',
    countdownTarget: '2026-03-09T00:00:00Z',
    ctaLabel: 'Claim Free Ticket',
    ctaShowArrow: true,
  },
};
