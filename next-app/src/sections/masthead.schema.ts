import { z } from 'zod';

export const MastheadSchema = z.object({
  volume: z.string().min(1),
  eyebrow: z.string().min(1),
});

export type MastheadContent = z.infer<typeof MastheadSchema>;
