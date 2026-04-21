import { z } from 'zod';

/**
 * FreeGift — standalone free-gift callout for optin pages. Similar in
 * spirit to Supplement but tuned for simpler "register & get this bonus"
 * framing (no "issue" / "volume" book metaphor). Harvested from the
 * ADHD Parenting Summit optin page.
 *
 * Prefer Supplement when the aesthetic calls for an editorial / annual-reader
 * book metaphor; prefer FreeGift for broader "claim your bonus" use cases.
 */
export const FreeGiftSchema = z.object({
  eyebrow: z.string().min(1),                               // e.g. "Register Now & Get This Free"
  headline: z.string().min(1),
  body: z.string().min(1),
  bullets: z.array(z.string().min(1)).min(2).max(6),
  ctaLabel: z.string().min(1),
  badgeLabel: z.string().min(1),                            // e.g. "FREE GIFT"
  cardTitle: z.string().min(1),
  cardNote: z.string().min(1),                              // e.g. "FREE with registration"
});

export type FreeGiftContent = z.infer<typeof FreeGiftSchema>;
