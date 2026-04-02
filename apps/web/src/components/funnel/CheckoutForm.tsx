import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import type { StripeElementsOptions } from '@stripe/stripe-js'
import type { Product } from '@summit/types'
import { OrderBump } from './OrderBump'
import { trackFunnelEvent } from '~/lib/analytics'
import { getStoredUTMs, setSessionValue } from '~/lib/utm'

// ─── Stripe singleton ─────────────────────────────────────────────────────────

const stripePromise = loadStripe(import.meta.env.PUBLIC_STRIPE_KEY as string)

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CheckoutFormProps {
  products: Product[]
  bumpProduct?: Product | null
  summitId: string
  nextStepUrl: string
  currency?: string
}

interface PaymentIntentResult {
  clientSecret: string
  paymentIntentId: string
  amountCents: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPrice(amountCents: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amountCents / 100)
}

const spinKeyframes = `
@keyframes cf-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes cf-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
`

function Spinner({ size = 20 }: { size?: number }) {
  return (
    <>
      <style>{spinKeyframes}</style>
      <svg
        aria-hidden="true"
        width={size}
        height={size}
        viewBox="0 0 20 20"
        fill="none"
        style={{ animation: 'cf-spin 0.75s linear infinite', flexShrink: 0 }}
      >
        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeOpacity="0.3" strokeWidth="2.5" />
        <path d="M18 10a8 8 0 0 0-8-8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    </>
  )
}

function SkeletonBlock({ width = '100%', height = '2.5rem' }: { width?: string; height?: string }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: '0.375rem',
        background: '#e5e7eb',
        animation: 'cf-pulse 1.5s ease-in-out infinite',
      }}
    />
  )
}

function LoadingSkeleton() {
  return (
    <>
      <style>{spinKeyframes}</style>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <SkeletonBlock height="1.5rem" width="40%" />
        <SkeletonBlock />
        <SkeletonBlock />
        <SkeletonBlock height="10rem" />
        <SkeletonBlock height="3rem" />
      </div>
    </>
  )
}

// ─── Inner form (must be a child of <Elements>) ───────────────────────────────

interface InnerFormProps {
  products: Product[]
  bumpProduct?: Product | null
  summitId: string
  nextStepUrl: string
  currency: string
  paymentIntentId: string
  amountCents: number
}

function InnerCheckoutForm({
  products,
  bumpProduct,
  summitId,
  nextStepUrl,
  currency,
  paymentIntentId,
  amountCents: initialAmountCents,
}: InnerFormProps) {
  const stripe = useStripe()
  const elements = useElements()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [bumpChecked, setBumpChecked] = useState(false)
  const [amountCents, setAmountCents] = useState(initialAmountCents)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [nameError, setNameError] = useState<string | null>(null)
  const [emailError, setEmailError] = useState<string | null>(null)

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  function validateFields(): boolean {
    let valid = true
    if (!name.trim()) {
      setNameError('Full name is required.')
      valid = false
    } else {
      setNameError(null)
    }
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setEmailError('A valid email address is required.')
      valid = false
    } else {
      setEmailError(null)
    }
    return valid
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!stripe || !elements) return
    if (!validateFields()) return

    setSubmitting(true)
    setError(null)

    try {
      const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
        confirmParams: {
          payment_method_data: {
            billing_details: {
              name: name.trim(),
              email: email.trim(),
            },
          },
        },
      })

      if (stripeError) {
        setError(stripeError.message ?? 'Payment failed. Please try again.')
        setSubmitting(false)
        return
      }

      // Payment succeeded — confirm order server-side
      await fetch('/api/confirm-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentIntentId,
          customerEmail: email.trim(),
          customerName: name.trim(),
          summitId,
          utms: getStoredUTMs(),
          items: products.map((p) => ({
            productSlug: p.slug,
            productName: p.name,
            price: Math.round(p.price * 100),
            quantity: 1,
            type: p.type,
          })),
        }),
      })

      trackFunnelEvent({
        event: 'purchase',
        transaction_id: paymentIntent?.id ?? paymentIntentId,
        value: amountCents / 100,
        currency: currency.toLowerCase(),
        items: products.map((p) => ({
          item_id: p.id,
          item_name: p.name,
          price: p.price,
          quantity: 1,
        })),
        summit_id: summitId,
      })

      window.location.href = nextStepUrl
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.')
      setSubmitting(false)
    }
  }

  function handleBumpChange(checked: boolean, newAmountCents: number) {
    setBumpChecked(checked)
    setAmountCents(newAmountCents)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.625rem 0.875rem',
    fontSize: '1rem',
    fontFamily: 'var(--font-body, inherit)',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s ease',
    background: '#ffffff',
  }

  const inputErrorStyle: React.CSSProperties = {
    ...inputStyle,
    borderColor: '#dc2626',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontFamily: 'var(--font-body, inherit)',
    fontSize: '0.875rem',
    fontWeight: 600,
    marginBottom: '0.375rem',
    color: 'inherit',
  }

  const fieldStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
  }

  const fieldErrorStyle: React.CSSProperties = {
    fontSize: '0.8125rem',
    color: '#dc2626',
    marginTop: '0.25rem',
    fontFamily: 'var(--font-body, inherit)',
  }

  return (
    <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Name */}
      <div style={fieldStyle}>
        <label htmlFor="checkout-name" style={labelStyle}>
          Full Name <span aria-hidden="true" style={{ color: '#dc2626' }}>*</span>
        </label>
        <input
          id="checkout-name"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(e) => { setName(e.target.value); setNameError(null) }}
          required
          aria-required="true"
          aria-describedby={nameError ? 'checkout-name-error' : undefined}
          aria-invalid={!!nameError}
          placeholder="Jane Smith"
          style={nameError ? inputErrorStyle : inputStyle}
        />
        {nameError && (
          <span id="checkout-name-error" role="alert" style={fieldErrorStyle}>
            {nameError}
          </span>
        )}
      </div>

      {/* Email */}
      <div style={fieldStyle}>
        <label htmlFor="checkout-email" style={labelStyle}>
          Email Address <span aria-hidden="true" style={{ color: '#dc2626' }}>*</span>
        </label>
        <input
          id="checkout-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setEmailError(null) }}
          required
          aria-required="true"
          aria-describedby={emailError ? 'checkout-email-error' : undefined}
          aria-invalid={!!emailError}
          placeholder="jane@example.com"
          style={emailError ? inputErrorStyle : inputStyle}
        />
        {emailError && (
          <span id="checkout-email-error" role="alert" style={fieldErrorStyle}>
            {emailError}
          </span>
        )}
      </div>

      {/* Stripe PaymentElement */}
      <div>
        <p style={{ ...labelStyle, marginBottom: '0.75rem' }}>Payment Details</p>
        <PaymentElement
          options={{
            layout: 'tabs',
            fields: {
              billingDetails: {
                name: 'never',
                email: 'never',
              },
            },
          }}
        />
      </div>

      {/* Order bump */}
      {bumpProduct && (
        <OrderBump
          product={bumpProduct}
          checked={bumpChecked}
          onChange={handleBumpChange}
          paymentIntentId={paymentIntentId}
          baseAmountCents={initialAmountCents}
          currency={currency}
        />
      )}

      {/* Global error */}
      {error && (
        <div
          role="alert"
          aria-live="assertive"
          style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '0.375rem',
            padding: '0.75rem 1rem',
            fontSize: '0.875rem',
            color: '#dc2626',
            fontFamily: 'var(--font-body, inherit)',
          }}
        >
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting || !stripe || !elements}
        aria-disabled={submitting || !stripe || !elements}
        aria-busy={submitting}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          width: '100%',
          background: 'var(--color-primary, #7c3aed)',
          color: '#ffffff',
          fontFamily: 'var(--font-body, inherit)',
          fontSize: '1.0625rem',
          fontWeight: 700,
          lineHeight: 1,
          padding: '0.9375rem 2rem',
          borderRadius: '0.375rem',
          border: 'none',
          cursor: submitting ? 'wait' : 'pointer',
          opacity: submitting ? 0.7 : 1,
          transition: 'opacity 0.15s ease',
        }}
      >
        {submitting && <Spinner size={18} />}
        {submitting
          ? 'Processing…'
          : `Pay ${formatPrice(amountCents, currency)}`}
      </button>

      <p
        style={{
          textAlign: 'center',
          fontSize: '0.8125rem',
          opacity: 0.55,
          fontFamily: 'var(--font-body, inherit)',
          margin: 0,
        }}
      >
        🔒 Secure checkout powered by Stripe. Your payment info is encrypted.
      </p>
    </form>
  )
}

