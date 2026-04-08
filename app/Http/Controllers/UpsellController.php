<?php

namespace App\Http\Controllers;

use App\Models\FunnelStep;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Stripe\StripeClient;

class UpsellController extends Controller
{
    public function __construct(private readonly StripeClient $stripe) {}

    /**
     * One-click upsell: charges the saved payment method from the original checkout.
     * No new card entry needed — the customer already paid once.
     */
    public function charge(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'funnel_step_id'           => ['required', 'integer', 'exists:funnel_steps,id'],
            'original_payment_intent_id' => ['required', 'string'],
        ]);

        // Find the original order to get the customer's Stripe info
        $originalOrder = Order::where('stripe_payment_intent_id', $validated['original_payment_intent_id'])
            ->where('status', 'paid')
            ->firstOrFail();

        // Get the upsell step and its product
        $step = FunnelStep::with('product')->findOrFail($validated['funnel_step_id']);

        if (! $step->product) {
            return response()->json(['error' => 'No product attached to this step.'], 422);
        }

        $product = $step->product;

        // Retrieve the original PaymentIntent to get customer + payment method
        $originalIntent = $this->stripe->paymentIntents->retrieve($validated['original_payment_intent_id']);
        $customerId     = $originalIntent->customer;
        $paymentMethodId = $originalIntent->payment_method;

        if (! $customerId || ! $paymentMethodId) {
            return response()->json(['error' => 'No saved payment method found.'], 422);
        }

        try {
            // Charge off-session with the saved payment method — no user interaction needed
            $upsellIntent = $this->stripe->paymentIntents->create([
                'amount'         => $product->price,
                'currency'       => $product->currency,
                'customer'       => $customerId,
                'payment_method' => $paymentMethodId,
                'off_session'    => true,
                'confirm'        => true,
                'metadata'       => [
                    'funnel_step_id' => $step->id,
                    'product_id'     => $product->id,
                    'email'          => $originalOrder->customer_email,
                    'upsell'         => 'true',
                ],
            ]);

            // Create the upsell order
            Order::create([
                'product_id'               => $product->id,
                'funnel_step_id'           => $step->id,
                'customer_email'           => $originalOrder->customer_email,
                'customer_name'            => $originalOrder->customer_name,
                'amount'                   => $product->price,
                'currency'                 => $product->currency,
                'status'                   => $upsellIntent->status === 'succeeded' ? 'paid' : 'pending',
                'stripe_payment_intent_id' => $upsellIntent->id,
                'stripe_customer_id'       => $customerId,
            ]);

            return response()->json(['success' => true]);
        } catch (\Stripe\Exception\CardException $e) {
            // Card declined — 3DS required or insufficient funds
            return response()->json(['error' => 'Payment failed: ' . $e->getMessage()], 402);
        }
    }
}
