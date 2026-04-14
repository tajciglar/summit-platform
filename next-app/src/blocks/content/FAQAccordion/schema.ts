import { z } from 'zod'

export const schema = z.object({
  headline: z.string().min(1).max(140).default('Frequently Asked Questions'),
  eyebrow: z.string().max(80).optional(),
  items: z
    .array(
      z.object({
        question: z.string().min(1).max(200),
        answer: z.string().min(1).max(1500),
      }),
    )
    .min(1)
    .max(30),
})

export type Props = z.infer<typeof schema>
