/**
 * POST /api/webhooks/stripe
 *
 * Handles Stripe webhook events. This is the authoritative post-payment
 * processing pipeline — all side effects are driven from here, not from
 * the client-side checkout flow, so they survive network drops, retries,
 * and off-session payments.
 *
 * Processing order (per event):
 *   1. Verify Stripe webhook signature (STRIPE_WEBHOOK_SECRET)
 *   2. Idempotency check — skip if already processed (processed_webhook_events)
 *   3. Update Order status in Supabase
 *   4. Apply ActiveCampaign product tags
 *   5. Send Brevo order confirmation email (with signed Bunny CDN links)
 *   6. Log email send to email_log
 *   7. Fire ClickMagic conversion postback
 *   8. Mark event as processed
 *   9. Return 200
 *
 * Events handled:
 *   - payment_intent.succeeded       → one-time purchase confirmed
 *   - invoice.payment_succeeded      → subscription payment confirmed
 *   - customer.subscription.deleted  → subscription cancelled
 *
 * Always returns 200 to Stripe (even on non-fatal errors) so Stripe doesn't
 * retry indefinitely. Fatal errors (signature mismatch, idempotency failure)
 * return 400/500.
 */

import type { APIRoute } from 'astro'
import Stripe from 'stripe'
import { getStripeInstance } from '~/lib/stripe'
import { tagContact } from '~/lib/activecampaign'
import { sendOrderConfirmation } from '~/lib/brevo'
import { fireClickMagicPostback } from '~/lib/clickmagic'

// ── Supabase REST helpers ─────────────────────────────────────────────────────

function supabaseHeaders(serviceKey: string): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    Prefer: 'return=representation',
  }
}

async function supabasePatch(
  url: string,
  serviceKey: string,
  body: Record<string, unknown>
): Promise<void> {
  const res = await fetch(url, {
    method: 'PATCH',
    headers: supabaseHeaders(serviceKey),
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Supabase PATCH ${url}: ${res.status} ${text}`)
  }
}

async function supabaseInsert(
  url: string,
  serviceKey: string,
  body: Record<string, unknown>
): Promise<void> {
  const res = await fetch(url, {
    method: 'POST',
    headers: supabaseHeaders(serviceKey),
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Supabase POST ${url}: ${res.status} ${text}`)
  }
}

async function getOrderByPaymentIntent(
  supabaseUrl: string,
  serviceKey: string,
  paymentIntentId: string
): Promise<Record<string, unknown> | null> {
  const res = await fetch(
    `${supabaseUrl}/rest/v1/orders?stripe_payment_intent_id=eq.${encodeURIComponent(paymentIntentId)}&select=*`,
    { headers: supabaseHeaders(serviceKey) }
  )
  if (!res.ok) return null
  const rows = (await res.json()) as Record<string, unknown>[]
  return rows[0] ?? null
}

async function getOrderBySubscription(
  supabaseUrl: string,
  serviceKey: string,
  subscriptionId: string
): Promise<Record<string, unknown> | null> {
  const res = await fetch(
    `${supabaseUrl}/rest/v1/orders?stripe_subscription_id=eq.${encodeURIComponent(subscriptionId)}&select=*`,
    { headers: supabaseHeaders(serviceKey) }
  )
  if (!res.ok) return null
  const rows = (await res.json()) as Record<string, unknown>[]
  return rows[0] ?? null
}

async function isEventProcessed(
  supabaseUrl: string,
  serviceKey: string,
  stripeEventId: string
): Promise<boolean> {
  const res = await fetch(
    `${supabaseUrl}/rest/v1/processed_webhook_events?stripe_event_id=eq.${encodeURIComponent(stripeEventId)}&select=stripe_event_id`,
    { headers: supabaseHeaders(serviceKey) }
  )
  if (!res.ok) return false
  const rows = (await res.json()) as unknown[]
  return rows.length > 0
}

async function markEventProcessed(
  supabaseUrl: string,
  serviceKey: string,
  stripeEventId: string,
  eventType: string
): Promise<void> {
  await supabaseInsert(`${supabaseUrl}/rest/v1/processed_webhook_events`, serviceKey, {
    stripe_event_id: stripeEventId,
    event_type: eventType,
    processed_at: new Date().toISOString(),
  })
}

async function logEmailSend(
  supabaseUrl: string,
  serviceKey: string,
  orderId: string,
  recipientEmail: string,
  messageId: string,
  emailType: string
): Promise<void> {
  await supabaseInsert(`${supabaseUrl}/rest/v1/email_log`, serviceKey, {
    order_id: orderId,
    recipient_email: recipientEmail,
    message_id: messageId,
    email_type: emailType,
    sent_at: new Date().toISOString(),
  })
}

// ── Order items helper ────────────────────────────────────────────────────────

