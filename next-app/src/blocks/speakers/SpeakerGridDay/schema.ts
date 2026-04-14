import { z } from 'zod'

export const schema = z.object({
  day: z.number().int().min(1).max(10),
  dayLabel: z.string().min(1).max(30),
  theme: z.string().min(1).max(80),
  subtitle: z.string().max(140).optional(),
  speakerIds: z.array(z.string().uuid()).min(1).max(12).optional(),
  expandable: z.boolean().default(true),
})

export type Props = z.infer<typeof schema>
