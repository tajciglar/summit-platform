import { z } from 'zod';

/**
 * ComparisonTable — side-by-side "Free vs VIP" (or "Basic vs Pro") table.
 * Each row is a feature; the two boolean columns say whether each plan
 * includes it. Harvested from the APS VIP sales page.
 */
export const ComparisonTableSchema = z.object({
  eyebrow: z.string().min(1),                               // e.g. "Free vs VIP"
  headline: z.string().min(1),
  rows: z.array(z.object({
    label: z.string().min(1),
    freePass: z.boolean(),                                  // check in "free" column
    vipPass: z.boolean(),                                   // check in "vip/paid" column
  })).min(1).max(12),
});

export type ComparisonTableContent = z.infer<typeof ComparisonTableSchema>;
