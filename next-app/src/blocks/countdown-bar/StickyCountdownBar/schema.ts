import { z } from 'zod';

export const schema = z.object({
  text: z.string().max(100).default('ADHD PARENTING SUMMIT 2026 STARTS IN'),
  countdownTarget: z.string().datetime(),
  ctaLabel: z.string().max(40).default('Claim Free Ticket'),
  ctaShowArrow: z.boolean().optional().default(true),
});

export type Props = z.infer<typeof schema>;
