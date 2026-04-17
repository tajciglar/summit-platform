import { z } from 'zod';

export const FooterSchema = z.object({
  tagline: z.string().min(1),
  volume: z.string().min(1),
  copyright: z.string().min(1),
});

export type FooterContent = z.infer<typeof FooterSchema>;
