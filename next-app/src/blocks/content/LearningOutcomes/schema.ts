import { z } from 'zod'

export const iconNames = ['heart', 'target', 'book', 'bolt', 'message', 'users'] as const

export const schema = z.object({
  headline: z.string().min(1).max(140),
  eyebrow: z.string().max(80).optional(),
  items: z
    .array(
      z.object({
        iconName: z.enum(iconNames),
        title: z.string().min(1).max(80),
        description: z.string().min(1).max(240),
      }),
    )
    .min(3)
    .max(9),
})

export type Props = z.infer<typeof schema>
