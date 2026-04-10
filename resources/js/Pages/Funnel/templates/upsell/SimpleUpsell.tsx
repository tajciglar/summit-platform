import { useState } from 'react'
import { router } from '@inertiajs/react'
import { sanitizeHtml } from '@/lib/sanitize'
import { getCsrfToken } from '@/lib/csrf'
import type { UpsellPageProps } from '@/types/funnel'

export default function SimpleUpsell({ step, content, product, nextStepSlug, paymentIntentId, summit, funnel }: UpsellPageProps) {
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const declineUrl = nextStepSlug
    ? `/${summit.slug}/${funnel.slug}/${nextStepSlug}`
    : `/${summit.slug}/${funnel.slug}/thank-you`

  async function handleAccept() {
    if (!paymentIntentId) {
      setError('Missing payment reference. Please go back to checkout.')
      return
    }

    setProcessing(true)
    setError(null)

    const res = await fetch('/checkout/upsell', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': getCsrfToken() },
      body: JSON.stringify({ funnel_step_id: step.id, original_payment_intent_id: paymentIntentId }),
    })

    const data = (await res.json()) as { success?: boolean; error?: string }

    if (!res.ok || data.error) {
      setError(data.error ?? 'Payment failed. You can skip this offer.')
      setProcessing(false)
      return
    }

    router.visit(declineUrl)
  }

  const priceLabel = product ? `$${(product.price_cents / 100).toFixed(2)}` : ''

  return (
    <div className="flex items-center justify-center py-12 px-4">
      <div
        className="max-w-lg w-full rounded-2xl shadow-lg p-8 md:p-10 text-center"
        style={{
          backgroundColor: 'var(--theme-surface)',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: 'var(--theme-border)',
        }}
      >
        <div
          className="inline-block text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full mb-6 text-white"
          style={{ backgroundColor: 'var(--theme-accent)' }}
        >
          Special Offer
        </div>

        {content.subheadline && (
          <p className="text-sm font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--theme-primary)' }}>
            {content.subheadline}
          </p>
        )}
        <h1
          className="text-2xl md:text-3xl font-extrabold mb-3"
          style={{ fontFamily: 'var(--font-heading), sans-serif', color: 'var(--theme-secondary)' }}
        >
          {content.headline ?? step.name}
        </h1>
        {product && (
          <p className="mb-8 text-lg" style={{ color: 'var(--theme-muted)' }}>
            Add <span className="font-semibold" style={{ color: 'var(--theme-text)' }}>{product.name}</span> for just{' '}
            <span className="font-bold text-xl" style={{ color: 'var(--theme-primary)' }}>{priceLabel}</span>
            {product.compare_at_cents && (
              <span className="ml-2 text-base line-through" style={{ color: 'var(--theme-muted)' }}>
                ${(product.compare_at_cents / 100).toFixed(2)}
              </span>
            )}
          </p>
        )}

        {content.body && (
          <div
            className="mb-8 prose mx-auto"
            style={{ color: 'var(--theme-muted)' }}
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(content.body) }}
          />
        )}

        {error && <p className="text-sm text-red-600 mb-4" role="alert">{error}</p>}

        <div className="space-y-3">
          <button
            type="button"
            onClick={handleAccept}
            disabled={processing}
            className="w-full text-white font-bold py-4 rounded-xl text-lg shadow-lg hover:opacity-90 active:scale-[0.98] disabled:opacity-50 transition-all focus-visible:ring-2 focus-visible:ring-offset-2"
            style={{
              backgroundColor: 'var(--theme-primary)',
              '--tw-ring-color': 'var(--theme-primary)',
            } as React.CSSProperties}
          >
            {processing ? 'Processing\u2026' : content.cta_text ?? `Yes \u2014 Add for ${priceLabel}`}
          </button>
          <button
            type="button"
            onClick={() => router.visit(declineUrl)}
            disabled={processing}
            className="w-full text-sm py-2 hover:opacity-80 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none rounded"
            style={{
              color: 'var(--theme-muted)',
              '--tw-ring-color': 'var(--theme-primary)',
            } as React.CSSProperties}
          >
            No thanks, skip this offer
          </button>
        </div>
      </div>
    </div>
  )
}
