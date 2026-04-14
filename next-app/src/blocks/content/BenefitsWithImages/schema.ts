import { z } from 'zod'

export const schema = z.object({
  eyebrow: z.string().max(80).optional(),
  headline: z.string().min(1).max(200),
  benefits: z
    .array(
      z.object({
        title: z.string().min(1).max(140),
        description: z.string().min(1).max(500),
        imageUrl: z.string().url(),
      }),
    )
    .min(2)
    .max(4),
})

export type Props = z.infer<typeof schema>
