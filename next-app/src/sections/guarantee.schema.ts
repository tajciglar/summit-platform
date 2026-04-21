import { z } from 'zod';

/**
 * Guarantee — standalone money-back-guarantee block with a duration.
 * Use on sales pages right before (or after) the price card to reduce
 * purchase friction. Harvested from the APS VIP sales page.
 */
export const GuaranteeSchema = z.object({
  heading: z.string().min(1),                               // e.g. "30-Day Money-Back Guarantee"
  body: z.string().min(1),                                  // the promise text
  days: z.number().int().min(1),                            // used to render the big "30" badge
});

export type GuaranteeContent = z.infer<typeof GuaranteeSchema>;
