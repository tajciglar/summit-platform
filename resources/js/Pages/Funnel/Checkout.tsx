import { useState } from 'react'

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
}

export default function Checkout({ funnel, step, product, stripeKey }: Props) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const res = await fetch('/checkout/intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '',
      },
      body: JSON.stringify({ funnel_step_id: step.id, customer_email: email, customer_name: name }),
    })

    const data = await res.json() as { clientSecret?: string; error?: string }

    if (!res.ok || data.error) {
      setError(data.error ?? 'Something went wrong.')
      setLoading(false)
      return
    }

    // clientSecret is ready — in the next phase we hand this to Stripe.js
    // For now, log it so we can confirm the PaymentIntent was created
    console.log('PaymentIntent clientSecret:', data.clientSecret)
    alert('PaymentIntent created! Open the console to see the clientSecret. Stripe.js integration comes next.')
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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

        <form onSubmit={handleSubmit} className="space-y-4">
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

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white font-semibold py-2.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Processing…' : `Pay $${product.price_in_dollars}`}
          </button>
        </form>
      </div>
    </div>
  )
}
