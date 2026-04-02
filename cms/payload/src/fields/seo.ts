/**
 * Reusable SEO fields for Payload CMS collections.
 *
 * Provides a consistent SEO metadata structure that can be added to any
 * collection as either a flat field list or a named group field.
 */
import type { Field } from 'payload'

/**
 * Individual SEO fields:
 * - `title`: The page's meta title tag content.
 * - `description`: The page's meta description content.
 * - `noindex`: When true, instructs search engines not to index the page.
 */
export const seoFields: Field[] = [
  {
    name: 'title',
    type: 'text',
    label: 'SEO Title',
    admin: {
      description: 'Overrides the default page title in search engine results. Recommended: 50–60 characters.',
    },
  },
  {
    name: 'description',
    type: 'textarea',
    label: 'SEO Description',
    admin: {
      description: 'Summary shown in search engine results. Recommended: 150–160 characters.',
    },
  },
  {
    name: 'noindex',
    type: 'checkbox',
    label: 'No Index',
    defaultValue: false,
    admin: {
      description: 'When checked, instructs search engines not to index this page.',
    },
  },
]

/**
 * Creates a named SEO group field that wraps the standard SEO fields.
 *
 * @param overrides - Optional partial field config to merge into the group definition.
 * @returns A Payload `group` field named `seo` containing all SEO sub-fields.
 *
 * @example
 * // In a collection:
 * fields: [
 *   seoGroup(),
 *   seoGroup({ name: 'pageSeo', label: 'Page SEO' }),
 * ]
 */
export const seoGroup = (overrides?: Partial<Field>): Field => ({
  name: 'seo',
  type: 'group',
  label: 'SEO',
  fields: seoFields,
  ...overrides,
})
