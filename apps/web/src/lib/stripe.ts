/**
 * Stripe server-side helpers — server-only.
 *
 * This module initialises the Stripe Node.js SDK and provides typed
 * helper functions for the funnel's payment flow:
 *
 * 1. createPaymentIntent — initial checkout payment
 * 2. updatePaymentIntentAmount — order bump price adjustment
 * 3. confirmUpsell — one-click upsell using saved payment method
 * 4. createSetupIntent — save card details without immediate charge (subscriptions)
 * 5. createSubscription — create a recurring Stripe subscription
 *
 * NEVER import this module in client-side code. The STRIPE_SECRET_KEY
 * must not be exposed to the browser.
 */

import Stripe from 'stripe'
import type { Product } from '@summit/types'

let _stripe: Stripe | null = null

/**
 * Lazy Stripe singleton.
 * Initialised once on first call; subsequent calls return the cached instance.
 */
export function getStripeInstance(): Stripe {
  if (!_stripe) {
    const secretKey = import.meta.env.STRIPE_SECRET_KEY
    if (!secretKey) throw new Error('[stripe.ts] STRIPE_SECRET_KEY is not configured')
    _stripe = new Stripe(secretKey, { apiVersion: '2024-06-20', typescript: true })
  }
  return _stripe
}

/**
 * Convert a Product price (major currency units, e.g. 97.00) to Stripe
 * cents (integer, e.g. 9700). Rounds to avoid floating-point drift.
 */
export function toCents(price: number): number {
  return Math.round(price * 100)
}

// ─── PaymentIntent ──────────────────────────────────────────────────────────

export interface CreatePaymentIntentParams {
  products: Product[]
  /** If true, bump product is included in the initial amount. */
  includeBump?: boolean
  bumpProduct?: Product | null
  currency?: string
  /** Customer email — used to create/retrieve a Stripe Customer for upsell support. */
  customerEmail?: string
}

export interface CreatePaymentIntentResult {
  clientSecret: string
  paymentIntentId: string
  customerId: string
  amountCents: number
}

/**
 * Create a Stripe PaymentIntent for the checkout step.
 *
 * `setup_future_usage: 'off_session'` saves the payment method to the Customer
 * so it can be used for one-click upsells without the customer re-entering
 * their card details.
 */
export async function createPaymentIntent(
  params: CreatePaymentIntentParams
): Promise<CreatePaymentIntentResult> {
  const stripe = getStripeInstance()

  // Calculate total
  let amountCents = params.products.reduce((sum, p) => sum + toCents(p.price), 0)
  if (params.includeBump && params.bumpProduct) {
    amountCents += toCents(params.bumpProduct.price)
  }

  const currency = (params.currency ?? params.products[0]?.currency ?? 'eur').toLowerCase()

  // Create or retrieve Stripe Customer for future upsell charges
  let customerId: string
  if (params.customerEmail) {
    const existing = await stripe.customers.list({ email: params.customerEmail, limit: 1 })
    if (existing.data.length > 0 && existing.data[0]) {
      customerId = existing.data[0].id
    } else {
      const customer = await stripe.customers.create({ email: params.customerEmail })
      customerId = customer.id
    }
  } else {
    const customer = await stripe.customers.create()
    customerId = customer.id
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountCents,
    currency,
    customer: customerId,
    setup_future_usage: 'off_session',
    automatic_payment_methods: { enabled: true },
    metadata: {
      product_ids: params.products.map((p) => p.id).join(','),
      include_bump: String(params.includeBump ?? false),
    },
  })

  if (!paymentIntent.client_secret) {
    throw new Error('[stripe.ts] PaymentIntent has no client_secret')
  }

  return {
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
    customerId,
    amountCents,
  }
}

// ─── Order Bump ─────────────────────────────────────────────────────────────

export interface UpdatePaymentIntentAmountParams {
  paymentIntentId: string
  newAmountCents: number
}

/**
 * Update an existing PaymentIntent's amount (used when the order bump checkbox is toggled).
 * Returns the updated amount in cents.
 */
export async function updatePaymentIntentAmount(
  params: UpdatePaymentIntentAmountParams
): Promise<{ amountCents: number }> {
  const stripe = getStripeInstance()

  const updated = await stripe.paymentIntents.update(params.paymentIntentId, {
    amount: params.newAmountCents,
  })

  return { amountCents: updated.amount }
}

// ─── One-Click Upsell ───────────────────────────────────────────────────────

export interface ConfirmUpsellParams {
  /** PaymentIntent ID from the original purchase — used to retrieve the customer. */
  originalPaymentIntentId: string
  upsellProduct: Product
}

export interface ConfirmUpsellResult {
  success: boolean
  paymentIntentId?: string
  error?: string
}

