import { z } from 'zod'

export const schema = z.object({
  stats: z
    .array(
      z.object({
        value: z.string().min(1).max(20),
        label: z.string().min(1).max(60),
        iconUrl: z.string().url().optional(),
      }),
    )
    .length(3),
  backgroundColor: z.enum(['white', 'light', 'primary']).default('light'),
})

export type Props = z.infer<typeof schema>
