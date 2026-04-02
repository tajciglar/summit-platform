/**
 * Speakers Collection
 *
 * Expert speakers and contributors featured across summit sites.
 * Each speaker is scoped to a specific summit site and can be displayed
 * on funnel pages via the SpeakersBlock.
 *
 * Slug: `speakers`
 * Access: public read, admin write
 */
import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access/isAdmin'

export const Speakers: CollectionConfig = {
  slug: 'speakers',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'title', 'summitSite', 'order', 'updatedAt'],
    description: 'Summit speakers and expert contributors displayed on funnel pages.',
  },
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Full Name',
      admin: {
        description: "Speaker's full display name.",
      },
    },
    {
      name: 'title',
      type: 'text',
      label: 'Professional Title / Credential',
      admin: {
        description: 'Job title or credential shown under the speaker\'s name (e.g. "PhD, Child Psychologist").',
      },
    },
    {
      name: 'bio',
      type: 'richText',
      label: 'Biography',
      admin: {
        description: "Speaker's biography shown in the speaker section.",
      },
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
      required: false,
      label: 'Headshot Photo',
      admin: {
        description: 'Headshot photo. Recommended: square crop, minimum 400×400 px.',
      },
    },
    {
      name: 'summitSite',
      type: 'relationship',
      relationTo: 'summit-sites',
      required: true,
      label: 'Summit Site',
      admin: {
        position: 'sidebar',
        description: 'The summit site this speaker is associated with.',
      },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      label: 'Display Order',
      admin: {
        position: 'sidebar',
        description: 'Controls the order speakers appear in listings (lower = first).',
      },
    },
  ],
  timestamps: true,
}
