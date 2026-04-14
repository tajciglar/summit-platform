import { z } from 'zod'

export const schema = z.object({
  headline: z.string().min(1).max(200),
  subheadline: z.string().max(400).optional(),
  videos: z
    .array(
      z.object({
        embedUrl: z.string().url(),
        title: z.string().min(1).max(120),
        speakerName: z.string().max(80).optional(),
      }),
    )
    .min(1)
    .max(6),
  layout: z.enum(['single', 'grid']).default('grid'),
})

export type Props = z.infer<typeof schema>
