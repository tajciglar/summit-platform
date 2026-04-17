import { z } from 'zod';

export const SupplementSchema = z.object({
  cardLabel: z.string().min(1),
  cardTitle: z.string().min(1),
  cardFooter: z.string().min(1),
  cardVolume: z.string().min(1),
  badgeLabel: z.string().min(1),
  eyebrow: z.string().min(1),
  headline: z.string().min(1),
  body: z.string().min(1),
  bullets: z.array(z.string().min(1)).min(2).max(6),
  ctaLabel: z.string().min(1),
});

export type SupplementContent = z.infer<typeof SupplementSchema>;
