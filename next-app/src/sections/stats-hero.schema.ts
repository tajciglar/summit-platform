import { z } from 'zod';

export const StatsHeroSchema = z.object({
  statLabel1: z.string().min(1), statValue1: z.string().min(1),
  statLabel2: z.string().min(1), statValue2: z.string().min(1),
  statLabel3: z.string().min(1), statValue3: z.string().min(1),
});

export type StatsHeroContent = z.infer<typeof StatsHeroSchema>;
