import { z } from 'zod'

export const iconNames = [
  'alert',
  'trending-down',
  'users',
  'heart-pulse',
  'book-x',
  'pill',
] as const

export const schema = z.object({
  eyebrow: z.string().max(80).optional(),
  headline: z.string().min(1).max(200),
  introText: z.string().max(600).optional(),
  stats: z
    .array(
      z.object({
        iconName: z.enum(iconNames),
        bigText: z.string().min(1).max(60),
        label: z.string().min(1).max(240),
      }),
    )
    .min(3)
    .max(8),
})

export type Props = z.infer<typeof schema>
