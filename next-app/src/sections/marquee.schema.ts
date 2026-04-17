import { z } from 'zod';

export const MarqueeSchema = z.object({
  items: z.array(z.string().min(1)).min(3).max(20),
});

export type MarqueeContent = z.infer<typeof MarqueeSchema>;
