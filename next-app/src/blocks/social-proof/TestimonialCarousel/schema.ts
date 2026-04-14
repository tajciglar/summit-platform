import { z } from 'zod'

export const schema = z.object({
  headline: z.string().max(140).optional(),
  eyebrow: z.string().max(80).optional(),
  testimonials: z
    .array(
      z.object({
        quote: z.string().min(1).max(600),
        authorName: z.string().min(1).max(80),
        authorRole: z.string().max(120).optional(),
        authorPhotoUrl: z.string().url().optional(),
        rating: z.number().int().min(1).max(5).optional(),
      }),
    )
    .min(3)
    .max(30),
  autoplay: z.boolean().default(true),
  intervalMs: z.number().int().min(2000).max(20000).default(6000),
})

export type Props = z.infer<typeof schema>
