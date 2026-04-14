import type { BlockMeta } from '@/types/block'

export const meta: BlockMeta = {
  type: 'FeatureWithImage',
  category: 'content',
  version: 1,
  validOn: ['optin', 'sales_page', 'checkout', 'upsell'],
  purpose: 'Two-column feature section — headline + body + supporting image. Image flips to left or right per imagePosition. Use for "What is this summit?" or "About the offer" explanations. Body supports line breaks via blank lines; plain text only (no markdown rendering yet).',
  exampleProps: {
    headline: 'What is ADHD Parenting Summit 2026?',
    bodyRich:
      'A reframed approach — 5 days instead of 3, 40+ experts, deeper understanding of your ADHD child.\n\nFrom diagnosis to daily routines, you\u2019ll leave with tools that actually work at home.',
    imageUrl: 'https://placehold.co/800x600/5e4d9b/ffffff.png',
    imagePosition: 'right',
    ctaLabel: 'GET INSTANT ACCESS',
    ctaUrl: '#register',
  },
}
