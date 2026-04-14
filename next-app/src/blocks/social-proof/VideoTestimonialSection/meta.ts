import type { BlockMeta } from '@/types/block'

export const meta: BlockMeta = {
  type: 'VideoTestimonialSection',
  category: 'social-proof',
  version: 1,
  validOn: ['optin', 'sales_page', 'upsell'],
  purpose: 'Embedded video testimonials — 1-6 YouTube/Vimeo embeds with title + optional speaker name. Use "single" for one prominent video; "grid" for a 2-column gallery of shorter clips. embedUrl must be the iframe embed URL (https://www.youtube.com/embed/ID or https://player.vimeo.com/video/ID), not the share URL.',
  exampleProps: {
    headline: 'What past attendees are saying',
    subheadline: 'Real parents, real results after applying what they learned.',
    videos: [
      { embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', title: 'I finally stopped yelling at homework time', speakerName: 'Sarah, mom of 2' },
      { embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', title: 'The morning routine that saved us', speakerName: 'David, dad of 1' },
    ],
    layout: 'grid',
  },
}
