/**
 * POST /api/upsell
 *
 * Processes a one-click upsell (or downsell) using the Stripe Customer's
 * saved payment method from the initial checkout — no card re-entry required.
 *
 * Flow:
 * 1. Retrieve original PaymentIntent → get Stripe Customer ID
 * 2. List Customer's saved payment methods
 * 3. Create and immediately confirm a new PaymentIntent (off-session)
 * 4. Update Order record in Supabase (upsell_accepted = true)
 * 5. Apply AC product tag for upsell product
 * 6. Return success or error
 *
 * Called by: UpsellModal.tsx on accept button click
 */

import type { APIRoute } from 'astro'
import { confirmUpsell } from '~/lib/stripe'
import { tagContact } from '~/lib/activecampaign'
import { getProducts } from '~/lib/cms'
import type { UTMParams } from '~/lib/utm'

interface UpsellBody {
  originalPaymentIntentId: string
  upsellProductId: string
  summitId: string
  customerEmail?: string
  utms?: UTMParams
}

export const POST: APIRoute = async ({ request }) => {
  if (!request.headers.get('content-type')?.includes('application/json')) {
    return json({ success: false, error: 'Expected application/json' }, 400)
  }

  let body: UpsellBody
  try {
    body = (await request.json()) as UpsellBody
  } catch {
    return json({ success: false, error: 'Invalid JSON body' }, 400)
  }

  const { originalPaymentIntentId, upsellProductId, summitId, customerEmail, utms } = body

  if (!originalPaymentIntentId || !upsellProductId || !summitId) {
    return json({ success: false, error: 'Missing required fields' }, 422)
  }

  // ── Fetch upsell product from CMS (never trust client-supplied price) ─────
  let allProducts
  try {
    allProducts = await getProducts(summitId)
  } catch (err) {
    console.error('[api/upsell] CMS error:', err)
    return json({ success: false, error: 'Could not fetch products' }, 500)
  }

  const upsellProduct = allProducts.find((p) => p.id === upsellProductId)
  if (!upsellProduct) {
    return json({ success: false, error: 'Upsell product not found' }, 422)
  }

  // ── Confirm upsell charge using saved payment method ─────────────────────
  const result = await confirmUpsell({
    originalPaymentIntentId,
    upsellProduct,
  })

  if (!result.success) {
    return json({ success: false, error: result.error ?? 'Upsell charge failed' }, 422)
  }

  // ── Update Order in Supabase ──────────────────────────────────────────────
  try {
    await markOrderUpsellAccepted(originalPaymentIntentId)
  } catch (err) {
    console.error('[api/upsell] Supabase update error:', err)
    // Non-fatal — upsell succeeded, data integrity recovered via Stripe webhook
  }

  // ── Apply AC product tag ──────────────────────────────────────────────────
  if (customerEmail && upsellProduct.acProductTag) {
    try {
      await tagContact({
        email: customerEmail,
        tags: [upsellProduct.acProductTag],
        utmParams: utms,
      })
    } catch (err) {
      console.error('[api/upsell] ActiveCampaign error:', err)
    }
  }

  return json({ success: true, paymentIntentId: result.paymentIntentId })
}

// ── Supabase helper ───────────────────────────────────────────────────────────

async function markOrderUpsellAccepted(stripePaymentIntentId: string): Promise<void> {
  const supabaseUrl = import.meta.env.SUPABASE_URL
  const serviceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceKey) return

  const res = await fetch(
    `${supabaseUrl}/rest/v1/orders?stripe_payment_intent_id=eq.${encodeURIComponent(stripePaymentIntentId)}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({ upsell_accepted: true }),
    }
  )

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Supabase PATCH failed: ${res.status} ${text}`)
  }
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
