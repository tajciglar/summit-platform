import { z } from 'zod'

export const schema = z.object({
  headline: z.string().max(120).default('As featured in'),
  logos: z
    .array(
      z.object({
        name: z.string().min(1).max(60),
        imageUrl: z.string().url(),
        websiteUrl: z.string().url().optional(),
      }),
    )
    .min(3)
    .max(30),
  animation: z.enum(['scroll', 'static']).default('scroll'),
})

export type Props = z.infer<typeof schema>
