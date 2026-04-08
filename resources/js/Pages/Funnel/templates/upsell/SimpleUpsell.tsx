import { useState } from 'react'
import { router } from '@inertiajs/react'
import type { UpsellPageProps } from '@/types/funnel'

function getCsrfToken(): string {
  return (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? ''
}

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
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-lg p-8 md:p-10 text-center border border-gray-100">
        {/* Badge */}
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
          <p className="text-gray-500 mb-8 text-lg">
            Add <span className="font-semibold" style={{ color: 'var(--theme-text)' }}>{product.name}</span> for just{' '}
            <span className="font-bold text-xl" style={{ color: 'var(--theme-primary)' }}>{priceLabel}</span>
            {product.compare_at_cents && (
              <span className="ml-2 text-base text-red-400 line-through">
                ${(product.compare_at_cents / 100).toFixed(2)}
              </span>
            )}
          </p>
        )}

        {content.body && (
          <div
            className="text-gray-600 mb-8 prose mx-auto"
            dangerouslySetInnerHTML={{ __html: content.body }}
          />
        )}

        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

        <div className="space-y-3">
          <button
            onClick={handleAccept}
            disabled={processing}
            className="w-full text-white font-bold py-4 rounded-xl text-lg shadow-lg hover:scale-[1.02] active:scale-100 disabled:opacity-50 transition-transform"
            style={{ backgroundColor: 'var(--theme-primary)' }}
          >
            {processing ? 'Processing…' : content.cta_text ?? `Yes — Add for ${priceLabel}`}
          </button>
          <button
            onClick={() => router.visit(declineUrl)}
            disabled={processing}
            className="w-full text-gray-400 text-sm py-2 hover:text-gray-600 transition-colors"
          >
            No thanks, skip this offer
          </button>
        </div>
      </div>
    </div>
  )
}
