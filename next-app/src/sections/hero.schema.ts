import { z } from 'zod';
import { EventStatusSchema } from '../components/event-status';

export const HeroSchema = z.object({
  issueLabel: z.string().min(1),
  dateRangeLabel: z.string().min(1),
  metaLabel: z.string().min(1),
  readerCount: z.string().min(1),
  eyebrow: z.string().min(1),
  headline: z.string().min(3),
  subheadline: z.string().min(3),
  ctaLabel: z.string().min(1),
  ctaSubtext: z.string().min(1).optional(),
  ratingText: z.string().min(1),
  figCaption: z.string().min(1),
  heroSpeakerIds: z.array(z.string().uuid()).min(1).max(4),
  eventStatusLabel: z.string().optional(),  // computed by backend; overrides dateRangeLabel when present
  eventStatus: EventStatusSchema.optional(),
  liveLabel: z.string().min(1).optional(),
  endedLabel: z.string().min(1).optional(),
});

export type HeroContent = z.infer<typeof HeroSchema>;
