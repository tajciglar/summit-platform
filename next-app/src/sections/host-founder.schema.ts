import { z } from 'zod';

export const HostFounderSchema = z.object({
  roman: z.string().min(1),
  headline: z.string().min(1),
  items: z.array(z.object({
    name: z.string().min(1),
    role: z.string().min(1),
    quote: z.string().min(1),
    initials: z.string().min(1).max(4),
  })).length(2),
});

export type HostFounderContent = z.infer<typeof HostFounderSchema>;
