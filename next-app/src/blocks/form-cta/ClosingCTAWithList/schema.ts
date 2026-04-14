import { z } from 'zod'

export const schema = z.object({
  eyebrow: z.string().max(80).optional(),
  headline: z.string().min(1).max(200),
  bodyText: z.string().max(600).optional(),
  bullets: z.array(z.string().min(1).max(140)).min(2).max(10),
  ctaLabel: z.string().max(40).default('GET INSTANT ACCESS'),
  ctaUrl: z.string().min(1).max(500).optional(),
  background: z.enum(['light', 'primary', 'gradient']).default('gradient'),
})

export type Props = z.infer<typeof schema>
