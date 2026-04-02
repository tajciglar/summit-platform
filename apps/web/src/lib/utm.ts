/**
 * UTM parameter capture and threading utilities.
 *
 * UTMs are captured once on first page load (in BaseLayout.astro's inline
 * <script>) and stored in sessionStorage. This implements first-touch
 * attribution — UTMs are never overwritten once written.
 *
 * React islands and API routes read UTMs via getStoredUTMs() and include
 * them in order creation and ActiveCampaign contact sync calls.
 */

export interface UTMParams {
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
}

/** sessionStorage keys used across the funnel session. */
export const SESSION_KEYS = {
  UTMS: 'summit_utms',
  PAYMENT_INTENT_ID: 'summit_payment_intent_id',
  STRIPE_CUSTOMER_ID: 'summit_stripe_customer_id',
  ORDER_ID: 'summit_order_id',
} as const

/**
 * Capture UTM parameters from the current URL and persist to sessionStorage.
 * Safe to call multiple times — only writes if no UTMs are already stored.
 *
 * Must be called from a browser context (use in a <script> tag, not server-side).
 */
export function captureUTMs(): void {
  if (typeof window === 'undefined') return

  try {
    const existing = sessionStorage.getItem(SESSION_KEYS.UTMS)
    const stored: UTMParams = existing ? (JSON.parse(existing) as UTMParams) : {}

    // First-touch attribution: never overwrite existing UTMs
    if (stored.utm_source) return

    const params = new URLSearchParams(window.location.search)
    const utms: UTMParams = {}
    const keys: Array<keyof UTMParams> = [
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_content',
      'utm_term',
    ]

    for (const key of keys) {
      const val = params.get(key)
      if (val) utms[key] = val
    }

    if (Object.keys(utms).length > 0) {
      sessionStorage.setItem(SESSION_KEYS.UTMS, JSON.stringify(utms))
    }
  } catch {
    // Silent failure — UTM capture must never break the page
  }
}

/**
 * Read stored UTM parameters from sessionStorage.
 * Returns an empty object if nothing is stored or if running server-side.
 */
export function getStoredUTMs(): UTMParams {
  if (typeof window === 'undefined') return {}

  try {
    const raw = sessionStorage.getItem(SESSION_KEYS.UTMS)
    return raw ? (JSON.parse(raw) as UTMParams) : {}
  } catch {
    return {}
  }
}

/**
 * Generic sessionStorage getter with SSR guard.
 * @returns The stored string value, or null if not found or SSR.
 */
export function getSessionValue(key: string): string | null {
  if (typeof window === 'undefined') return null
  try {
    return sessionStorage.getItem(key)
  } catch {
    return null
  }
}

/**
 * Generic sessionStorage setter with SSR guard.
 */
export function setSessionValue(key: string, value: string): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(key, value)
  } catch {
    // Quota exceeded or private browsing — silent failure
  }
}

/**
 * Clear all summit-specific session data.
 * Call after successful order completion to reset for next visit.
 */
export function clearSummitSession(): void {
  if (typeof window === 'undefined') return
  try {
    Object.values(SESSION_KEYS).forEach((key) => sessionStorage.removeItem(key))
  } catch {
    // Silent failure
  }
}
