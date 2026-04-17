import { z } from 'zod';

export const SpeakersByDaySchema = z.object({
  days: z.array(z.object({
    dayLabel: z.string().min(1),
    dayDate: z.string().date(),
    dayTheme: z.string().min(1).optional(),
    roman: z.string().min(1).optional(),
    speakerIds: z.array(z.string().uuid()),
  })).min(1),
});

export type SpeakersByDayContent = z.infer<typeof SpeakersByDaySchema>;
