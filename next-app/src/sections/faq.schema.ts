import { z } from 'zod';

export const FaqSchema = z.object({
  items: z.array(z.object({
    question: z.string().min(1),
    answer: z.string().min(1),
  })).min(3).max(10),
});

export type FaqContent = z.infer<typeof FaqSchema>;
