import { z } from 'zod';

export const BonusStackSchema = z.object({
  roman: z.string().min(1),
  headline: z.string().min(1),
  subhead: z.string().min(1),
  ctaLabel: z.string().min(1),
  items: z.array(z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    valueLabel: z.string().min(1),
    bullets: z.array(z.string().min(1)).min(1).max(5).optional(),
  })).min(1).max(5),
});

export type BonusStackContent = z.infer<typeof BonusStackSchema>;
