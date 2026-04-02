/**
 * FunnelSteps Collection
 *
 * Represents a single page/step within a funnel (landing page, checkout,
 * upsell, downsell, etc.). Each step has a `type` that determines its
 * role in the conversion flow, an `order` for sequencing, and a `sections`
 * blocks field that drives the visual page layout.
 *
 * Slug: `funnel-steps`
 * Access: public read, admin write
 */
import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access/isAdmin'
import { slugField } from '../fields/slugField'
import { seoGroup } from '../fields/seo'
import { HeroBlock } from '../blocks/HeroBlock'
import { FeaturesBlock } from '../blocks/FeaturesBlock'
import { TestimonialsBlock } from '../blocks/TestimonialsBlock'
import { VideoBlock } from '../blocks/VideoBlock'
import { CTABlock } from '../blocks/CTABlock'
import { SpeakersBlock } from '../blocks/SpeakersBlock'
import { CustomBlock } from '../blocks/CustomBlock'

export const FunnelSteps: CollectionConfig = {
  slug: 'funnel-steps',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'type', 'order', 'funnel', 'updatedAt'],
    description: 'Individual pages/steps within a funnel (landing, checkout, upsell, etc.).',
  },
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Step Title',
      admin: {
        description: 'Internal label for this step (e.g. "Main Landing Page", "Order Form").',
      },
    },
    slugField('title'),
    {
      name: 'type',
      type: 'select',
      required: true,
      label: 'Step Type',
      options: [
        { label: 'Landing Page', value: 'landing' },
        { label: 'Checkout / Order Form', value: 'checkout' },
        { label: 'Order Bump', value: 'bump' },
        { label: 'Upsell (OTO)', value: 'upsell' },
        { label: 'Downsell', value: 'downsell' },
        { label: 'Thank You', value: 'thankyou' },
        { label: 'Opt-In', value: 'optin' },
      ],
      admin: {
        description: 'Determines the role this step plays in the conversion funnel.',
        position: 'sidebar',
      },
    },
    {
      name: 'order',
      type: 'number',
      required: true,
      defaultValue: 0,
      label: 'Display Order',
      admin: {
        description: 'Numeric position of this step within the funnel (lower = earlier).',
        position: 'sidebar',
      },
    },
    {
      name: 'template',
      type: 'text',
      label: 'Template Override',
      admin: {
        position: 'sidebar',
        description: 'Optional template identifier to use for rendering this step (overrides default).',
      },
    },
    {
      name: 'funnel',
      type: 'relationship',
      relationTo: 'funnels',
      required: true,
      label: 'Parent Funnel',
      admin: {
        position: 'sidebar',
        description: 'The funnel this step belongs to.',
      },
    },
    {
      name: 'products',
      type: 'relationship',
      relationTo: 'products',
      hasMany: true,
      label: 'Associated Products',
      admin: {
        description: 'Products offered on this step (e.g. the main offer, order bump, or upsell product).',
      },
    },

    // ── SEO ───────────────────────────────────────────────────────────────────
    seoGroup(),

    // ── Page sections (blocks) ────────────────────────────────────────────────
    {
      name: 'sections',
      type: 'blocks',
      label: 'Page Sections',
      blocks: [
        HeroBlock,
        FeaturesBlock,
        TestimonialsBlock,
        VideoBlock,
        CTABlock,
        SpeakersBlock,
        CustomBlock,
      ],
      admin: {
        description: 'Drag-and-drop page builder blocks that compose the visual layout of this step.',
      },
    },
  ],
  timestamps: true,
}
