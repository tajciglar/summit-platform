/**
 * CTABlock
 *
 * A standalone call-to-action section with a primary heading,
 * supporting subheading, and a single action button. Useful for
 * mid-page conversion nudges and end-of-page purchase prompts.
 *
 * Slug: `cta`
 */
import type { Block } from 'payload'

export const CTABlock: Block = {
  slug: 'cta',
  labels: {
    singular: 'Call to Action Section',
    plural: 'Call to Action Sections',
  },
  admin: {
    description: 'Conversion-focused section with headline, subheadline, and a single button.',
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      required: true,
      label: 'Heading',
      admin: {
        description: 'Primary CTA headline (e.g. "Ready to Transform Your Health?").',
      },
    },
    {
      name: 'subheading',
      type: 'textarea',
      label: 'Subheading',
      admin: {
        description: 'Supporting text beneath the heading.',
      },
    },
    {
      name: 'buttonText',
      type: 'text',
      label: 'Button Label',
      admin: {
        description: 'Text on the action button (e.g. "Yes! I Want Instant Access").',
      },
    },
    {
      name: 'buttonUrl',
      type: 'text',
      label: 'Button URL',
      admin: {
        description: 'Destination for the button (e.g. "#checkout", "/order").',
      },
    },
    {
      name: 'layout',
      type: 'select',
      label: 'Layout',
      defaultValue: 'centered',
      options: [
        { label: 'Centered', value: 'centered' },
        { label: 'Left-aligned', value: 'left' },
        { label: 'Right-aligned', value: 'right' },
      ],
      admin: {
        description: 'Text and button alignment within the section.',
      },
    },
  ],
}
