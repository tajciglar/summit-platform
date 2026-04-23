'use client'
import { useCheckoutPrefill } from '@/lib/checkout-prefill-context'

const BASE_URL = process.env.NEXT_PUBLIC_FUNNELKIT_CHECKOUT_URL || ''

/**
 * Builds the WP/FunnelKit checkout URL with the buyer's email + first name
 * pre-filled as billing_* params. Values come from the server-issued prefill
 * context (populated via the encrypted ?p= token on the sales page) so they
 * never appear in the browser URL on the way in.
 */
export function useCheckoutUrl(): string {
  const { email, firstName } = useCheckoutPrefill()

  if (!BASE_URL) return '#'

  const url = new URL(BASE_URL)
  if (email) url.searchParams.set('billing_email', email)
  if (firstName) url.searchParams.set('billing_first_name', firstName)

  return url.toString()
}