async function getOrderItems(
  supabaseUrl: string,
  serviceKey: string,
  orderId: string
): Promise<Record<string, unknown>[]> {
  const res = await fetch(
    `${supabaseUrl}/rest/v1/order_items?order_id=eq.${encodeURIComponent(orderId)}&select=*`,
    { headers: supabaseHeaders(serviceKey) }
  )
  if (!res.ok) return []
  return (await res.json()) as Record<string, unknown>[]
}

// ── Event handlers ────────────────────────────────────────────────────────────

/**
 * Handle payment_intent.succeeded
 *
 * Fires for one-time purchases. Updates the order to 'paid', sends
 * confirmation email, fires ClickMagic postback.
 */
async function handlePaymentIntentSucceeded(
  event: Stripe.Event,
  supabaseUrl: string,
  serviceKey: string
): Promise<void> {
  const paymentIntent = event.data.object as Stripe.PaymentIntent

  // Look up our Order record
  const order = await getOrderByPaymentIntent(supabaseUrl, serviceKey, paymentIntent.id)
  if (!order) {
    console.warn(`[stripe-webhook] No order found for PaymentIntent ${paymentIntent.id}`)
    return
  }

  const orderId = order['id'] as string

  // Update order status to 'paid'
  await supabasePatch(
    `${supabaseUrl}/rest/v1/orders?id=eq.${encodeURIComponent(orderId)}`,
    serviceKey,
    { status: 'paid', updated_at: new Date().toISOString() }
  )

  // Fetch order items for AC tagging + email
  const items = await getOrderItems(supabaseUrl, serviceKey, orderId)

  // Apply AC product tags for each purchased item
  const customerEmail = order['customer_email'] as string | undefined
  if (customerEmail) {
    const acTags = items
      .map((i) => i['ac_product_tag'])
      .filter((t): t is string => typeof t === 'string' && t.length > 0)

    if (acTags.length > 0) {
      try {
        await tagContact({ email: customerEmail, tags: acTags })
      } catch (err) {
        console.error('[stripe-webhook] AC tag error:', err)
      }
    }
  }

  // Send order confirmation email
  if (customerEmail) {
    try {
      const emailItems = items.map((item) => ({
        productName: (item['product_name'] as string) ?? 'Product',
        price: (item['unit_price'] as number) ?? 0,
        currency: (order['currency'] as string) ?? 'usd',
        type: (item['type'] as string) ?? 'one_time',
        filePaths: (item['file_paths'] as string[] | undefined) ?? [],
      }))

      const messageId = await sendOrderConfirmation({
        customerEmail,
        customerName: (order['customer_name'] as string) ?? customerEmail,
        orderNumber: (order['order_number'] as string) ?? orderId,
        summitName: (order['summit_name'] as string) ?? 'Summit',
        items: emailItems,
        amountTotal: (order['amount_total'] as number) ?? paymentIntent.amount,
        currency: (order['currency'] as string) ?? 'usd',
      })

      // Log the email send
      try {
        await logEmailSend(
          supabaseUrl,
          serviceKey,
          orderId,
          customerEmail,
          messageId,
          'order_confirmation'
        )
      } catch (err) {
        console.error('[stripe-webhook] Email log error:', err)
      }
    } catch (err) {
      console.error('[stripe-webhook] Brevo send error:', err)
    }
  }

  // Fire ClickMagic postback
  try {
    await fireClickMagicPostback({
      ref: (order['order_number'] as string) ?? orderId,
      amountCents: paymentIntent.amount,
      clickId: (order['clickmagic_click_id'] as string | undefined) ?? undefined,
    })
  } catch (err) {
    console.error('[stripe-webhook] ClickMagic error:', err)
  }
}

/**
 * Handle invoice.payment_succeeded
 *
 * Fires for subscription renewals. Updates order status and applies
 * AC tags but does not send another confirmation email (sent on first
 * payment only).
 */
