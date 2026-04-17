import { z } from 'zod';

export const ValuePropSchema = z.object({
  roman: z.string().min(1),
  headline: z.string().min(1),
  subhead: z.string().min(1),
  items: z.array(z.object({
    title: z.string().min(1),
    description: z.string().min(1),
  })).length(6),
});

export type ValuePropContent = z.infer<typeof ValuePropSchema>;
