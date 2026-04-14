import { z } from 'zod'

export const schema = z.object({
  headline: z.string().min(1).max(120),
  badgeText: z.string().max(60).optional(),
  badgeIconUrl: z.string().url().optional(),
  backgroundColor: z.enum(['light', 'accent', 'transparent']).default('light'),
})

export type Props = z.infer<typeof schema>
