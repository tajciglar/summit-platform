import type { BlockMeta } from '@/types/block'

export const meta: BlockMeta = {
  type: 'SpeakerGridDay',
  category: 'speakers',
  version: 1,
  validOn: ['optin'],
  purpose: 'Speaker grid for a single day of the summit. Shows the day label, the day\u2019s theme, and 3-12 speaker cards (headshot, name, credentials, session title). If speakerIds is omitted, the block falls back to every speaker whose dayNumber matches — so AI/editors can just set the day and let content flow. Use once per day.',
  exampleProps: {
    day: 1,
    dayLabel: 'Day 1',
    theme: 'The Butterfly Mind',
    subtitle: 'Focus & attention strategies',
    expandable: true,
  },
}
