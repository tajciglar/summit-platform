/**
 * FeaturesBlock
 *
 * A grid/list of feature highlights, benefits, or what-you-get items.
 * Each feature item can have an icon identifier, a title, and a
 * description. Commonly used on landing pages to communicate value.
 *
 * Slug: `features`
 */
import type { Block } from 'payload'

export const FeaturesBlock: Block = {
  slug: 'features',
  labels: {
    singular: 'Features Section',
    plural: 'Features Sections',
  },
  admin: {
    description: 'Grid of feature/benefit items, each with an icon, title, and description.',
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      label: 'Section Heading',
      admin: {
        description: 'Optional heading displayed above the features grid.',
      },
    },
    {
      name: 'items',
      type: 'array',
      label: 'Feature Items',
      admin: {
        description: 'Individual feature or benefit cards shown in the grid.',
      },
      fields: [
        {
          name: 'icon',
          type: 'text',
          label: 'Icon',
          admin: {
            description:
              'Icon identifier string (e.g. a Lucide icon name like "check-circle" or a custom class name).',
          },
        },
        {
          name: 'title',
          type: 'text',
          required: true,
          label: 'Feature Title',
          admin: {
            description: 'Short, scannable feature name (e.g. "Lifetime Access").',
          },
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Feature Description',
          admin: {
            description: 'One to three sentences elaborating on this feature.',
          },
        },
      ],
    },
  ],
}
