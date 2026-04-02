/**
 * Reusable slug field factory for Payload CMS collections.
 *
 * Generates a URL-safe slug field with an automatic `beforeValidate` hook
 * that derives the slug value from a specified source field when no value
 * has been provided manually.
 */
import type { Field } from 'payload'

/**
 * Creates a `slug` field that auto-generates its value from another field.
 *
 * Slug generation rules:
 * - Lowercases the source string.
 * - Replaces any sequence of non-alphanumeric characters with a hyphen.
 * - Strips leading and trailing hyphens.
 *
 * If a slug is manually provided, the hook will not overwrite it.
 *
 * @param sourceField - The name of the field to derive the slug from.
 *   Defaults to `'name'`.
 * @returns A Payload `text` field configured as a unique, required slug.
 *
 * @example
 * // Auto-generate from the `name` field (default):
 * fields: [slugField()]
 *
 * // Auto-generate from the `title` field:
 * fields: [slugField('title')]
 */
export const slugField = (sourceField: string = 'name'): Field => ({
  name: 'slug',
  type: 'text',
  required: true,
  unique: true,
  index: true,
  admin: {
    position: 'sidebar',
    description: 'Auto-generated from the title. Can be edited manually.',
  },
  hooks: {
    beforeValidate: [
      ({ value, data }) => {
        // Only auto-generate if no slug has been provided yet
        if (!value && data?.[sourceField]) {
          return (data[sourceField] as string)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
        }
        return value
      },
    ],
  },
})
