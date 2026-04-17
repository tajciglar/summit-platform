import { z } from 'zod';

export const ClosingCtaSchema = z.object({
  eyebrow: z.string().min(1).optional(),
  headline: z.string().min(1),
  subheadline: z.string().min(1),
  ctaLabel: z.string().min(1),
  fineprint: z.string().min(1).optional(),
});

export type ClosingCtaContent = z.infer<typeof ClosingCtaSchema>;
