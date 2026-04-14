import type { BlockMeta } from '@/types/block'

export const meta: BlockMeta = {
  type: 'FAQAccordion',
  category: 'content',
  version: 1,
  validOn: ['optin', 'sales_page', 'checkout', 'upsell', 'thank_you'],
  purpose: 'Expandable FAQ section with 1-30 Q&A pairs. Built on the shadcn Accordion primitive. Answers support paragraph breaks via blank lines. Keep answers under ~200 words; long answers signal the product isn\u2019t explaining itself earlier in the page.',
  exampleProps: {
    headline: 'Frequently Asked Questions',
    items: [
      { question: 'How much does it cost to attend?', answer: 'Attendance is completely free. We cover all speakers and platform costs; you can optionally purchase lifetime access to the recordings.' },
      { question: 'What if I can\u2019t watch live?', answer: 'Every session has a 24-hour replay window. If you miss it entirely, lifetime access (a paid upgrade) lets you watch on your schedule.' },
      { question: 'Do I need special equipment?', answer: 'Just a phone, tablet, or laptop with a browser. All sessions stream directly — no apps to install.' },
      { question: 'Will the speakers answer my questions?', answer: 'Yes. Every session ends with a live Q&A window, and we curate questions from attendees in real time.' },
      { question: 'Is this appropriate for parents of neurotypical kids?', answer: 'Most tools apply to any kid — ADHD is the lens, but the strategies around focus, regulation, and communication translate broadly.' },
    ],
  },
}