async function handleInvoicePaymentSucceeded(
  event: Stripe.Event,
  supabaseUrl: string,
  serviceKey: string
): Promise<void> {
  const invoice = event.data.object as Stripe.Invoice
  const subscriptionId =
    typeof invoice.subscription === 'string'
      ? invoice.subscription
      : invoice.subscription?.id

  if (!subscriptionId) return

  const order = await getOrderBySubscription(supabaseUrl, serviceKey, subscriptionId)
  if (!order) {
    console.warn(`[stripe-webhook] No order found for subscription ${subscriptionId}`)
    return
  }

  const orderId = order['id'] as string
  const billingReason = invoice.billing_reason

  // Only update + email on initial payment (not renewals)
  const isInitialPayment = billingReason === 'subscription_create'

  await supabasePatch(
    `${supabaseUrl}/rest/v1/orders?id=eq.${encodeURIComponent(orderId)}`,
    serviceKey,
    { status: 'paid', updated_at: new Date().toISOString() }
  )

  if (isInitialPayment) {
    const customerEmail = order['customer_email'] as string | undefined
    if (customerEmail) {
      const items = await getOrderItems(supabaseUrl, serviceKey, orderId)

      const acTags = items
        .map((i) => i['ac_product_tag'])
        .filter((t): t is string => typeof t === 'string' && t.length > 0)

      if (acTags.length > 0) {
        try {
          await tagContact({ email: customerEmail, tags: acTags })
        } catch (err) {
          console.error('[stripe-webhook] AC tag error (subscription):', err)
        }
      }

      // Send confirmation for initial subscription payment
      try {
        const emailItems = items.map((item) => ({
          productName: (item['product_name'] as string) ?? 'Product',
          price: (item['unit_price'] as number) ?? 0,
          currency: (order['currency'] as string) ?? 'usd',
          type: 'subscription' as const,
          filePaths: (item['file_paths'] as string[] | undefined) ?? [],
        }))

        const messageId = await sendOrderConfirmation({
          customerEmail,
          customerName: (order['customer_name'] as string) ?? customerEmail,
          orderNumber: (order['order_number'] as string) ?? orderId,
          summitName: (order['summit_name'] as string) ?? 'Summit',
          items: emailItems,
          amountTotal: invoice.amount_paid,
          currency: (order['currency'] as string) ?? 'usd',
        })

        await logEmailSend(
          supabaseUrl,
          serviceKey,
          orderId,
          customerEmail,
          messageId,
          'order_confirmation_subscription'
        ).catch((err) => console.error('[stripe-webhook] Email log error:', err))
      } catch (err) {
        console.error('[stripe-webhook] Brevo send error (subscription):', err)
      }

      // ClickMagic postback for initial payment only
      try {
        await fireClickMagicPostback({
          ref: (order['order_number'] as string) ?? orderId,
          amountCents: invoice.amount_paid,
          clickId: (order['clickmagic_click_id'] as string | undefined) ?? undefined,
        })
      } catch (err) {
        console.error('[stripe-webhook] ClickMagic error (subscription):', err)
      }
    }
  }
}

/**
 * Handle customer.subscription.deleted
 *
 * Updates the order record to reflect the subscription cancellation.
 */
async function handleSubscriptionDeleted(
  event: Stripe.Event,
  supabaseUrl: string,
  serviceKey: string
): Promise<void> {
  const subscription = event.data.object as Stripe.Subscription

  const order = await getOrderBySubscription(supabaseUrl, serviceKey, subscription.id)
  if (!order) {
    console.warn(`[stripe-webhook] No order found for deleted subscription ${subscription.id}`)
    return
  }

  await supabasePatch(
    `${supabaseUrl}/rest/v1/orders?id=eq.${encodeURIComponent(order['id'] as string)}`,
    serviceKey,
    {
      status: 'subscription_cancelled',
      updated_at: new Date().toISOString(),
    }
  )
}

// ── Main handler ──────────────────────────────────────────────────────────────

export const POST: APIRoute = async ({ request }) => {
  const supabaseUrl = import.meta.env.SUPABASE_URL
  const serviceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY
  const webhookSecret = import.meta.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    console.error('[stripe-webhook] STRIPE_WEBHOOK_SECRET not configured')
    return new Response('Webhook secret not configured', { status: 500 })
  }

  // ── 1. Verify signature ────────────────────────────────────────────────────
  const signature = request.headers.get('stripe-signature')
  if (!signature) {
    return new Response('Missing stripe-signature header', { status: 400 })
  }

  let event: Stripe.Event
  const rawBody = await request.text()

  try {
    const stripe = getStripeInstance()
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[stripe-webhook] Signature verification failed:', msg)
    return new Response(`Webhook signature verification failed: ${msg}`, { status: 400 })
  }

  // ── 2. Idempotency check ───────────────────────────────────────────────────
  if (supabaseUrl && serviceKey) {
    try {
      const alreadyProcessed = await isEventProcessed(supabaseUrl, serviceKey, event.id)
      if (alreadyProcessed) {
        return new Response(JSON.stringify({ received: true, skipped: 'duplicate' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      }
    } catch (err) {
      console.error('[stripe-webhook] Idempotency check error:', err)
      // Continue — better to process twice than to drop
    }
  }

  // ── 3–8. Dispatch event ────────────────────────────────────────────────────
  try {
    if (supabaseUrl && serviceKey) {
      switch (event.type) {
        case 'payment_intent.succeeded':
          await handlePaymentIntentSucceeded(event, supabaseUrl, serviceKey)
          break

        case 'invoice.payment_succeeded':
          await handleInvoicePaymentSucceeded(event, supabaseUrl, serviceKey)
          break

        case 'customer.subscription.deleted':
          await handleSubscriptionDeleted(event, supabaseUrl, serviceKey)
          break

        default:
          // Unhandled event types — acknowledge receipt without processing
          break
      }

      // Mark as processed after successful handling
      await markEventProcessed(supabaseUrl, serviceKey, event.id, event.type)
    }
  } catch (err) {
    console.error(`[stripe-webhook] Unhandled error processing ${event.type}:`, err)
    // Return 200 so Stripe doesn't retry — log the error for manual investigation
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
