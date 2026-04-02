/**
 * POST /api/subscriptions/create
 *
 * Creates a Stripe Subscription for a recurring product after the customer
 * has confirmed their payment method via a SetupIntent.
 *
 * Flow:
 * 1. Validate request body
 * 2. Fetch product from CMS (never trust client-supplied price/priceId)
 * 3. Create Stripe Subscription with confirmed payment method
 * 4. Insert Order + OrderItems in Supabase
 * 5. Apply AC product tag
 * 6. Return { subscriptionId, orderId, nextStepUrl }
 *
 * The Brevo confirmation email and ClickMagic postback are handled by the
 * Stripe webhook (invoice.payment_succeeded with billing_reason='subscription_create')
 * to keep this endpoint fast and to handle cases where the initial invoice
 * is not synchronously confirmed.
 *
 * Called by: CheckoutForm.tsx after a successful SetupIntent confirmation
 * for subscription products.
 */

import type { APIRoute } from 'astro'
import { createSubscription } from '~/lib/stripe'
import { tagContact } from '~/lib/activecampaign'
import { getProducts } from '~/lib/cms'
import type { UTMParams } from '~/lib/utm'

interface CreateSubscriptionBody {
  customerId: string
  paymentMethodId: string
  productId: string
  summitId: string
  customerEmail: string
  customerName?: string
  utms?: UTMParams
  nextStepUrl?: string
}

export const POST: APIRoute = async ({ request }) => {
  if (!request.headers.get('content-type')?.includes('application/json')) {
    return json({ success: false, error: 'Expected application/json' }, 400)
  }

  let body: CreateSubscriptionBody
  try {
    body = (await request.json()) as CreateSubscriptionBody
  } catch {
    return json({ success: false, error: 'Invalid JSON body' }, 400)
  }

  const {
    customerId,
    paymentMethodId,
    productId,
    summitId,
    customerEmail,
    customerName,
    utms,
    nextStepUrl,
  } = body

  if (!customerId || !paymentMethodId || !productId || !summitId || !customerEmail) {
    return json({ success: false, error: 'Missing required fields' }, 422)
  }

  // ── Fetch product from CMS (never trust client-supplied priceId) ──────────
  let allProducts
  try {
    allProducts = await getProducts(summitId)
  } catch (err) {
    console.error('[api/subscriptions/create] CMS error:', err)
    return json({ success: false, error: 'Could not fetch products' }, 500)
  }

  const product = allProducts.find((p) => p.id === productId)
  if (!product) {
    return json({ success: false, error: 'Product not found' }, 422)
  }

  if (product.type !== 'subscription') {
    return json({ success: false, error: 'Product is not a subscription' }, 422)
  }

  if (!product.stripePriceId) {
    return json({ success: false, error: 'Product has no Stripe Price ID configured' }, 422)
  }

  // ── Create Stripe Subscription ────────────────────────────────────────────
  let subscriptionResult
  try {
    subscriptionResult = await createSubscription({
      customerId,
      stripePriceId: product.stripePriceId,
      paymentMethodId,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Subscription creation failed'
    console.error('[api/subscriptions/create] Stripe error:', err)
    return json({ success: false, error: message }, 422)
  }

  if (subscriptionResult.status !== 'active' && subscriptionResult.status !== 'trialing') {
    return json(
      {
        success: false,
        error: `Subscription status: ${subscriptionResult.status}`,
      },
      422
    )
  }

  // ── Insert Order in Supabase ──────────────────────────────────────────────
  let orderId: string | null = null

  const supabaseUrl = import.meta.env.SUPABASE_URL
  const serviceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY

  if (supabaseUrl && serviceKey) {
    try {
      orderId = await insertSubscriptionOrder({
        supabaseUrl,
        serviceKey,
        summitId,
        customerId,
        subscriptionId: subscriptionResult.subscriptionId,
        customerEmail,
        customerName: customerName ?? customerEmail,
        product,
        utms,
      })
    } catch (err) {
      console.error('[api/subscriptions/create] Supabase error:', err)
      // Non-fatal — order data recovered via Stripe webhook
    }
  }

  // ── Apply AC product tag ──────────────────────────────────────────────────
  if (product.acProductTag) {
    try {
      await tagContact({
        email: customerEmail,
        tags: [product.acProductTag],
        utmParams: utms,
      })
    } catch (err) {
      console.error('[api/subscriptions/create] ActiveCampaign error:', err)
    }
  }

  return json({
    success: true,
    subscriptionId: subscriptionResult.subscriptionId,
    orderId,
    nextStepUrl: nextStepUrl ?? null,
  })
}

// ── Supabase helpers ──────────────────────────────────────────────────────────

interface InsertSubscriptionOrderParams {
  supabaseUrl: string
  serviceKey: string
  summitId: string
  customerId: string
  subscriptionId: string
  customerEmail: string
  customerName: string
  product: Awaited<ReturnType<typeof import('~/lib/cms').getProducts>>[number]
  utms?: UTMParams
}

async function insertSubscriptionOrder(params: InsertSubscriptionOrderParams): Promise<string> {
  const headers = {
    'Content-Type': 'application/json',
    apikey: params.serviceKey,
    Authorization: `Bearer ${params.serviceKey}`,
    Prefer: 'return=representation',
  }

  const amountCents = Math.round(params.product.price * 100)

  // Insert order
  const orderRes = await fetch(`${params.supabaseUrl}/rest/v1/orders`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      summit_id: params.summitId,
      stripe_customer_id: params.customerId,
      stripe_subscription_id: params.subscriptionId,
      customer_email: params.customerEmail,
      customer_name: params.customerName,
      amount_total: amountCents,
      currency: params.product.currency?.toLowerCase() ?? 'eur',
      status: 'active',
      utm_source: params.utms?.utm_source ?? null,
      utm_medium: params.utms?.utm_medium ?? null,
      utm_campaign: params.utms?.utm_campaign ?? null,
      utm_term: params.utms?.utm_term ?? null,
      utm_content: params.utms?.utm_content ?? null,
    }),
  })

  if (!orderRes.ok) {
    const text = await orderRes.text()
    throw new Error(`Order insert failed: ${orderRes.status} ${text}`)
  }

  const [order] = (await orderRes.json()) as [{ id: string }]
  if (!order?.id) throw new Error('No order ID returned from Supabase')

  // Insert order item
  const itemRes = await fetch(`${params.supabaseUrl}/rest/v1/order_items`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      order_id: order.id,
      product_id: params.product.id,
      product_name: params.product.name,
      unit_price: amountCents,
      quantity: 1,
      type: 'subscription',
      ac_product_tag: params.product.acProductTag ?? null,
      file_paths: params.product.filePaths ?? null,
    }),
  })

  if (!itemRes.ok) {
    const text = await itemRes.text()
    throw new Error(`Order item insert failed: ${itemRes.status} ${text}`)
  }

  return order.id
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
