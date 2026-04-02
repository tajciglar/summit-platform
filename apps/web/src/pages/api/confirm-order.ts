/**
 * POST /api/confirm-order
 *
 * Called after the client confirms payment via Stripe Elements.
 * Verifies the PaymentIntent status server-side, creates the Order
 * record in Supabase, and applies ActiveCampaign product tags.
 *
 * Security: Always verifies PaymentIntent status — never mark an order
 * as paid based solely on client-side confirmation.
 *
 * Called by: CheckoutForm.tsx on successful stripe.confirmPayment()
 */

import type { APIRoute } from 'astro'
import { getStripeInstance } from '~/lib/stripe'
import { tagContact } from '~/lib/activecampaign'
import type { UTMParams } from '~/lib/utm'

interface OrderItem {
  productSlug: string
  productName: string
  price: number   // in cents
  quantity: number
  type: string
  acProductTag?: string | null
}

interface ConfirmOrderBody {
  paymentIntentId: string
  customerEmail: string
  customerName: string
  summitId: string
  utms?: UTMParams
  items: OrderItem[]
  bumpAccepted?: boolean
}

export const POST: APIRoute = async ({ request }) => {
  if (!request.headers.get('content-type')?.includes('application/json')) {
    return json({ success: false, error: 'Expected application/json' }, 400)
  }

  let body: ConfirmOrderBody
  try {
    body = (await request.json()) as ConfirmOrderBody
  } catch {
    return json({ success: false, error: 'Invalid JSON body' }, 400)
  }

  const { paymentIntentId, customerEmail, customerName, summitId, utms, items, bumpAccepted } = body

  if (!paymentIntentId || !customerEmail || !summitId || !items?.length) {
    return json({ success: false, error: 'Missing required fields' }, 422)
  }

  // ── CRITICAL: Verify PaymentIntent status with Stripe ──────────────────────
  let paymentIntent
  try {
    const stripe = getStripeInstance()
    paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
  } catch (err) {
    console.error('[api/confirm-order] Stripe retrieve error:', err)
    return json({ success: false, error: 'Could not verify payment' }, 500)
  }

  if (paymentIntent.status !== 'succeeded') {
    console.warn('[api/confirm-order] PaymentIntent not succeeded:', paymentIntent.status)
    return json(
      { success: false, error: `Payment not completed (status: ${paymentIntent.status})` },
      422
    )
  }

  const amountTotal = paymentIntent.amount

  // ── Insert Order into Supabase ────────────────────────────────────────────
  let orderId: string
  try {
    orderId = await insertOrder({
      summit_slug: summitId,
      customer_name: customerName,
      customer_email: customerEmail,
      status: 'paid',
      stripe_payment_intent_id: paymentIntentId,
      amount_total: amountTotal,
      currency: paymentIntent.currency,
      bump_accepted: bumpAccepted ?? false,
      upsell_accepted: false,
      utm_source: utms?.utm_source ?? null,
      utm_medium: utms?.utm_medium ?? null,
      utm_campaign: utms?.utm_campaign ?? null,
      utm_content: utms?.utm_content ?? null,
      utm_term: utms?.utm_term ?? null,
    })

    // Insert order items
    await insertOrderItems(
      orderId,
      items.map((item) => ({
        order_id: orderId,
        product_slug: item.productSlug,
        product_name: item.productName,
        price: item.price,
        quantity: item.quantity,
        type: item.type,
      }))
    )
  } catch (err) {
    console.error('[api/confirm-order] Supabase insert error:', err)
    // Don't fail the user — order will be recovered via Stripe webhook
    orderId = ''
  }

  // ── Apply ActiveCampaign product tags ─────────────────────────────────────
  try {
    const tags = items
      .map((item) => item.acProductTag)
      .filter((t): t is string => Boolean(t))

    if (tags.length > 0) {
      await tagContact({
        email: customerEmail,
        name: customerName,
        tags,
        utmParams: utms,
      })
    }
  } catch (err) {
    console.error('[api/confirm-order] ActiveCampaign error:', err)
    // Log but do not fail — AC errors must not block order confirmation
  }

  return json({ success: true, orderId })
}

// ── Supabase REST helpers (no @supabase/supabase-js dependency) ──────────────

async function insertOrder(order: Record<string, unknown>): Promise<string> {
  const supabaseUrl = import.meta.env.SUPABASE_URL
  const serviceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceKey) {
    console.warn('[api/confirm-order] Supabase not configured — skipping order insert')
    return ''
  }

  const res = await fetch(`${supabaseUrl}/rest/v1/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      Prefer: 'return=representation',
    },
    body: JSON.stringify(order),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Supabase orders insert failed: ${res.status} ${text}`)
  }

  const data = (await res.json()) as Array<{ id: string }>
  return data[0]?.id ?? ''
}

async function insertOrderItems(
  orderId: string,
  items: Array<Record<string, unknown>>
): Promise<void> {
  if (!orderId || items.length === 0) return

  const supabaseUrl = import.meta.env.SUPABASE_URL
  const serviceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceKey) return

  const res = await fetch(`${supabaseUrl}/rest/v1/order_items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
    },
    body: JSON.stringify(items),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Supabase order_items insert failed: ${res.status} ${text}`)
  }
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
