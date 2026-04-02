/**
 * Media Collection
 *
 * Central media library for all summit sites. Handles image uploads with
 * automatic resizing to predefined sizes, as well as PDF and video uploads.
 *
 * Image sizes generated:
 * - `thumbnail` (300×300, cropped) — used in admin UI and speaker headshots
 * - `card` (768px wide, proportional height) — used in card/grid layouts
 * - `tablet` (1024px wide, proportional height) — used for mid-size breakpoints
 *
 * Slug: `media`
 * Access: public read, admin write
 */
import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access/isAdmin'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    useAsTitle: 'filename',
    defaultColumns: ['filename', 'mimeType', 'filesize', 'updatedAt'],
    description: 'Shared media library — images, PDFs, and videos used across all summit sites.',
  },
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  upload: {
    staticDir: 'public/media',
    staticURL: '/media',
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/*', 'application/pdf', 'video/*'],
    imageSizes: [
      {
        name: 'thumbnail',
        width: 300,
        height: 300,
        position: 'centre',
        formatOptions: {
          format: 'webp',
          options: {
            quality: 80,
          },
        },
      },
      {
        name: 'card',
        width: 768,
        height: undefined,
        position: 'centre',
        formatOptions: {
          format: 'webp',
          options: {
            quality: 82,
          },
        },
      },
      {
        name: 'tablet',
        width: 1024,
        height: undefined,
        position: 'centre',
        formatOptions: {
          format: 'webp',
          options: {
            quality: 85,
          },
        },
      },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Alt Text',
      admin: {
        description: 'Descriptive alt text for accessibility and SEO. Required for images.',
      },
    },
    {
      name: 'caption',
      type: 'text',
      label: 'Caption',
      admin: {
        description: 'Optional caption displayed beneath the media in certain contexts.',
      },
    },
  ],
  timestamps: true,
}
