import { z } from 'zod'

export const iconNames = [
  'star',
  'globe',
  'clock',
  'trending-up',
  'check-circle',
  'sparkles',
  'award',
] as const

export const schema = z.object({
  eyebrow: z.string().max(80).optional(),
  headline: z.string().min(1).max(200),
  benefits: z
    .array(
      z.object({
        iconName: z.enum(iconNames),
        title: z.string().min(1).max(120),
        description: z.string().min(1).max(300),
      }),
    )
    .min(3)
    .max(8),
  ctaLabel: z.string().max(40).optional(),
  ctaUrl: z.string().min(1).max(500).optional(),
})

export type Props = z.infer<typeof schema>
