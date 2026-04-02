/**
 * POST /api/update-payment-intent
 *
 * Updates a PaymentIntent amount when the order bump checkbox is toggled.
 *
 * Security: Fetches product prices from CMS — never trusts client-supplied amounts.
 *
 * Called by: OrderBump.tsx on checkbox toggle
 */

import type { APIRoute } from 'astro'
import { getStripeInstance, toCents } from '~/lib/stripe'
import { getProducts } from '~/lib/cms'

interface UpdateIntentBody {
  paymentIntentId: string
  action: 'add_bump' | 'remove_bump'
  summitId: string
  bumpProductId: string
  baseProductIds: string[]
}

export const POST: APIRoute = async ({ request }) => {
  if (!request.headers.get('content-type')?.includes('application/json')) {
    return json({ success: false, error: 'Expected application/json' }, 400)
  }

  let body: UpdateIntentBody
  try {
    body = (await request.json()) as UpdateIntentBody
  } catch {
    return json({ success: false, error: 'Invalid JSON body' }, 400)
  }

  const { paymentIntentId, action, summitId, bumpProductId, baseProductIds } = body

  if (!paymentIntentId || !action || !summitId || !bumpProductId) {
    return json({ success: false, error: 'Missing required fields' }, 422)
  }

  // ── Fetch prices from CMS (never trust client amounts) ────────────────────
  let allProducts
  try {
    allProducts = await getProducts(summitId)
  } catch (err) {
    console.error('[api/update-payment-intent] CMS error:', err)
    return json({ success: false, error: 'Could not fetch products' }, 500)
  }

  const bumpProduct = allProducts.find((p) => p.id === bumpProductId)
  if (!bumpProduct) {
    return json({ success: false, error: 'Bump product not found' }, 422)
  }

  const baseProducts = allProducts.filter((p) => (baseProductIds ?? []).includes(p.id))
  const baseAmountCents = baseProducts.reduce((sum, p) => sum + toCents(p.price), 0)
  const bumpAmountCents = toCents(bumpProduct.price)

  const newAmountCents =
    action === 'add_bump'
      ? baseAmountCents + bumpAmountCents
      : baseAmountCents

  // ── Update PaymentIntent ──────────────────────────────────────────────────
  try {
    const stripe = getStripeInstance()
    const updated = await stripe.paymentIntents.update(paymentIntentId, {
      amount: newAmountCents,
    })

    return json({ success: true, newAmountCents: updated.amount })
  } catch (err) {
    console.error('[api/update-payment-intent] Stripe error:', err)
    return json({ success: false, error: 'Could not update payment amount' }, 500)
  }
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
