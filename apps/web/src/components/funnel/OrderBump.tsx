import React, { useState } from 'react'
import type { Product } from '@summit/types'
import { trackFunnelEvent } from '~/lib/analytics'

export interface OrderBumpProps {
  product: Product
  checked: boolean
  onChange: (checked: boolean, newAmountCents: number) => void
  paymentIntentId: string
  baseAmountCents: number
  currency: string
}

const spinKeyframes = `
@keyframes ob-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
`

function Spinner() {
  return (
    <>
      <style>{spinKeyframes}</style>
      <svg
        aria-hidden="true"
        width="14"
        height="14"
        viewBox="0 0 16 16"
        fill="none"
        style={{ animation: 'ob-spin 0.75s linear infinite', flexShrink: 0 }}
      >
        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeOpacity="0.35" strokeWidth="2" />
        <path d="M14 8a6 6 0 0 0-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </>
  )
}

function formatPrice(amountCents: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amountCents / 100)
}

export function OrderBump({
  product,
  checked,
  onChange,
  paymentIntentId,
  baseAmountCents,
  currency,
}: OrderBumpProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const bumpAmountCents = Math.round(product.price * 100)

  async function handleToggle(e: React.ChangeEvent<HTMLInputElement>) {
    const nextChecked = e.target.checked
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/update-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentIntentId,
          action: nextChecked ? 'add_bump' : 'remove_bump',
          bumpAmountCents,
        }),
      })

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(data.error ?? `Server error ${res.status}`)
      }

      const data = (await res.json()) as { amountCents: number }

      trackFunnelEvent({
        event: 'order_bump_toggle',
        accepted: nextChecked,
        bump_product_id: product.id,
        bump_value: bumpAmountCents / 100,
      })

      onChange(nextChecked, data.amountCents)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      // Revert — leave checked state as-is (parent hasn't been told to change)
    } finally {
      setLoading(false)
    }
  }

  const checkboxId = `order-bump-${product.id}`

  return (
    <div
      style={{
        border: '2px dashed var(--color-primary, #7c3aed)',
        borderRadius: '0.5rem',
        padding: '1rem 1.25rem',
        background: 'color-mix(in srgb, var(--color-primary, #7c3aed) 4%, #ffffff)',
        marginBlock: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
      }}
      role="group"
      aria-labelledby={`ob-label-${product.id}`}
    >
      {/* Header badge */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.375rem',
          background: 'var(--color-primary, #7c3aed)',
          color: '#ffffff',
          fontSize: '0.6875rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          padding: '0.2rem 0.6rem',
          borderRadius: '0.25rem',
          alignSelf: 'flex-start',
        }}
        aria-hidden="true"
      >
        Special One-Time Offer
      </div>

      {/* Checkbox row */}
      <label
        htmlFor={checkboxId}
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.875rem',
          cursor: loading ? 'wait' : 'pointer',
        }}
      >
        <div style={{ position: 'relative', flexShrink: 0, marginTop: '2px' }}>
          <input
            id={checkboxId}
            type="checkbox"
            checked={checked}
            onChange={handleToggle}
            disabled={loading}
            aria-busy={loading}
            style={{
              width: '1.25rem',
              height: '1.25rem',
              accentColor: 'var(--color-primary, #7c3aed)',
              cursor: loading ? 'wait' : 'pointer',
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
          <span
            id={`ob-label-${product.id}`}
            style={{
              fontFamily: 'var(--font-heading, inherit)',
              fontWeight: 700,
              fontSize: '0.9375rem',
              lineHeight: 1.3,
              color: 'inherit',
            }}
          >
            Yes! Add "{product.name}" to my order for{' '}
            <span style={{ color: 'var(--color-primary, #7c3aed)' }}>
              {formatPrice(bumpAmountCents, currency)}
            </span>
          </span>

          {product.description && (
            <span
              style={{
                fontFamily: 'var(--font-body, inherit)',
                fontSize: '0.875rem',
                lineHeight: 1.55,
                opacity: 0.75,
                color: 'inherit',
              }}
            >
              {product.description}
            </span>
          )}
        </div>

        {loading && (
          <div style={{ flexShrink: 0, marginTop: '2px', opacity: 0.6 }}>
            <Spinner />
          </div>
        )}
      </label>

      {/* Order total preview */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: '0.5rem',
          borderTop: '1px solid rgba(0,0,0,0.08)',
          fontSize: '0.875rem',
          fontFamily: 'var(--font-body, inherit)',
          opacity: 0.75,
        }}
      >
        <span>Order total with this add-on:</span>
        <strong style={{ color: 'var(--color-primary, #7c3aed)', opacity: 1 }}>
          {formatPrice(checked ? baseAmountCents + bumpAmountCents : baseAmountCents, currency)}
        </strong>
      </div>

      {/* Error message */}
      {error && (
        <div
          role="alert"
          aria-live="assertive"
          style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '0.375rem',
            padding: '0.5rem 0.75rem',
            fontSize: '0.8125rem',
            color: '#dc2626',
            fontFamily: 'var(--font-body, inherit)',
          }}
        >
          {error}
        </div>
      )}
    </div>
  )
}

export default OrderBump
