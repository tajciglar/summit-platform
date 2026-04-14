import type { BlockMeta } from '@/types/block'

export const meta: BlockMeta = {
  type: 'TestimonialCarousel',
  category: 'social-proof',
  version: 1,
  validOn: ['optin', 'sales_page', 'checkout', 'upsell'],
  purpose: 'Rotating testimonial carousel with 3-30 customer/parent testimonials. Each slide: long-form quote, author name, optional role, optional photo, optional 1-5 star rating. Auto-advances by default (pause on hover). Use instead of TestimonialGrid when quotes are long and you want one to breathe at a time.',
  exampleProps: {
    eyebrow: 'From past attendees',
    headline: 'Parents who\u2019ve walked the path you\u2019re on',
    testimonials: [
      {
        quote: 'I stopped yelling at homework time within the first week. The morning-routine session alone was worth the entire summit — my 9-year-old now actually gets herself out the door.',
        authorName: 'Sarah M.',
        authorRole: 'Parent, two ADHD kids',
        rating: 5,
      },
      {
        quote: 'The emotional regulation day rewired how I respond to meltdowns. I was the parent adding fuel to the fire. I\u2019m not anymore.',
        authorName: 'David R.',
        authorRole: 'Dad of 8-year-old',
        rating: 5,
      },
      {
        quote: 'We\u2019d been to three \u201cparenting ADHD\u201d trainings before this one. This is the first one where every session was actually actionable that night.',
        authorName: 'Maya K.',
        authorRole: 'Mom + pediatric nurse',
        rating: 5,
      },
    ],
    autoplay: true,
    intervalMs: 6000,
  },
}
