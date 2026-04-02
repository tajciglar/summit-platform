/**
 * Orders Collection
 *
 * Immutable ledger of purchase transactions made through funnel checkout
 * pages. Orders are created server-side only (e.g. via Stripe webhooks or
 * server actions) and are never created through the admin UI or public API.
 *
 * Amounts are stored in the smallest currency unit (cents) to avoid
 * floating-point precision issues.
 *
 * Versioning is disabled to keep the orders table lean; timestamps are
 * enabled for audit purposes.
 *
 * Slug: `orders`
 * Access: admin read/write only (orders are created server-side)
 */
import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access/isAdmin'

export const Orders: CollectionConfig = {
  slug: 'orders',
  admin: {
    useAsTitle: 'orderNumber',
    defaultColumns: ['orderNumber', 'customerEmail', 'status', 'amountTotal', 'createdAt'],
    description: 'Purchase transactions. Created server-side via Stripe webhooks.',
  },
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  versions: false,
  fields: [
    // ── Order identity ────────────────────────────────────────────────────────
    {
      name: 'orderNumber',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      label: 'Order Number',
      admin: {
        description: 'Human-readable unique order reference (e.g. "ORD-2025-00001").',
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
        description: 'The summit site through which this order was placed.',
      },
    },

    // ── Customer ──────────────────────────────────────────────────────────────
    {
      name: 'customerName',
      type: 'text',
      required: true,
      label: 'Customer Name',
    },
    {
      name: 'customerEmail',
      type: 'email',
      required: true,
      index: true,
      label: 'Customer Email',
    },

    // ── Line items ────────────────────────────────────────────────────────────
    {
      name: 'items',
      type: 'array',
      label: 'Order Items',
      admin: {
        description: 'Snapshot of each product purchased. Prices stored in cents.',
      },
      fields: [
        {
          name: 'productSlug',
          type: 'text',
          required: true,
          label: 'Product Slug',
          admin: {
            description: 'Slug of the product at time of purchase (denormalized for audit safety).',
          },
        },
        {
          name: 'productName',
          type: 'text',
          required: true,
          label: 'Product Name',
          admin: {
            description: 'Name of the product at time of purchase (denormalized).',
          },
        },
        {
          name: 'price',
          type: 'number',
          required: true,
          label: 'Unit Price (cents)',
          admin: {
            description: 'Price in smallest currency unit (e.g. 9700 = €97.00).',
          },
        },
        {
          name: 'quantity',
          type: 'number',
          required: true,
          defaultValue: 1,
          label: 'Quantity',
        },
        {
          name: 'type',
          type: 'select',
          label: 'Item Type',
          options: [
            { label: 'One-Time', value: 'one_time' },
            { label: 'Subscription', value: 'subscription' },
            { label: 'Order Bump', value: 'bump' },
            { label: 'Upsell', value: 'upsell' },
            { label: 'Downsell', value: 'downsell' },
          ],
        },
      ],
    },

    // ── Financial summary ─────────────────────────────────────────────────────
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      label: 'Order Status',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Paid', value: 'paid' },
        { label: 'Refunded', value: 'refunded' },
        { label: 'Failed', value: 'failed' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Current lifecycle state of the order.',
      },
    },
    {
      name: 'amountTotal',
      type: 'number',
      required: true,
      label: 'Total Amount (cents)',
      admin: {
        position: 'sidebar',
        description: 'Total order amount in smallest currency unit (e.g. 9700 = €97.00).',
      },
    },
    {
      name: 'currency',
      type: 'text',
      defaultValue: 'eur',
      label: 'Currency',
      admin: {
        position: 'sidebar',
        description: 'ISO 4217 currency code, lowercase.',
      },
    },

    // ── Stripe ────────────────────────────────────────────────────────────────
    {
      name: 'stripePaymentIntentId',
      type: 'text',
      label: 'Stripe Payment Intent ID',
      admin: {
        description: 'Stripe PaymentIntent ID for one-time charges.',
      },
    },
    {
      name: 'stripeSessionId',
      type: 'text',
      label: 'Stripe Checkout Session ID',
      admin: {
        description: 'Stripe Checkout Session ID if the order originated from a hosted checkout.',
      },
    },

    // ── Funnel behaviour ──────────────────────────────────────────────────────
    {
      name: 'bumpAccepted',
      type: 'checkbox',
      label: 'Order Bump Accepted',
      defaultValue: false,
      admin: {
        description: 'Whether the customer accepted the order bump offer.',
      },
    },
    {
      name: 'upsellAccepted',
      type: 'checkbox',
      label: 'Upsell Accepted',
      defaultValue: false,
      admin: {
        description: 'Whether the customer accepted the post-purchase upsell offer.',
      },
    },

    // ── UTM attribution ───────────────────────────────────────────────────────
    {
      name: 'utmSource',
      type: 'text',
      label: 'UTM Source',
      admin: {
        description: 'Traffic source (e.g. "facebook", "google", "email").',
      },
    },
    {
      name: 'utmMedium',
      type: 'text',
      label: 'UTM Medium',
      admin: {
        description: 'Marketing medium (e.g. "cpc", "social", "banner").',
      },
    },
    {
      name: 'utmCampaign',
      type: 'text',
      label: 'UTM Campaign',
      admin: {
        description: 'Campaign name (e.g. "summer-launch-2025").',
      },
    },
    {
      name: 'utmContent',
      type: 'text',
      label: 'UTM Content',
      admin: {
        description: 'Ad creative or content variant identifier.',
      },
    },
    {
      name: 'utmTerm',
      type: 'text',
      label: 'UTM Term',
      admin: {
        description: 'Paid search keyword that triggered the ad.',
      },
    },
  ],
  timestamps: true,
}
