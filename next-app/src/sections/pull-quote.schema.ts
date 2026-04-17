import { z } from 'zod';

export const PullQuoteSchema = z.object({
  quote: z.string().min(1),
  attribution: z.string().min(1),
});

export type PullQuoteContent = z.infer<typeof PullQuoteSchema>;