/**
 * Process a one-click upsell using the payment method saved during checkout.
 *
 * Flow:
 * 1. Retrieve the original PaymentIntent to get the Customer ID
 * 2. List the Customer's saved payment methods
 * 3. Create a new PaymentIntent with `confirm: true` (no client interaction needed)
 * 4. Return success or error
 */
export async function confirmUpsell(params: ConfirmUpsellParams): Promise<ConfirmUpsellResult> {
  const stripe = getStripeInstance()

  try {
    // 1. Retrieve original PaymentIntent
    const original = await stripe.paymentIntents.retrieve(params.originalPaymentIntentId)
    const customerId = original.customer

    if (!customerId || typeof customerId !== 'string') {
      return { success: false, error: 'No customer found for original payment intent' }
    }

    // 2. Retrieve the saved payment method
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
      limit: 1,
    })

    if (!paymentMethods.data[0]) {
      return { success: false, error: 'No saved payment method found for customer' }
    }

    const paymentMethodId = paymentMethods.data[0].id
    const currency = params.upsellProduct.currency.toLowerCase()
    const amount = toCents(params.upsellProduct.price)

    // 3. Create and immediately confirm a new PaymentIntent
    const upsellIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      customer: customerId,
      payment_method: paymentMethodId,
      confirm: true,
      off_session: true,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never',
      },
      metadata: {
        product_id: params.upsellProduct.id,
        product_slug: params.upsellProduct.slug,
        is_upsell: 'true',
      },
    })

    if (upsellIntent.status === 'succeeded') {
      return { success: true, paymentIntentId: upsellIntent.id }
    }

    return { success: false, error: `PaymentIntent status: ${upsellIntent.status}` }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown Stripe error'
    return { success: false, error: message }
  }
}

// ─── Subscriptions ──────────────────────────────────────────────────────────

export interface CreateSetupIntentParams {
  /** Customer email — creates or retrieves a Stripe Customer. */
  customerEmail: string
}

export interface CreateSetupIntentResult {
  clientSecret: string
  customerId: string
  setupIntentId: string
}

/**
 * Create a Stripe SetupIntent to save a payment method without an immediate charge.
 *
 * Used in subscription checkout flows: collect the card first via the
 * SetupIntent client secret, then call createSubscription with the
 * confirmed payment method ID.
 */
export async function createSetupIntent(
  params: CreateSetupIntentParams
): Promise<CreateSetupIntentResult> {
  const stripe = getStripeInstance()

  // Create or retrieve Stripe Customer
  let customerId: string
  const existing = await stripe.customers.list({ email: params.customerEmail, limit: 1 })
  if (existing.data.length > 0 && existing.data[0]) {
    customerId = existing.data[0].id
  } else {
    const customer = await stripe.customers.create({ email: params.customerEmail })
    customerId = customer.id
  }

  const setupIntent = await stripe.setupIntents.create({
    customer: customerId,
    payment_method_types: ['card'],
    usage: 'off_session',
  })

  if (!setupIntent.client_secret) {
    throw new Error('[stripe.ts] SetupIntent has no client_secret')
  }

  return {
    clientSecret: setupIntent.client_secret,
    customerId,
    setupIntentId: setupIntent.id,
  }
}

export interface CreateSubscriptionParams {
  customerId: string
  /** Stripe Price ID from the Product record (e.g. 'price_1234'). */
  stripePriceId: string
  /** Payment method ID confirmed via SetupIntent. */
  paymentMethodId: string
}

export interface CreateSubscriptionResult {
  subscriptionId: string
  status: Stripe.Subscription.Status
  currentPeriodEnd: number
}

/**
 * Create a Stripe Subscription using a pre-confirmed payment method.
 *
 * Sets the payment method as the Customer's default and charges immediately
 * via `payment_behavior: 'error_if_incomplete'` so failed cards are caught
 * synchronously — no need for a separate invoice confirmation step.
 */
export async function createSubscription(
  params: CreateSubscriptionParams
): Promise<CreateSubscriptionResult> {
  const stripe = getStripeInstance()

  // Set as customer's default payment method
  await stripe.customers.update(params.customerId, {
    invoice_settings: { default_payment_method: params.paymentMethodId },
  })

  const subscription = await stripe.subscriptions.create({
    customer: params.customerId,
    items: [{ price: params.stripePriceId }],
    default_payment_method: params.paymentMethodId,
    payment_behavior: 'error_if_incomplete',
    expand: ['latest_invoice.payment_intent'],
  })

  return {
    subscriptionId: subscription.id,
    status: subscription.status,
    currentPeriodEnd: subscription.current_period_end,
  }
}
