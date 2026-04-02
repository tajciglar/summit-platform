/**
 * Products Collection
 *
 * Represents purchasable products offered across funnel steps.
 * Products can be one-time purchases, recurring subscriptions, or bundles.
 * Each product is tied to a summit site and may carry Stripe integration
 * fields for payment processing and ActiveCampaign tags for automation.
 *
 * Slug: `products`
 * Access: public read, admin write
 */
import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access/isAdmin'
import { slugField } from '../fields/slugField'

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'type', 'price', 'currency', 'summitSite', 'updatedAt'],
    description: 'Purchasable products (one-time, subscription, or bundle) sold through funnels.',
  },
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    // ── Core ──────────────────────────────────────────────────────────────────
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Product Name',
    },
    slugField('name'),
    {
      name: 'description',
      type: 'richText',
      label: 'Description',
      admin: {
        description: 'Full product description displayed on funnel pages.',
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
        description: 'The summit site that sells this product.',
      },
    },

    // ── Pricing ───────────────────────────────────────────────────────────────
    {
      name: 'type',
      type: 'select',
      required: true,
      label: 'Product Type',
      options: [
        { label: 'One-Time Purchase', value: 'one_time' },
        { label: 'Subscription', value: 'subscription' },
        { label: 'Bundle', value: 'bundle' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Determines the billing model for this product.',
      },
    },
    {
      name: 'price',
      type: 'number',
      required: true,
      min: 0,
      label: 'Price',
      admin: {
        position: 'sidebar',
        description: 'Price in the major currency unit (e.g. 97 = €97). Stored in full units, not cents.',
      },
    },
    {
      name: 'currency',
      type: 'text',
      required: true,
      defaultValue: 'eur',
      label: 'Currency',
      admin: {
        position: 'sidebar',
        description: 'ISO 4217 currency code, lowercase (e.g. "eur", "usd").',
      },
    },

    // ── Stripe ────────────────────────────────────────────────────────────────
    {
      name: 'stripeProductId',
      type: 'text',
      label: 'Stripe Product ID',
      admin: {
        description: 'Stripe product ID (e.g. "prod_xxxxxxxxxxxx").',
      },
    },
    {
      name: 'stripePriceId',
      type: 'text',
      label: 'Stripe Price ID',
      admin: {
        description: 'Stripe price ID (e.g. "price_xxxxxxxxxxxx").',
      },
    },

    // ── Subscription options ───────────────────────────────────────────────────
    {
      name: 'billingInterval',
      type: 'select',
      required: false,
      label: 'Billing Interval',
      options: [
        { label: 'Monthly', value: 'monthly' },
        { label: 'Yearly', value: 'yearly' },
      ],
      admin: {
        description: 'Billing frequency for subscription products. Leave blank for one-time products.',
        condition: (data) => data?.type === 'subscription',
      },
    },
    {
      name: 'trialDays',
      type: 'number',
      min: 0,
      label: 'Trial Days',
      admin: {
        description: 'Number of free trial days before the first charge. 0 or blank = no trial.',
        condition: (data) => data?.type === 'subscription',
      },
    },

    // ── Deliverables ─────────────────────────────────────────────────────────
    {
      name: 'files',
      type: 'array',
      label: 'Digital Deliverables',
      admin: {
        description: 'Files delivered to the customer after purchase.',
      },
      fields: [
        {
          name: 'url',
          type: 'text',
          required: true,
          label: 'File URL',
          admin: {
            description: 'Direct download URL or CDN URL for the file.',
          },
        },
        {
          name: 'label',
          type: 'text',
          label: 'File Label',
          admin: {
            description: 'Human-readable file name shown to the customer.',
          },
        },
        {
          name: 'type',
          type: 'select',
          label: 'File Type',
          options: [
            { label: 'PDF', value: 'pdf' },
            { label: 'Video', value: 'video' },
            { label: 'Other', value: 'other' },
          ],
        },
      ],
    },

    // ── ActiveCampaign ────────────────────────────────────────────────────────
    {
      name: 'acTag',
      type: 'text',
      label: 'ActiveCampaign Tag',
      admin: {
        description: 'Tag applied in ActiveCampaign when this product is purchased.',
      },
    },
    {
      name: 'acProductTag',
      type: 'text',
      label: 'ActiveCampaign Product Tag',
      admin: {
        description: 'Secondary/product-specific tag applied in ActiveCampaign on purchase.',
      },
    },
  ],
  timestamps: true,
}
