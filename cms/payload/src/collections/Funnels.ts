/**
 * Funnels Collection
 *
 * Represents a complete sales/marketing funnel belonging to a summit site.
 * Each funnel contains an ordered sequence of FunnelSteps (landing pages,
 * checkout pages, upsells, etc.). Funnels have a lifecycle status of
 * draft → active → archived.
 *
 * Slug: `funnels`
 * Access: public read for active funnels, admin write
 */
import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access/isAdmin'
import { slugField } from '../fields/slugField'

export const Funnels: CollectionConfig = {
  slug: 'funnels',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'summitSite', 'status', 'updatedAt'],
    description: 'Sales and marketing funnels composed of ordered funnel steps.',
  },
  access: {
    /**
     * Public read: unauthenticated visitors may read active funnels.
     * Authenticated users (admins) can read all regardless of status.
     */
    read: ({ req: { user } }) => {
      if (user) return true
      return { status: { equals: 'active' } }
    },
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Funnel Name',
      admin: {
        description: 'Internal name for this funnel (e.g. "Main Launch Funnel Q1 2025").',
      },
    },
    slugField('name'),
    {
      name: 'summitSite',
      type: 'relationship',
      relationTo: 'summit-sites',
      required: true,
      label: 'Summit Site',
      admin: {
        description: 'The summit site this funnel belongs to.',
        position: 'sidebar',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      label: 'Status',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Active', value: 'active' },
        { label: 'Archived', value: 'archived' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Only "active" funnels are publicly accessible.',
      },
    },
    {
      name: 'steps',
      type: 'relationship',
      relationTo: 'funnel-steps',
      hasMany: true,
      label: 'Funnel Steps',
      admin: {
        description: 'Ordered list of steps in this funnel. Steps are ordered by their "order" field.',
      },
    },
  ],
  timestamps: true,
}
