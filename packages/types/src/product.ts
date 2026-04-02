/**
 * How the product is billed.
 * - one_time: Single payment
 * - subscription: Recurring (see billingInterval)
 * - bundle: Collection of products (may include digital files)
 */
export type ProductType = 'one_time' | 'subscription' | 'bundle'

/** Recurring billing cycle for subscription products. */
export type BillingInterval = 'monthly' | 'yearly'

/**
 * A file (PDF, video) stored in Bunny CDN and associated with a product.
 * Delivered via signed URL after purchase.
 */
export interface ProductFile {
  /** Bunny CDN path or full URL — will be converted to signed URL at delivery time. */
  url: string
  label?: string | null
  type?: 'pdf' | 'video' | 'other'
}

/**
 * A purchasable product — maps to a Stripe Product + Price.
 * Scoped to a single summit.
 */
export interface Product {
  id: string
  name: string
  slug: string
  description?: string | null
  /** ID of the parent SummitSite. */
  summitSiteId: string
  type: ProductType
  /** Price in major currency units (e.g. 97.00 for €97). */
  price: number
  /** ISO 4217 currency code, lowercase (e.g. "eur", "usd"). */
  currency: string
  /** Stripe Product ID (prod_xxx). */
  stripeProductId?: string | null
  /** Stripe Price ID (price_xxx). */
  stripePriceId?: string | null
  /** Only set for subscription products. */
  billingInterval?: BillingInterval | null
  /** Number of free trial days before first charge (subscriptions only). */
  trialDays?: number | null
  /** Digital deliverables — PDFs and videos via Bunny CDN. */
  files?: ProductFile[]
  /** ActiveCampaign tag applied on optin (lead magnet tag). */
  acTag?: string | null
  /** ActiveCampaign tag applied on purchase (customer tag). */
  acProductTag?: string | null
  createdAt: string
  updatedAt: string
}
