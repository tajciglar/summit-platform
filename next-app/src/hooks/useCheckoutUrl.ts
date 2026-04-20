'use client'
import { useSearchParams } from 'next/navigation'

const BASE_URL = process.env.NEXT_PUBLIC_FUNNELKIT_CHECKOUT_URL || ''

export function useCheckoutUrl(): string {
  const params = useSearchParams()
  const email = params.get('email') ?? ''
  const firstName = params.get('first_name') ?? ''

  if (!BASE_URL) return '#'

  const url = new URL(BASE_URL)
  if (email) url.searchParams.set('billing_email', email)
  if (firstName) url.searchParams.set('billing_first_name', firstName)

  return url.toString()
}
