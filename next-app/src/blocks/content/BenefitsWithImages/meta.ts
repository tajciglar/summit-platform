import type { BlockMeta } from '@/types/block'

export const meta: BlockMeta = {
  type: 'BenefitsWithImages',
  category: 'content',
  version: 1,
  validOn: ['optin', 'sales_page'],
  purpose: 'Longer-form benefits section — 2-4 benefits alternating left/right, each with a supporting lifestyle/scenario image. Use when individual benefits deserve more breathing room than a tight grid (50-100 words of copy per benefit).',
  exampleProps: {
    eyebrow: 'What you\u2019ll walk away with',
    headline: 'Real tools, not theory',
    benefits: [
      {
        title: 'A morning routine that survives the school run',
        description: 'Step-by-step morning templates built around what actually works with ADHD kids — visual timers, choice-based transitions, and zero nagging. Printable and kid-tested.',
        imageUrl: 'https://placehold.co/800x600/5e4d9b/ffffff.png?text=Morning+Routine',
      },
      {
        title: 'Conversations that land instead of lectures that don\u2019t',
        description: 'Specific language patterns for the top 10 flashpoints (homework, screens, bedtime, sibling conflicts) so you stop repeating yourself and they start hearing you.',
        imageUrl: 'https://placehold.co/800x600/00b553/ffffff.png?text=Conversations',
      },
      {
        title: 'A calm-down toolkit you can actually pull out mid-meltdown',
        description: 'Three concrete techniques (co-regulation, sensory breaks, name-it-to-tame-it) that work in the heat of the moment. Not just theory — scripts included.',
        imageUrl: 'https://placehold.co/800x600/302070/ffffff.png?text=Calm+Down',
      },
    ],
  },
}
