/**
 * HeroBlock
 *
 * Full-width hero section block for funnel landing pages.
 * Supports three layout variants: centered (text over image), split-left
 * (image on the right), and split-right (image on the left).
 *
 * Slug: `hero`
 */
import type { Block } from 'payload'

export const HeroBlock: Block = {
  slug: 'hero',
  labels: {
    singular: 'Hero Section',
    plural: 'Hero Sections',
  },
  admin: {
    description: 'Full-width hero section with heading, subheading, optional image, and CTA button.',
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      required: true,
      label: 'Heading',
      admin: {
        description: 'Primary headline displayed in large type.',
      },
    },
    {
      name: 'subheading',
      type: 'textarea',
      label: 'Subheading',
      admin: {
        description: 'Supporting text displayed beneath the headline.',
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: 'Hero Image',
      admin: {
        description: 'Background or supporting image. Recommended: 1920×1080 px for backgrounds.',
      },
    },
    {
      name: 'ctaText',
      type: 'text',
      label: 'CTA Button Text',
      admin: {
        description: 'Text displayed on the call-to-action button (e.g. "Get Instant Access").',
      },
    },
    {
      name: 'ctaUrl',
      type: 'text',
      label: 'CTA Button URL',
      admin: {
        description: 'Destination URL or anchor for the CTA button (e.g. "#checkout", "/order").',
      },
    },
    {
      name: 'layout',
      type: 'select',
      label: 'Layout Variant',
      defaultValue: 'centered',
      options: [
        { label: 'Centered (text centered over image)', value: 'centered' },
        { label: 'Split — Image Right', value: 'split-left' },
        { label: 'Split — Image Left', value: 'split-right' },
      ],
      admin: {
        description: 'Controls the visual arrangement of text and image within the hero block.',
      },
    },
  ],
}
