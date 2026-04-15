import { z } from 'zod'

export const schema = z.object({
  eyebrowLabel: z.string().max(80).optional(),
  headline: z.string().min(1).max(140),
  body: z.string().max(300),
  primaryCtaLabel: z.string().max(40).default('GET INSTANT ACCESS'),
  primaryCtaHref: z.string().url().default('#'),
  secondaryCtaLabel: z.string().max(40).optional(),
  secondaryCtaHref: z.string().url().optional(),
  footerStat: z.string().max(100),
  countdownTarget: z.string().datetime(),
  countdownEventDate: z.string().max(60),
  countdownLimitedSpotsLabel: z.string().max(40).optional(),
})

export type Props = z.infer<typeof schema>