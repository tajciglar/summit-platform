import { z } from 'zod';

export const TestimonialsAttendeesSchema = z.object({
  roman: z.string().min(1),
  headline: z.string().min(1),
  subhead: z.string().min(1),
  items: z.array(z.object({
    quote: z.string().min(1),
    name: z.string().min(1),
    location: z.string().min(1),
    initials: z.string().min(1).max(4),
  })).length(3),
});

export type TestimonialsAttendeesContent = z.infer<typeof TestimonialsAttendeesSchema>;