// ─── Outer island (mounts Elements) ──────────────────────────────────────────

export function CheckoutForm({
  products,
  bumpProduct,
  summitId,
  nextStepUrl,
  currency = 'usd',
}: CheckoutFormProps) {
  const [piResult, setPiResult] = useState<PaymentIntentResult | null>(null)
  const [initError, setInitError] = useState<string | null>(null)
  const initCalledRef = useRef(false)

  useEffect(() => {
    if (initCalledRef.current) return
    initCalledRef.current = true

    async function createIntent() {
      try {
        const res = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productIds: products.map((p) => p.id),
            summitId,
            currency,
          }),
        })

        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as { error?: string }
          throw new Error(data.error ?? `Server error ${res.status}`)
        }

        const data = (await res.json()) as PaymentIntentResult
        setSessionValue('summit_payment_intent_id', data.paymentIntentId)
        setPiResult(data)

        trackFunnelEvent({
          event: 'checkout_begin',
          product_ids: products.map((p) => p.id),
          value: data.amountCents / 100,
          currency: currency.toLowerCase(),
          summit_id: summitId,
        })
      } catch (err) {
        setInitError(
          err instanceof Error
            ? err.message
            : 'Could not initialise checkout. Please refresh and try again.',
        )
      }
    }

    void createIntent()
  }, [products, summitId, currency])

  if (initError) {
    return (
      <div
        role="alert"
        style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '0.5rem',
          padding: '1.25rem',
          color: '#dc2626',
          fontFamily: 'var(--font-body, inherit)',
          fontSize: '0.9375rem',
        }}
      >
        <strong>Unable to load checkout</strong>
        <p style={{ margin: '0.5rem 0 0' }}>{initError}</p>
        <button
          onClick={() => {
            initCalledRef.current = false
            setInitError(null)
          }}
          style={{
            marginTop: '0.75rem',
            background: 'transparent',
            border: '1px solid #dc2626',
            borderRadius: '0.375rem',
            color: '#dc2626',
            padding: '0.375rem 0.875rem',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontFamily: 'var(--font-body, inherit)',
          }}
        >
          Retry
        </button>
      </div>
    )
  }

  if (!piResult) {
    return (
      <div style={{ padding: '0.5rem 0' }}>
        <LoadingSkeleton />
      </div>
    )
  }

  const elementsOptions: StripeElementsOptions = {
    clientSecret: piResult.clientSecret,
    appearance: { theme: 'stripe' },
  }

  return (
    <Elements stripe={stripePromise} options={elementsOptions}>
      <InnerCheckoutForm
        products={products}
        bumpProduct={bumpProduct}
        summitId={summitId}
        nextStepUrl={nextStepUrl}
        currency={currency}
        paymentIntentId={piResult.paymentIntentId}
        amountCents={piResult.amountCents}
      />
    </Elements>
  )
}

export default CheckoutForm
