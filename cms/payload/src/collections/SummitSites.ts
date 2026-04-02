/**
 * SummitSites Collection
 *
 * Represents individual summit/event micro-sites within the platform.
 * Each summit site has its own branding, domain, navigation menus, and
 * global SEO defaults. All content (funnels, products, speakers) is
 * scoped to a specific summit site.
 *
 * Slug: `summit-sites`
 * Access: public read, admin write
 */
import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access/isAdmin'
import { slugField } from '../fields/slugField'

export const SummitSites: CollectionConfig = {
  slug: 'summit-sites',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'domain', 'updatedAt'],
    description: 'Individual summit micro-sites with their own branding and domain configuration.',
  },
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    // ── Core identity ─────────────────────────────────────────────────────────
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Site Name',
      admin: {
        description: 'Human-readable name for this summit site (e.g. "Wellness Summit 2025").',
      },
    },
    slugField('name'),
    {
      name: 'domain',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      label: 'Domain',
      admin: {
        description: 'The domain or subdomain this site is served on (e.g. "wellnesssummit.com").',
      },
    },

    // ── Media ─────────────────────────────────────────────────────────────────
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      required: false,
      label: 'Logo',
      admin: {
        description: 'Primary logo displayed in the site header.',
      },
    },
    {
      name: 'favicon',
      type: 'upload',
      relationTo: 'media',
      required: false,
      label: 'Favicon',
      admin: {
        description: 'Browser tab icon. Recommended: 32×32 or 64×64 PNG/ICO.',
      },
    },

    // ── Brand ─────────────────────────────────────────────────────────────────
    {
      name: 'brand',
      type: 'group',
      label: 'Brand Settings',
      admin: {
        description: 'Visual identity tokens used across all funnel pages for this site.',
      },
      fields: [
        {
          name: 'primaryColor',
          type: 'text',
          required: true,
          defaultValue: '#3B82F6',
          label: 'Primary Color',
          admin: {
            description: 'Hex code for the primary brand color (e.g. "#3B82F6").',
          },
        },
        {
          name: 'secondaryColor',
          type: 'text',
          required: true,
          defaultValue: '#1E40AF',
          label: 'Secondary Color',
          admin: {
            description: 'Hex code for the secondary/accent brand color (e.g. "#1E40AF").',
          },
        },
        {
          name: 'fontHeading',
          type: 'text',
          required: true,
          defaultValue: 'Inter',
          label: 'Heading Font',
          admin: {
            description: 'Google Font family name for headings (e.g. "Inter", "Playfair Display").',
          },
        },
        {
          name: 'fontBody',
          type: 'text',
          required: true,
          defaultValue: 'Inter',
          label: 'Body Font',
          admin: {
            description: 'Google Font family name for body text (e.g. "Inter", "Lato").',
          },
        },
      ],
    },

    // ── Global SEO ────────────────────────────────────────────────────────────
    {
      name: 'globalSEO',
      type: 'group',
      label: 'Global SEO Defaults',
      admin: {
        description: 'Default SEO metadata used when individual pages have no overrides.',
      },
      fields: [
        {
          name: 'defaultTitle',
          type: 'text',
          label: 'Default Title',
          admin: {
            description: 'Fallback meta title for pages without a specific SEO title.',
          },
        },
        {
          name: 'defaultDescription',
          type: 'textarea',
          label: 'Default Description',
          admin: {
            description: 'Fallback meta description for pages without a specific SEO description.',
          },
        },
        {
          name: 'globalNoindex',
          type: 'checkbox',
          label: 'Disable Indexing Site-wide',
          defaultValue: false,
          admin: {
            description: 'When enabled, adds noindex to all pages on this site regardless of page-level settings.',
          },
        },
      ],
    },

    // ── Navigation ────────────────────────────────────────────────────────────
    {
      name: 'menus',
      type: 'array',
      label: 'Navigation Menu Items',
      admin: {
        description: 'Ordered list of navigation links displayed in the site header/footer.',
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
          label: 'Link Label',
        },
        {
          name: 'url',
          type: 'text',
          required: true,
          label: 'URL',
          admin: {
            description: 'Absolute URL or relative path (e.g. "/about" or "https://external.com").',
          },
        },
        {
          name: 'openInNewTab',
          type: 'checkbox',
          label: 'Open in New Tab',
          defaultValue: false,
        },
      ],
    },
  ],
  timestamps: true,
}
