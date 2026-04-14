import { z } from 'zod'

export const schema = z.object({
  eyebrow: z.string().max(80).optional(),
  headline: z.string().min(1).max(140),
  bodyRich: z.string().min(1).max(2000),
  founders: z
    .array(
      z.object({
        name: z.string().min(1).max(80),
        title: z.string().max(120).optional(),
        photoUrl: z.string().url(),
      }),
    )
    .min(1)
    .max(4),
  ctaLabel: z.string().max(40).optional(),
  ctaUrl: z.string().min(1).max(500).optional(),
})

export type Props = z.infer<typeof schema>
