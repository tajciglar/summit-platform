import { z } from 'zod';

export const ReasonsToAttendSchema = z.object({
  roman: z.string().min(1),
  headline: z.string().min(1),
  items: z.array(z.object({
    title: z.string().min(1),
    description: z.string().min(1),
  })).length(5),
});

export type ReasonsToAttendContent = z.infer<typeof ReasonsToAttendSchema>;
