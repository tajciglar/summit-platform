import { useState, useCallback } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  PaymentElement,
  ExpressCheckoutElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import OrderBumpList from '@/components/funnel/OrderBumpList'
import type { CheckoutPageProps } from '@/types/funnel'

function getCsrfToken(): string {
  return (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? ''
}

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

export default function StandardCheckout({ step, content, product, stripeKey, nextStepSlug, summit, funnel, orderBumps }: CheckoutPageProps) {
  const [stripePromise] = useState(() => loadStripe(stripeKey))
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [initError, setInitError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedBumpIds, setSelectedBumpIds] = useState<string[]>([])
  const [bumpsTotal, setBumpsTotal] = useState(0)

  const totalCents = (product?.price_cents ?? 0) + bumpsTotal

  const handleBumpChange = useCallback((ids: string[], total: number) => {
    setSelectedBumpIds(ids)
    setBumpsTotal(total)
  }, [])

  const initPaymentIntent = useCallback(async () => {
    if (clientSecret) return
    if (!email) return

    setLoading(true)
    setInitError(null)

    const res = await fetch('/checkout/intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': getCsrfToken() },
      body: JSON.stringify({
        funnel_step_id: step.id,
        customer_email: email,
        customer_name: name,
        selected_bump_ids: selectedBumpIds,
      }),
    })

    const data = (await res.json()) as { clientSecret?: string; paymentIntentId?: string; error?: string }

    if (!res.ok || data.error) {
      setInitError(data.error ?? 'Could not initialise payment.')
      setLoading(false)
      return
    }

    setClientSecret(data.clientSecret ?? null)
    setPaymentIntentId(data.paymentIntentId ?? null)
    setLoading(false)
  }, [clientSecret, email, name, step.id, selectedBumpIds])

  return (
    <div className="flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm p-8">
        {content.subheadline && (
          <p className="text-sm font-medium uppercase tracking-widest mb-2" style={{ color: 'var(--theme-primary)' }}>
            {content.subheadline}
          </p>
        )}
        <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: 'var(--font-heading), sans-serif', color: 'var(--theme-secondary)' }}>
          {content.headline ?? step.name}
        </h1>
        {product && (
          <p className="text-gray-500 mb-6">
            {product.name} — <span className="font-semibold" style={{ color: 'var(--theme-text)' }}>{formatPrice(product.price_cents)}</span>
            {product.compare_at_cents && (
              <span className="ml-2 text-sm text-gray-400 line-through">{formatPrice(product.compare_at_cents)}</span>
            )}
          </p>
        )}

        {/* Contact fields */}
        <div className="space-y-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': 'var(--theme-primary)' } as React.CSSProperties}
              placeholder="Jane Smith"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': 'var(--theme-primary)' } as React.CSSProperties}
              placeholder="jane@example.com"
            />
          </div>
        </div>

        {/* Order Bumps */}
        <OrderBumpList bumps={orderBumps} onSelectionChange={handleBumpChange} />

        {/* Total */}
        {bumpsTotal > 0 && (
          <div className="flex justify-between items-center py-3 border-t border-gray-200 mb-4">
            <span className="font-medium text-gray-700">Total</span>
            <span className="text-lg font-bold" style={{ color: 'var(--theme-primary)' }}>{formatPrice(totalCents)}</span>
          </div>
        )}

        {initError && <p className="text-sm text-red-600 mb-4">{initError}</p>}

        {!clientSecret && (
          <button
            onClick={initPaymentIntent}
            disabled={!email || loading}
            className="w-full text-white font-semibold py-2.5 rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
            style={{ backgroundColor: 'var(--theme-primary)' }}
          >
            {loading ? 'Loading…' : content.cta_text ?? 'Continue to Payment'}
          </button>
        )}

        {clientSecret && (
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: {
                theme: 'stripe',
                variables: { colorPrimary: 'var(--theme-primary)', borderRadius: '8px' },
              },
            }}
          >
            <CheckoutForm
              email={email}
              name={name}
              paymentIntentId={paymentIntentId}
              totalLabel={formatPrice(totalCents)}
              summitSlug={summit.slug}
              funnelSlug={funnel.slug}
              nextStepSlug={nextStepSlug}
              ctaText={content.cta_text}
            />
          </Elements>
        )}
      </div>
    </div>
  )
}

function CheckoutForm({
  email, name, paymentIntentId, totalLabel, summitSlug, funnelSlug, nextStepSlug, ctaText,
}: {
  email: string; name: string; paymentIntentId: string | null; totalLabel: string
  summitSlug: string; funnelSlug: string; nextStepSlug: string | null; ctaText?: string
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)

  const nextPath = nextStepSlug ? `/${summitSlug}/${funnelSlug}/${nextStepSlug}` : `/${summitSlug}/${funnelSlug}/thank-you`
  const returnUrl = `${window.location.origin}${nextPath}`

  async function syncMetadata() {
    if (!paymentIntentId) return
    await fetch('/checkout/update-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': getCsrfToken() },
      body: JSON.stringify({ payment_intent_id: paymentIntentId, customer_email: email, customer_name: name }),
    }).catch(() => {})
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!stripe || !elements) return

    setProcessing(true)
    setError(null)
    await syncMetadata()

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: returnUrl,
        payment_method_data: {
          billing_details: { name: name || undefined, email: email || undefined },
        },
      },
      redirect: 'if_required',
    })

    if (result.error) {
      setError(result.error.message ?? 'Payment failed.')
      setProcessing(false)
    } else {
      window.location.href = returnUrl
    }
  }

  async function handleExpressConfirm() {
    if (!stripe || !elements) return
    await syncMetadata()
    const result = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: returnUrl },
      redirect: 'if_required',
    })
    if (result.error) setError(result.error.message ?? 'Payment failed.')
    else window.location.href = returnUrl
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ExpressCheckoutElement
        onConfirm={handleExpressConfirm}
        options={{ buttonType: { applePay: 'buy', googlePay: 'buy' }, buttonHeight: 48 }}
      />
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
        <div className="relative flex justify-center text-sm"><span className="bg-white px-3 text-gray-400">or pay with card</span></div>
      </div>
      <PaymentElement options={{ layout: 'tabs', fields: { billingDetails: { name: 'never', email: 'never' } } }} />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full text-white font-semibold py-2.5 rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
        style={{ backgroundColor: 'var(--theme-primary)' }}
      >
        {processing ? 'Processing…' : `${ctaText ?? 'Pay'} ${totalLabel}`}
      </button>
    </form>
  )
}
