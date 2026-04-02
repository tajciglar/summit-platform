/**
 * POST /api/create-payment-intent
 *
 * Creates a Stripe PaymentIntent for the checkout step.
 *
 * Flow:
 * 1. Parse product IDs and summit ID from request body
 * 2. Fetch products from CMS (validates they belong to the correct summit)
 * 3. Create Stripe PaymentIntent with setup_future_usage for upsell support
 * 4. Return { clientSecret, paymentIntentId, amountCents }
 *
 * Called by: CheckoutForm.tsx on mount
 *
 * TODO: Add rate limiting via @upstash/ratelimit before production.
 */

import type { APIRoute } from 'astro'
import { createPaymentIntent } from '~/lib/stripe'
import { getProducts } from '~/lib/cms'

interface CreateIntentBody {
  productIds: string[]
  summitId: string
  currency?: string
  customerEmail?: string
}

export const POST: APIRoute = async ({ request }) => {
  if (!request.headers.get('content-type')?.includes('application/json')) {
    return json({ success: false, error: 'Expected application/json' }, 400)
  }

  let body: CreateIntentBody
  try {
    body = (await request.json()) as CreateIntentBody
  } catch {
    return json({ success: false, error: 'Invalid JSON body' }, 400)
  }

  const { productIds, summitId, currency, customerEmail } = body

  if (!productIds?.length || !summitId) {
    return json({ success: false, error: 'productIds and summitId are required' }, 422)
  }

  // ── Fetch products from CMS (security: never trust client-supplied prices) ──
  let allProducts
  try {
    allProducts = await getProducts(summitId)
  } catch (err) {
    console.error('[api/create-payment-intent] CMS fetch error:', err)
    return json({ success: false, error: 'Could not fetch products' }, 500)
  }

  const products = allProducts.filter((p) => productIds.includes(p.id))

  if (products.length === 0) {
    return json({ success: false, error: 'No valid products found' }, 422)
  }

  // ── Create PaymentIntent ──────────────────────────────────────────────────
  try {
    const result = await createPaymentIntent({
      products,
      currency: currency ?? products[0]?.currency ?? 'eur',
      customerEmail,
    })

    return json({
      success: true,
      clientSecret: result.clientSecret,
      paymentIntentId: result.paymentIntentId,
      customerId: result.customerId,
      amountCents: result.amountCents,
    })
  } catch (err) {
    console.error('[api/create-payment-intent] Stripe error:', err)
    return json({ success: false, error: 'Payment setup failed' }, 500)
  }
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
