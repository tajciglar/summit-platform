/**
 * TestimonialsBlock
 *
 * Social proof section displaying customer or attendee testimonials.
 * Each testimonial includes a quote, author name, optional role/company,
 * optional avatar image, and an optional star rating (1–5).
 *
 * Slug: `testimonials`
 */
import type { Block } from 'payload'

export const TestimonialsBlock: Block = {
  slug: 'testimonials',
  labels: {
    singular: 'Testimonials Section',
    plural: 'Testimonials Sections',
  },
  admin: {
    description: 'Social proof section with customer/attendee quote cards.',
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      label: 'Section Heading',
      admin: {
        description: 'Optional heading displayed above the testimonials (e.g. "What Attendees Are Saying").',
      },
    },
    {
      name: 'items',
      type: 'array',
      label: 'Testimonials',
      admin: {
        description: 'Individual testimonial cards.',
      },
      fields: [
        {
          name: 'quote',
          type: 'textarea',
          required: true,
          label: 'Quote',
          admin: {
            description: "The customer's verbatim testimonial text.",
          },
        },
        {
          name: 'author',
          type: 'text',
          required: true,
          label: 'Author Name',
          admin: {
            description: 'Full name of the person giving the testimonial.',
          },
        },
        {
          name: 'role',
          type: 'text',
          label: 'Role / Company',
          admin: {
            description: 'Job title or company to add credibility (e.g. "Yoga Instructor, Berlin").',
          },
        },
        {
          name: 'avatar',
          type: 'upload',
          relationTo: 'media',
          label: 'Avatar Photo',
          admin: {
            description: "Headshot photo of the reviewer. Recommended: 100×100 px square.",
          },
        },
        {
          name: 'rating',
          type: 'number',
          min: 1,
          max: 5,
          label: 'Star Rating',
          admin: {
            description: 'Star rating from 1 to 5. Leave blank to hide the rating display.',
          },
        },
      ],
    },
  ],
}
