import { z } from 'zod';

export const SummitOverviewSchema = z.object({
  roman: z.string().min(1),
  headline: z.string().min(1),
  bodyParagraphs: z.array(z.string().min(1)).length(2),
  ctaLabel: z.string().min(1),
  featureBand: z.object({
    eyebrow: z.string().min(1),
    headline: z.string().min(1),
    body: z.string().min(1),
    bullets: z.array(z.string()).length(3),
  }),
});

export type SummitOverviewContent = z.infer<typeof SummitOverviewSchema>;
