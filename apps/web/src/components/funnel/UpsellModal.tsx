import React, { useEffect, useRef, useState } from 'react'
import type { Product } from '@summit/types'
import { trackFunnelEvent } from '~/lib/analytics'
import { getSessionValue } from '~/lib/utm'

export interface UpsellModalProps {
  product: Product
  stepType: 'upsell' | 'downsell'
  acceptUrl: string
  declineUrl: string
  summitId: string
}

const spinKeyframes = `
@keyframes um-spin {
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
        width="18"
        height="18"
        viewBox="0 0 20 20"
        fill="none"
        style={{ animation: 'um-spin 0.75s linear infinite', flexShrink: 0 }}
      >
        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeOpacity="0.3" strokeWidth="2.5" />
        <path d="M18 10a8 8 0 0 0-8-8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    </>
  )
}

function formatPrice(product: Product): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: product.currency.toUpperCase(),
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(product.price)
}

type ViewState = 'idle' | 'accepting' | 'error'

export function UpsellModal({
  product,
  stepType,
  acceptUrl,
  declineUrl,
  summitId,
}: UpsellModalProps) {
  const [viewState, setViewState] = useState<ViewState>('idle')
  const [error, setError] = useState<string | null>(null)
  const firedViewRef = useRef(false)

  useEffect(() => {
    if (firedViewRef.current) return
    firedViewRef.current = true

    if (stepType === 'upsell') {
      trackFunnelEvent({
        event: 'upsell_view',
        product_id: product.id,
        value: product.price,
        currency: product.currency,
      })
    } else {
      trackFunnelEvent({
        event: 'downsell_view',
        product_id: product.id,
        value: product.price,
        currency: product.currency,
      })
    }
  }, [product, stepType])

  async function handleAccept() {
    if (viewState === 'accepting') return
    setViewState('accepting')
    setError(null)

    const originalPaymentIntentId = getSessionValue('summit_payment_intent_id')

    try {
      const res = await fetch('/api/upsell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalPaymentIntentId,
          upsellProductId: product.id,
          summitId,
        }),
      })

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(data.error ?? `Server error ${res.status}`)
      }

      const data = (await res.json()) as { transactionId?: string }

      if (stepType === 'upsell') {
        trackFunnelEvent({
          event: 'upsell_accept',
          product_id: product.id,
          value: product.price,
          currency: product.currency,
          transaction_id: data.transactionId ?? '',
        })
      } else {
        trackFunnelEvent({
          event: 'downsell_accept',
          product_id: product.id,
          value: product.price,
          currency: product.currency,
          transaction_id: data.transactionId ?? '',
        })
      }

      window.location.href = acceptUrl
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setViewState('error')
    }
  }

  function handleDecline() {
    if (stepType === 'upsell') {
      trackFunnelEvent({ event: 'upsell_decline', product_id: product.id })
    } else {
      trackFunnelEvent({ event: 'downsell_decline', product_id: product.id })
    }
    window.location.href = declineUrl
  }

  const isAccepting = viewState === 'accepting'

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="upsell-modal-title"
      aria-describedby="upsell-modal-description"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        background: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '1rem',
          boxShadow: '0 24px 80px rgba(0,0,0,0.3)',
          width: '100%',
          maxWidth: '36rem',
          maxHeight: '90vh',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 0,
        }}
      >
        {/* Header accent bar */}
        <div
          style={{
            height: '0.375rem',
            background: 'var(--color-primary, #7c3aed)',
            borderRadius: '1rem 1rem 0 0',
            flexShrink: 0,
          }}
          aria-hidden="true"
        />

        {/* Modal body */}
        <div
          style={{
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
          }}
        >
          {/* Step type badge */}
          <div
            style={{
              display: 'inline-flex',
              alignSelf: 'center',
              background: 'color-mix(in srgb, var(--color-primary, #7c3aed) 10%, transparent)',
              color: 'var(--color-primary, #7c3aed)',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              padding: '0.25rem 0.875rem',
              borderRadius: '100px',
              fontFamily: 'var(--font-body, sans-serif)',
            }}
          >
            {stepType === 'upsell' ? 'Special Upgrade Offer' : 'Wait — One More Thing'}
          </div>

          {/* Product heading */}
          <div style={{ textAlign: 'center' }}>
            <h2
              id="upsell-modal-title"
              style={{
                fontFamily: 'var(--font-heading, inherit)',
                fontSize: 'clamp(1.375rem, 4vw, 2rem)',
                fontWeight: 800,
                lineHeight: 1.15,
                margin: '0 0 0.75rem',
                color: 'inherit',
              }}
            >
              {product.name}
            </h2>

            {product.description && (
              <p
                id="upsell-modal-description"
                style={{
                  fontFamily: 'var(--font-body, sans-serif)',
                  fontSize: '1rem',
                  lineHeight: 1.65,
                  margin: 0,
                  opacity: 0.75,
                  color: 'inherit',
                }}
              >
                {product.description}
              </p>
            )}
          </div>

          {/* Price display */}
          <div
            style={{
              textAlign: 'center',
              fontFamily: 'var(--font-heading, inherit)',
              fontSize: 'clamp(2rem, 6vw, 3rem)',
              fontWeight: 800,
              color: 'var(--color-primary, #7c3aed)',
              lineHeight: 1,
            }}
            aria-label={`Price: ${formatPrice(product)}`}
          >
            {formatPrice(product)}
            {product.type === 'subscription' && product.billingInterval && (
              <span
                style={{
                  fontSize: '1rem',
                  fontWeight: 500,
                  opacity: 0.65,
                  marginLeft: '0.25rem',
                }}
              >
                /{product.billingInterval === 'monthly' ? 'mo' : 'yr'}
              </span>
            )}
          </div>

          {/* Error */}
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
                fontFamily: 'var(--font-body, sans-serif)',
              }}
            >
              {error}
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button
              onClick={handleAccept}
              disabled={isAccepting}
              aria-disabled={isAccepting}
              aria-busy={isAccepting}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                width: '100%',
                background: 'var(--color-primary, #7c3aed)',
                color: '#ffffff',
                fontFamily: 'var(--font-body, sans-serif)',
                fontSize: '1.0625rem',
                fontWeight: 700,
                lineHeight: 1,
                padding: '1rem 2rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: isAccepting ? 'wait' : 'pointer',
                opacity: isAccepting ? 0.7 : 1,
                transition: 'opacity 0.15s ease, transform 0.1s ease',
              }}
            >
              {isAccepting && <Spinner />}
              {isAccepting ? 'Processing…' : `Yes! I want this — ${formatPrice(product)}`}
            </button>

            <button
              onClick={handleDecline}
              disabled={isAccepting}
              aria-disabled={isAccepting}
              style={{
                display: 'block',
                width: '100%',
                background: 'transparent',
                border: 'none',
                fontFamily: 'var(--font-body, sans-serif)',
                fontSize: '0.875rem',
                color: 'inherit',
                opacity: 0.5,
                cursor: isAccepting ? 'not-allowed' : 'pointer',
                padding: '0.5rem',
                textDecoration: 'underline',
                textUnderlineOffset: '2px',
              }}
            >
              No thanks, I don't want this offer.
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UpsellModal
