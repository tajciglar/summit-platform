<?php

namespace App\Http\Controllers;

use App\Models\FunnelStep;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Stripe\Exception\CardException;
use Stripe\StripeClient;

class UpsellController extends Controller
{
    public function __construct(private readonly StripeClient $stripe) {}

    public function charge(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'funnel_step_id' => ['required', 'string', 'exists:funnel_steps,id'],
            'original_payment_intent_id' => ['required', 'string'],
        ]);

        $step = FunnelStep::with('product.prices', 'funnel.summit')->findOrFail($validated['funnel_step_id']);

        if (! $step->product) {
            return response()->json(['error' => 'No product on this step.'], 422);
        }

        $summit = $step->funnel->summit;
        $price = $step->product->priceForPhase($summit->current_phase);

        if (! $price) {
            return response()->json(['error' => 'No price for current phase.'], 422);
        }

        // Verify ownership — the PI must match the session
        if (session('payment_intent_id') !== $validated['original_payment_intent_id']) {
            return response()->json(['error' => 'Invalid payment reference.'], 403);
        }

        // Find original order to get payment method
        $originalOrder = Order::where('stripe_payment_intent_id', $validated['original_payment_intent_id'])
            ->where('status', 'completed')
            ->firstOrFail();

        $originalIntent = $this->stripe->paymentIntents->retrieve($validated['original_payment_intent_id']);
        $customerId = $originalIntent->customer;
        $paymentMethodId = $originalIntent->payment_method;

        if (! $customerId || ! $paymentMethodId) {
            return response()->json(['error' => 'No saved payment method.'], 422);
        }

        try {
            $intent = $this->stripe->paymentIntents->create([
                'amount' => $price->amount_cents,
                'currency' => 'usd',
                'customer' => $customerId,
                'payment_method' => $paymentMethodId,
                'off_session' => true,
                'confirm' => true,
                'metadata' => [
                    'funnel_step_id' => $step->id,
                    'product_id' => $step->product_id,
                    'item_type' => $step->step_type === 'downsell' ? 'downsell' : 'upsell',
                ],
            ]);
        } catch (CardException $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }

        do {
            $orderNumber = 'SM-'.now()->format('Y').'-'.strtoupper(Str::random(8));
        } while (Order::where('order_number', $orderNumber)->exists());

        $order = Order::create([
            'order_number' => $orderNumber,
            'user_id' => $originalOrder->user_id,
            'summit_id' => $summit->id,
            'funnel_id' => $step->funnel_id,
            'funnel_step_id' => $step->id,
            'summit_phase_at_purchase' => $summit->current_phase,
            'status' => $intent->status === 'succeeded' ? 'completed' : 'pending',
            'subtotal_cents' => $price->amount_cents,
            'total_cents' => $price->amount_cents,
            'currency' => 'USD',
            'stripe_payment_intent_id' => $intent->id,
            'completed_at' => $intent->status === 'succeeded' ? now() : null,
        ]);

        $itemType = $step->step_type === 'downsell' ? 'downsell' : 'upsell';

        OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $step->product_id,
            'item_type' => $itemType,
            'product_name' => $step->product->name,
            'quantity' => 1,
            'unit_price_cents' => $price->amount_cents,
            'total_cents' => $price->amount_cents,
            'stripe_price_id' => $price->stripe_price_id,
        ]);

        return response()->json(['success' => true]);
    }
}
