import { z } from 'zod'

export const schema = z.object({
  headline: z.string().max(200).optional(),
  subheadline: z.string().max(400).optional(),
  fields: z
    .object({
      name: z.boolean().default(true),
      email: z.boolean().default(true),
    })
    .default({ name: true, email: true }),
  submitLabel: z.string().min(1).max(80).default('Secure My Free Ticket'),
  secondaryText: z.string().max(140).optional(),
  privacyText: z.string().max(600).optional(),
  backgroundStyle: z.enum(['light', 'dark', 'primary']).default('primary'),
})

export type Props = z.infer<typeof schema>
