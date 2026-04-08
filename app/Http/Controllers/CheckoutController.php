<?php

namespace App\Http\Controllers;

use App\Models\FunnelStep;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Stripe\StripeClient;

class CheckoutController extends Controller
{
    public function __construct(private readonly StripeClient $stripe) {}

    /**
     * Create a Stripe PaymentIntent and a pending Order.
     * Reuses an existing PaymentIntent if one already exists for this session + step.
     */
    public function createIntent(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'funnel_step_id' => ['required', 'integer', 'exists:funnel_steps,id'],
            'customer_email' => ['required', 'email'],
            'customer_name' => ['nullable', 'string', 'max:255'],
        ]);

        $step = FunnelStep::with('product')->findOrFail($validated['funnel_step_id']);

        if (! $step->product) {
            return response()->json(['error' => 'No product attached to this step.'], 422);
        }

        $product = $step->product;

        // Reuse existing pending order for this session + step
        $existingOrder = Order::where('funnel_step_id', $step->id)
            ->where('customer_email', $validated['customer_email'])
            ->where('status', 'pending')
            ->first();

        if ($existingOrder && $existingOrder->stripe_payment_intent_id) {
            // Update metadata on the existing intent
            $this->stripe->paymentIntents->update($existingOrder->stripe_payment_intent_id, [
                'metadata' => [
                    'funnel_step_id' => $step->id,
                    'product_id' => $product->id,
                    'email' => $validated['customer_email'],
                ],
            ]);

            $intent = $this->stripe->paymentIntents->retrieve($existingOrder->stripe_payment_intent_id);
            session(['payment_intent_id' => $intent->id]);

            return response()->json([
                'clientSecret' => $intent->client_secret,
                'paymentIntentId' => $intent->id,
            ]);
        }

        // Idempotency key: based on step + email to prevent duplicate intents
        $idempotencyKey = 'pi_'.hash('sha256', $step->id.'|'.$validated['customer_email'].'|'.now()->format('Y-m-d'));

        // Create PaymentIntent — price always from DB, never from client
        $intent = $this->stripe->paymentIntents->create([
            'amount' => $product->price,
            'currency' => $product->currency,
            'receipt_email' => $validated['customer_email'],
            'automatic_payment_methods' => ['enabled' => true],
            'setup_future_usage' => 'off_session', // saves payment method for upsells
            'metadata' => [
                'funnel_step_id' => $step->id,
                'product_id' => $product->id,
                'email' => $validated['customer_email'],
            ],
        ], ['idempotency_key' => $idempotencyKey]);

        // Store in session so upsell pages can charge without exposing PI in URL
        session(['payment_intent_id' => $intent->id]);

        // Create pending order — updated to paid by the webhook
        Order::create([
            'product_id' => $product->id,
            'funnel_step_id' => $step->id,
            'customer_email' => $validated['customer_email'],
            'customer_name' => $validated['customer_name'],
            'amount' => $product->price,
            'currency' => $product->currency,
            'status' => 'pending',
            'stripe_payment_intent_id' => $intent->id,
        ]);

        return response()->json([
            'clientSecret' => $intent->client_secret,
            'paymentIntentId' => $intent->id,
        ]);
    }

    /**
     * Update metadata on an existing PaymentIntent (e.g. email/name before confirmation).
     */
    public function updateIntent(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'payment_intent_id' => ['required', 'string'],
            'customer_email' => ['nullable', 'email'],
            'customer_name' => ['nullable', 'string', 'max:255'],
        ]);

        $existing = $this->stripe->paymentIntents->retrieve($validated['payment_intent_id']);

        $this->stripe->paymentIntents->update($validated['payment_intent_id'], [
            'metadata' => array_merge(
                (array) $existing->metadata,
                array_filter([
                    'email' => $validated['customer_email'],
                    'name' => $validated['customer_name'],
                ]),
            ),
            ...($validated['customer_email'] ? ['receipt_email' => $validated['customer_email']] : []),
        ]);

        // Also update the local order
        Order::where('stripe_payment_intent_id', $validated['payment_intent_id'])
            ->update(array_filter([
                'customer_email' => $validated['customer_email'],
                'customer_name' => $validated['customer_name'],
            ]));

        return response()->json(['ok' => true]);
    }
}
