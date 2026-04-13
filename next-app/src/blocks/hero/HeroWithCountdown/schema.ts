import { z } from 'zod'

export const schema = z.object({
  eyebrow: z.string().max(80).optional(),
  headline: z.string().min(1).max(140),
  subheadline: z.string().max(300).optional(),
  bodyLines: z.array(z.string().max(140)).max(6).default([]),
  speakerCountLabel: z.string().max(60).default('40+ Leading Experts'),
  countdownTarget: z.string().datetime(),
  primaryCtaLabel: z.string().max(40).default('GET INSTANT ACCESS'),
  secondaryCtaLabel: z.string().max(40).optional(),
  bannerImageUrl: z.string().url().optional(),
  backgroundStyle: z.enum(['gradient', 'image', 'solid']).default('gradient'),
})

export type Props = z.infer<typeof schema>
