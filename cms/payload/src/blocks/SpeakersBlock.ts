/**
 * SpeakersBlock
 *
 * Displays a grid of summit speakers on a funnel page.
 * Can either show all speakers associated with the funnel's site
 * (via `displayAll: true`) or a manually curated subset.
 *
 * Slug: `speakers`
 */
import type { Block } from 'payload'

export const SpeakersBlock: Block = {
  slug: 'speakers',
  labels: {
    singular: 'Speakers Section',
    plural: 'Speakers Sections',
  },
  admin: {
    description: 'Grid of speaker cards. Choose to show all site speakers or a curated subset.',
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      label: 'Section Heading',
      admin: {
        description: 'Optional heading displayed above the speakers grid (e.g. "Meet Our Experts").',
      },
    },
    {
      name: 'subheading',
      type: 'textarea',
      label: 'Section Subheading',
      admin: {
        description: 'Optional supporting text below the heading.',
      },
    },
    {
      name: 'displayAll',
      type: 'checkbox',
      label: 'Display All Speakers',
      defaultValue: true,
      admin: {
        description:
          'When enabled, shows all speakers for the summit site ordered by their "order" field. ' +
          'Uncheck to manually select specific speakers.',
      },
    },
    {
      name: 'speakers',
      type: 'relationship',
      relationTo: 'speakers',
      hasMany: true,
      label: 'Selected Speakers',
      admin: {
        description: 'Manually pick specific speakers to feature. Only used when "Display All" is unchecked.',
        condition: (data) => data?.displayAll === false,
      },
    },
  ],
}
