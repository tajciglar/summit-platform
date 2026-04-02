/**
 * CustomBlock
 *
 * An escape-hatch block for injecting arbitrary HTML into a funnel page.
 * Useful for third-party embeds, custom JavaScript snippets, legacy
 * content, or any layout not covered by the standard block library.
 *
 * The `identifier` field is used by the front-end renderer to apply
 * component-specific logic or styling to a known embed type.
 *
 * Slug: `custom`
 *
 * SECURITY NOTE: Raw HTML output from this block must be sanitised or
 * sandboxed on the front-end to prevent XSS attacks.
 */
import type { Block } from 'payload'

export const CustomBlock: Block = {
  slug: 'custom',
  labels: {
    singular: 'Custom HTML Block',
    plural: 'Custom HTML Blocks',
  },
  admin: {
    description:
      'Escape hatch for raw HTML or third-party embed codes. Sanitise output on the front-end.',
  },
  fields: [
    {
      name: 'html',
      type: 'textarea',
      label: 'HTML / Embed Code',
      admin: {
        description:
          'Raw HTML, iframe embed, or JavaScript snippet. ' +
          'WARNING: This content is rendered as-is on the page — ensure it is trusted.',
        rows: 10,
      },
    },
    {
      name: 'identifier',
      type: 'text',
      label: 'Block Identifier',
      admin: {
        description:
          'Optional machine-readable key used by the front-end to apply special handling ' +
          '(e.g. "countdown-timer", "stripe-checkout-form").',
      },
    },
  ],
}
