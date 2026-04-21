import { z } from 'zod';

export const EVENT_STATUSES = ['before', 'live', 'ended'] as const;

export const EventStatusSchema = z.enum(EVENT_STATUSES);

export type EventStatus = z.infer<typeof EventStatusSchema>;

export const DEFAULT_LIVE_LABEL = 'Summit Now Live';
export const DEFAULT_ENDED_LABEL = 'Event Ended';
