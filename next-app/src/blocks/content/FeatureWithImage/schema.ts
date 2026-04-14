import { z } from 'zod'

export const schema = z.object({
  eyebrow: z.string().max(60).optional(),
  headline: z.string().min(1).max(140),
  bodyRich: z.string().min(1).max(2000),
  imageUrl: z.string().url(),
  imagePosition: z.enum(['left', 'right']).default('right'),
  ctaLabel: z.string().max(40).optional(),
  ctaUrl: z.string().min(1).max(500).optional(),
})

export type Props = z.infer<typeof schema>
