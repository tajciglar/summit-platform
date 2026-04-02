/**
 * Lifecycle status of an order.
 * Source of truth is Supabase; the CMS Order collection is a lightweight mirror
 * used for admin visibility.
 */
export type OrderStatus = 'pending' | 'paid' | 'refunded' | 'failed'

/** Which part of the funnel generated this line item. */
export type OrderItemType = 'one_time' | 'subscription' | 'bump' | 'upsell' | 'downsell'

/** A single product line within an order. */
export interface OrderItem {
  productSlug: string
  productName: string
  /** Price in cents. */
  price: number
  quantity: number
  type: OrderItemType
}

/**
 * An order record.
 *
 * Primary storage: Supabase `orders` + `order_items` tables (see backend schema).
 * The CMS Order collection stores a reference copy for admin visibility.
 */
export interface Order {
  id: string
  /** Auto-generated human-readable order reference, e.g. "ORD-2025-00142". */
  orderNumber: string
  /** Slug of the summit that generated this order. */
  summitSiteId: string
  customerName: string
  customerEmail: string
  items: OrderItem[]
  status: OrderStatus
  /** Total charged amount in cents. */
  amountTotal: number
  /** ISO 4217 currency code, lowercase. */
  currency: string
  stripePaymentIntentId?: string | null
  stripeSessionId?: string | null
  bumpAccepted?: boolean
  upsellAccepted?: boolean
  utmSource?: string | null
  utmMedium?: string | null
  utmCampaign?: string | null
  utmContent?: string | null
  utmTerm?: string | null
  createdAt: string
  updatedAt: string
}
