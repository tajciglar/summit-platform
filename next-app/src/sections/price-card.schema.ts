import { z } from 'zod';

/**
 * PriceCard — the anchor section of a sales page. Product badge, features,
 * included-gifts box, price comparison (regular vs current + savings), CTA,
 * and guarantee fineprint.
 * Harvested from the APS VIP sales page.
 */
export const PriceCardSchema = z.object({
  badge: z.string().min(1),                                 // e.g. "ALL-ACCESS VIP PASS"
  headline: z.string().min(1),
  note: z.string().min(1),                                  // one-liner under headline
  features: z.array(z.string().min(1)).min(1).max(10),
  giftsBoxTitle: z.string().min(1),                         // e.g. "Included Free Gifts"
  giftItems: z.array(z.string().min(1)).min(1).max(6),
  totalValue: z.string().min(1),                            // e.g. "$2,970 Total Value"
  regularPrice: z.string().min(1),                          // strike-through anchor price
  currentPrice: z.string().min(1),                          // live offer price
  savings: z.string().min(1),                               // e.g. "Save $100"
  ctaLabel: z.string().min(1),
  guarantee: z.string().min(1),                             // fineprint under CTA
});

export type PriceCardContent = z.infer<typeof PriceCardSchema>;
