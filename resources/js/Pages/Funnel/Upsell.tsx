import { useState } from 'react'
import { router } from '@inertiajs/react'

interface Props {
  funnel: { name: string; slug: string }
  step: {
    id: number
    title: string
    slug: string
    type: string
    headline: string | null
  }
  product: {
    name: string
    price_in_dollars: string
    currency: string
  }
  nextStepSlug: string | null
  paymentIntentId: string | null
}

function getCsrfToken(): string {
  return (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? ''
}

export default function Upsell({ funnel, step, product, nextStepSlug, paymentIntentId }: Props) {
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const declineUrl = nextStepSlug ? `/${funnel.slug}/${nextStepSlug}` : `/${funnel.slug}/thank-you`

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
      body: JSON.stringify({
        funnel_step_id: step.id,
        original_payment_intent_id: paymentIntentId,
      }),
    })

    const data = (await res.json()) as { success?: boolean; error?: string }

    if (!res.ok || data.error) {
      setError(data.error ?? 'Payment failed. You can skip this offer.')
      setProcessing(false)
      return
    }

    // Payment succeeded — move to next step
    router.visit(declineUrl)
  }

  function handleDecline() {
    router.visit(declineUrl)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm p-8 text-center">
        {step.headline && (
          <p className="text-sm font-medium text-indigo-600 uppercase tracking-widest mb-2">
            {step.headline}
          </p>
        )}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{step.title}</h1>
        <p className="text-gray-500 mb-6">
          Add <span className="font-semibold text-gray-900">{product.name}</span> for just{' '}
          <span className="font-semibold text-gray-900">
            ${product.price_in_dollars} {product.currency.toUpperCase()}
          </span>
        </p>

        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

        <div className="space-y-3">
          <button
            onClick={handleAccept}
            disabled={processing}
            className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {processing ? 'Processing…' : `Yes — Add for $${product.price_in_dollars}`}
          </button>
          <button
            onClick={handleDecline}
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
