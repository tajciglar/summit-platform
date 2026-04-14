import { z } from 'zod'

export const schema = z.object({
  logoUrl: z.string().url().optional(),
  tagline: z.string().max(200).optional(),
  links: z
    .array(
      z.object({
        label: z.string().min(1).max(60),
        url: z.string().min(1).max(500),
      }),
    )
    .max(10)
    .default([]),
  copyrightText: z.string().max(200).default('© 2026 All rights reserved.'),
  summitDatesText: z.string().max(140).optional(),
})

export type Props = z.infer<typeof schema>
