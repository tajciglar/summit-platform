import type { BlockMeta } from '@/types/block'

export const meta: BlockMeta = {
  type: 'NumberedReasons',
  category: 'content',
  version: 1,
  validOn: ['optin', 'sales_page', 'upsell'],
  purpose: '3-7 reasons in a numbered list with large display numerals beside each title + optional description. Classic "5 Reasons Why" format. Use when the reasons are worth reading in order rather than scanning as a grid.',
  exampleProps: {
    eyebrow: '5 reasons parents return year after year',
    headline: 'Why this summit keeps landing',
    reasons: [
      { title: 'Every session is practical, not theoretical', description: 'You leave each day with something you can try at dinner tonight.' },
      { title: 'Speakers answer live questions', description: 'Every expert does a live Q&A window so you can ask about your specific kid.' },
      { title: 'Built around real parent schedules', description: '24-hour replay on every session so bedtime doesn\u2019t beat you.' },
      { title: 'Speakers who see kids, not just citations', description: 'Every presenter runs an active practice. Research + real families.' },
      { title: 'Free to attend, free to keep the core sessions' },
    ],
  },
}
