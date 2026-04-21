import { z } from 'zod';

/**
 * TrustBadges — compact strip of 2–6 trust signals (privacy, security,
 * quality markers) with icons. Lives near the hero or near the final CTA
 * to reassure visitors. Harvested from the ADHD Parenting Summit optin page.
 */
export const TrustBadgesSchema = z.object({
  items: z.array(z.object({
    label: z.string().min(1),
    icon: z.enum(['shield', 'lock', 'info', 'star']),
  })).min(2).max(6),
});

export type TrustBadgesContent = z.infer<typeof TrustBadgesSchema>;
