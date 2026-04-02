/**
 * Analytics event layer for the Summit Platform funnel engine.
 *
 * All events push structured data to window.dataLayer for GTM to consume.
 * GTM is then configured (externally) to forward events to:
 * - Google Analytics 4 (enhanced ecommerce)
 * - Meta (Facebook) Pixel
 * - Microsoft Clarity
 * - ClickMagic postback
 *
 * Design principles:
 * - Zero dependencies (pure fetch to dataLayer)
 * - Always fire-and-forget, never block the user flow
 * - Never log or throw errors (analytics must not break funnels)
 * - Can be called from both Astro <script> tags and React islands
 */

import type { FunnelStepType } from '@summit/types'

// ─── Event Types ────────────────────────────────────────────────────────────

export interface AnalyticsItem {
  item_id: string
  item_name: string
  price: number
  quantity: number
}

export type FunnelAnalyticsEvent =
  | {
      event: 'funnel_step_view'
      step_type: FunnelStepType
      step_slug: string
      funnel_slug: string
      summit_id: string
    }
  | {
      event: 'optin_submit'
      email_hashed: string // SHA-256 of email — never send raw email to GTM
      summit_id: string
      utm_source?: string
      utm_medium?: string
      utm_campaign?: string
    }
  | {
      event: 'checkout_begin'
      product_ids: string[]
      value: number
      currency: string
      summit_id: string
    }
  | {
      event: 'order_bump_toggle'
      accepted: boolean
      bump_product_id: string
      bump_value: number
    }
  | {
      event: 'purchase'
      transaction_id: string
      value: number
      currency: string
      items: AnalyticsItem[]
      summit_id: string
    }
  | {
      event: 'upsell_view'
      product_id: string
      value: number
      currency: string
    }
  | {
      event: 'upsell_accept'
      product_id: string
      value: number
      currency: string
      transaction_id: string
    }
  | {
      event: 'upsell_decline'
      product_id: string
    }
  | {
      event: 'downsell_view'
      product_id: string
      value: number
      currency: string
    }
  | {
      event: 'downsell_accept'
      product_id: string
      value: number
      currency: string
      transaction_id: string
    }
  | {
      event: 'downsell_decline'
      product_id: string
    }

// ─── Core push function ─────────────────────────────────────────────────────

/**
 * Push a typed funnel analytics event to the GTM dataLayer.
 *
 * @example
 * trackFunnelEvent({ event: 'upsell_view', product_id: 'prod_abc', value: 47, currency: 'eur' })
 */
export function trackFunnelEvent(event: FunnelAnalyticsEvent): void {
  try {
    if (typeof window === 'undefined') return
    window.dataLayer = window.dataLayer ?? []
    window.dataLayer.push(event as unknown as Record<string, unknown>)
  } catch {
    // Silent — analytics must never break the funnel
  }
}

/**
 * Convenience wrapper for page-view style events.
 * Fires immediately on mount; suitable for use in a <script> tag.
 */
export function trackPageView(params: {
  summitId: string
  funnelSlug: string
  stepSlug: string
  stepType: FunnelStepType
}): void {
  trackFunnelEvent({
    event: 'funnel_step_view',
    step_type: params.stepType,
    step_slug: params.stepSlug,
    funnel_slug: params.funnelSlug,
    summit_id: params.summitId,
  })
}

/**
 * One-way hash an email address for privacy-safe analytics.
 * Uses the Web Crypto API (browser) or Node crypto (server).
 *
 * @returns Hex-encoded SHA-256 digest of the lowercase-trimmed email.
 */
export async function hashEmail(email: string): Promise<string> {
  const normalised = email.trim().toLowerCase()
  const encoded = new TextEncoder().encode(normalised)

  if (typeof window !== 'undefined' && window.crypto?.subtle) {
    // Browser
    const hash = await window.crypto.subtle.digest('SHA-256', encoded)
    return Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  } else {
    // Node.js
    const { createHash } = await import('crypto')
    return createHash('sha256').update(normalised).digest('hex')
  }
}
