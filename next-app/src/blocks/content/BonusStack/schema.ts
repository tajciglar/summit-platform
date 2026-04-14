import { z } from 'zod'

export const schema = z.object({
  eyebrow: z.string().max(80).optional(),
  headline: z.string().min(1).max(200),
  introText: z.string().max(600).optional(),
  bonuses: z
    .array(
      z.object({
        title: z.string().min(1).max(140),
        description: z.string().min(1).max(400),
        valueLabel: z.string().max(40).optional(),
        imageUrl: z.string().url().optional(),
      }),
    )
    .min(1)
    .max(8),
  ctaLabel: z.string().max(40).default('GET INSTANT ACCESS'),
  ctaUrl: z.string().min(1).max(500).optional(),
})

export type Props = z.infer<typeof schema>
