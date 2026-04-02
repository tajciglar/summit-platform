import type { SEO } from './seo'
import type { Product } from './product'
import type { Section } from './sections'

/** Lifecycle state of a funnel. Only 'active' funnels are publicly accessible. */
export type FunnelStatus = 'draft' | 'active' | 'archived'

/**
 * The type of a funnel step — determines which Astro template is used and
 * which UI components (checkout form, upsell modal, etc.) are mounted.
 *
 * - landing   → Top-of-funnel opt-in / registration page
 * - checkout  → Stripe Elements payment form + optional order bump
 * - bump      → Order bump confirmation (if shown as a dedicated step)
 * - upsell    → One-click upsell offer (uses saved Stripe payment method)
 * - downsell  → Alternative lower-price offer shown after upsell decline
 * - thankyou  → Post-purchase confirmation + delivery page
 * - optin     → Email capture without payment
 */
export type FunnelStepType =
  | 'landing'
  | 'checkout'
  | 'bump'
  | 'upsell'
  | 'downsell'
  | 'thankyou'
  | 'optin'

/**
 * A single step within a funnel.
 * Steps are rendered by the Astro `[...funnel].astro` dynamic route.
 */
export interface FunnelStep {
  id: string
  title: string
  /** URL slug for this step, e.g. "checkout". Combined with funnel slug for routing. */
  slug: string
  type: FunnelStepType
  /** Ordering within the funnel — lower numbers render first in the flow. */
  order: number
  /** References an Astro layout/template by filename (without extension). */
  template?: string | null
  /** Products available for purchase on this step (checkout/upsell/downsell). */
  products?: Product[]
  seo?: SEO | null
  /** CMS-driven page sections rendered by the section block renderer. */
  sections: Section[]
  /** ID of the parent Funnel. */
  funnelId: string
  createdAt: string
  updatedAt: string
}

/**
 * A complete funnel — an ordered sequence of steps that a visitor navigates.
 * Scoped to a single summit.
 */
export interface Funnel {
  id: string
  name: string
  /** URL-safe slug, e.g. "spring-sale-2025". */
  slug: string
  /** ID of the parent SummitSite. */
  summitSiteId: string
  status: FunnelStatus
  /** Ordered array of steps. The frontend navigates these in order. */
  steps: FunnelStep[]
  createdAt: string
  updatedAt: string
}
