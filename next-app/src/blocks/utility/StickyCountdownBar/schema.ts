import { z } from 'zod'

export const schema = z.object({
  message: z.string().min(1).max(120),
  countdownTarget: z.string().datetime(),
  ctaLabel: z.string().min(1).max(40),
  ctaUrl: z.string().min(1).max(500).optional(),
  hideWhenExpired: z.boolean().default(true),
  position: z.enum(['top', 'bottom']).default('top'),
  variant: z.enum(['solid', 'gradient']).default('gradient'),
})

export type Props = z.infer<typeof schema>
