import { z } from 'zod'

export const schema = z.object({
  eyebrow: z.string().max(80).optional(),
  headline: z.string().min(1).max(200),
  reasons: z
    .array(
      z.object({
        title: z.string().min(1).max(160),
        description: z.string().max(400).optional(),
      }),
    )
    .min(3)
    .max(7),
  ctaLabel: z.string().max(40).optional(),
  ctaUrl: z.string().min(1).max(500).optional(),
})

export type Props = z.infer<typeof schema>
