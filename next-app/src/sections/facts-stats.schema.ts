import { z } from 'zod';

export const FactsStatsSchema = z.object({
  roman: z.string().min(1),
  headline: z.string().min(1),
  subhead: z.string().min(1),
  items: z.array(z.object({
    label: z.string().min(1),
    value: z.string().min(1),
    description: z.string().min(1),
  })).length(6),
});

export type FactsStatsContent = z.infer<typeof FactsStatsSchema>;
