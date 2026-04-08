import { useState, useCallback } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  PaymentElement,
  ExpressCheckoutElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'

interface Props {
  funnel: { name: string; slug: string }
  step: {
    id: number
    title: string
    slug: string
    type: string
    sort_order: number
    headline: string | null
  }
  product: {
    name: string
    price_in_dollars: string
    currency: string
  }
  stripeKey: string
  nextStepSlug: string | null
}

function getCsrfToken(): string {
  return (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? ''
}

/** Outer component: creates PaymentIntent, then mounts Elements */
export default function Checkout({ funnel, step, product, stripeKey, nextStepSlug }: Props) {
  const [stripePromise] = useState(() => loadStripe(stripeKey))
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [initError, setInitError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const initPaymentIntent = useCallback(async () => {
    if (clientSecret) return // already created
    if (!email) return

    setLoading(true)
    setInitError(null)

    const res = await fetch('/checkout/intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': getCsrfToken() },
      body: JSON.stringify({ funnel_step_id: step.id, customer_email: email, customer_name: name }),
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
  }, [clientSecret, email, name, step.id])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm p-8">
        {step.headline && (
          <p className="text-sm font-medium text-indigo-600 uppercase tracking-widest mb-2">
            {step.headline}
          </p>
        )}
        <h1 className="text-2xl font-bold text-gray-900 mb-1">{step.title}</h1>
        <p className="text-gray-500 mb-6">
          {product.name} —{' '}
          <span className="font-semibold text-gray-900">
            ${product.price_in_dollars} {product.currency.toUpperCase()}
          </span>
        </p>

        {/* Contact fields — always visible */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="jane@example.com"
            />
          </div>
        </div>

        {initError && <p className="text-sm text-red-600 mb-4">{initError}</p>}

        {/* Before intent is created — show continue button */}
        {!clientSecret && (
          <button
            onClick={initPaymentIntent}
            disabled={!email || loading}
            className="w-full bg-indigo-600 text-white font-semibold py-2.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Loading…' : 'Continue to Payment'}
          </button>
        )}

        {/* After intent is created — mount Stripe Elements */}
        {clientSecret && (
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: {
                theme: 'stripe',
                variables: {
                  colorPrimary: '#4f46e5',
                  borderRadius: '8px',
                },
              },
            }}
          >
            <CheckoutForm
              email={email}
              name={name}
              paymentIntentId={paymentIntentId}
              priceLabel={`$${product.price_in_dollars}`}
              funnelSlug={funnel.slug}
              nextStepSlug={nextStepSlug}
            />
          </Elements>
        )}
      </div>
    </div>
  )
}

/** Inner component: renders PaymentElement + Express Checkout, handles confirmation */
function CheckoutForm({
  email,
  name,
  paymentIntentId,
  priceLabel,
  funnelSlug,
  nextStepSlug,
}: {
  email: string
  name: string
  paymentIntentId: string | null
  priceLabel: string
  funnelSlug: string
  nextStepSlug: string | null
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)

  // After checkout, go to next step (upsell) or thank-you, passing payment_intent for upsell charging
  const nextPath = nextStepSlug ? `/${funnelSlug}/${nextStepSlug}` : `/${funnelSlug}/thank-you`
  const returnUrl = `${window.location.origin}${nextPath}?payment_intent=${paymentIntentId ?? ''}&email=${encodeURIComponent(email)}`

  async function syncMetadata() {
    if (!paymentIntentId) return
    await fetch('/checkout/update-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': getCsrfToken() },
      body: JSON.stringify({ payment_intent_id: paymentIntentId, customer_email: email, customer_name: name }),
    }).catch(() => {}) // non-blocking
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
          billing_details: {
            name: name || undefined,
            email: email || undefined,
          },
        },
      },
      redirect: 'if_required',
    })

    if (result.error) {
      setError(result.error.message ?? 'Payment failed.')
      setProcessing(false)
    } else {
      // Payment succeeded without redirect (no 3DS needed)
      window.location.href = returnUrl
    }
  }

  async function handleExpressConfirm() {
    if (!stripe || !elements) return
    await syncMetadata()

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: returnUrl,
      },
      redirect: 'if_required',
    })

    if (result.error) {
      setError(result.error.message ?? 'Payment failed.')
    } else {
      window.location.href = returnUrl
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Express Checkout (Apple Pay / Google Pay) */}
      <ExpressCheckoutElement
        onConfirm={handleExpressConfirm}
        options={{
          buttonType: { applePay: 'buy', googlePay: 'buy' },
          buttonHeight: 48,
        }}
      />

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-3 text-gray-400">or pay with card</span>
        </div>
      </div>

      {/* Payment Element (card input + other methods) */}
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

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-indigo-600 text-white font-semibold py-2.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
      >
        {processing ? 'Processing…' : `Pay ${priceLabel}`}
      </button>
    </form>
  )
}
