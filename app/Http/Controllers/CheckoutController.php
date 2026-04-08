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
     * Called via POST /checkout/intent from the React checkout form.
     */
    public function createIntent(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'funnel_step_id' => ['required', 'integer', 'exists:funnel_steps,id'],
            'customer_email' => ['required', 'email'],
            'customer_name'  => ['nullable', 'string', 'max:255'],
        ]);

        $step = FunnelStep::with('product')->findOrFail($validated['funnel_step_id']);

        if (! $step->product) {
            return response()->json(['error' => 'No product attached to this step.'], 422);
        }

        $product = $step->product;

        // Create PaymentIntent on Stripe — price always comes from the DB, never the client
        $intent = $this->stripe->paymentIntents->create([
            'amount'               => $product->price,
            'currency'             => $product->currency,
            'receipt_email'        => $validated['customer_email'],
            'automatic_payment_methods' => ['enabled' => true],
            'metadata'             => [
                'funnel_step_id' => $step->id,
                'product_id'     => $product->id,
            ],
        ]);

        // Create pending order — updated to paid by the webhook
        Order::create([
            'product_id'               => $product->id,
            'funnel_step_id'           => $step->id,
            'customer_email'           => $validated['customer_email'],
            'customer_name'            => $validated['customer_name'],
            'amount'                   => $product->price,
            'currency'                 => $product->currency,
            'status'                   => 'pending',
            'stripe_payment_intent_id' => $intent->id,
        ]);

        return response()->json(['clientSecret' => $intent->client_secret]);
    }
}
