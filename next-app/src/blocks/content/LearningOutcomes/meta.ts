import type { BlockMeta } from '@/types/block'

export const meta: BlockMeta = {
  type: 'LearningOutcomes',
  category: 'content',
  version: 1,
  validOn: ['optin', 'sales_page'],
  purpose: 'Icon grid of 3-9 learning outcomes or key benefits. Each item: icon (from a fixed lucide set — heart/target/book/bolt/message/users), short title, 1-2 sentence description. Use after the hero to answer "what will I get out of this?" in scannable form.',
  exampleProps: {
    eyebrow: 'What you\u2019ll learn',
    headline: 'Five days of practical, science-backed parenting tools',
    items: [
      { iconName: 'target', title: 'Focus & Attention', description: 'Strategies that actually work for the butterfly mind.' },
      { iconName: 'heart', title: 'Emotional Regulation', description: 'How to handle meltdowns, shutdowns, and big feelings.' },
      { iconName: 'book', title: 'Executive Function', description: 'Planning, prioritizing, and getting started — without the fight.' },
      { iconName: 'bolt', title: 'Impulsivity', description: 'Tools for the 10-seconds-before-a-bad-decision window.' },
      { iconName: 'message', title: 'Communication', description: 'Language that lands instead of lectures that don\u2019t.' },
      { iconName: 'users', title: 'Screen Management', description: 'Reset the family relationship with devices, without World War III.' },
    ],
  },
}
