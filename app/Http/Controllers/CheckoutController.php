<?php

namespace App\Http\Controllers;

use App\Models\FunnelStep;
use App\Models\FunnelStepBump;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use App\Services\CouponService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Stripe\StripeClient;

class CheckoutController extends Controller
{
    public function __construct(
        private readonly StripeClient $stripe,
        private readonly CouponService $couponService,
    ) {}

    /**
     * Create a Stripe PaymentIntent and a pending Order with order items.
     */
    public function createIntent(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'funnel_step_id' => ['required', 'string', 'exists:funnel_steps,id'],
            'customer_email' => ['required', 'email'],
            'customer_name' => ['nullable', 'string', 'max:255'],
            'selected_bump_ids' => ['nullable', 'array'],
            'selected_bump_ids.*' => ['string', 'exists:funnel_step_bumps,id'],
            'coupon_code' => ['nullable', 'string', 'max:100'],
        ]);

        $step = FunnelStep::with('product.prices', 'funnel.summit')->findOrFail($validated['funnel_step_id']);

        if (! $step->product) {
            return response()->json(['error' => 'No product attached to this step.'], 422);
        }

        $summit = $step->funnel->summit;
        $product = $step->product;
        $price = $product->priceForPhase($summit->current_phase);

        if (! $price) {
            return response()->json(['error' => 'No price configured for current phase.'], 422);
        }

        // Calculate bump totals server-side
        $bumpIds = $validated['selected_bump_ids'] ?? [];
        $bumps = $bumpIds ? FunnelStepBump::with('product.prices')
            ->whereIn('id', $bumpIds)
            ->where('funnel_step_id', $step->id)
            ->where('is_active', true)
            ->get() : collect();

        $bumpTotal = $bumps->sum(fn ($bump) => $bump->product->priceForPhase($summit->current_phase)?->amount_cents ?? 0);
        $subtotalCents = $price->amount_cents + $bumpTotal;

        // Apply coupon if provided
        $coupon = null;
        $discountCents = 0;
        if ($validated['coupon_code'] ?? null) {
            $coupon = $this->couponService->validate($validated['coupon_code'], $summit->id, $product->id);
            if (! $coupon) {
                return response()->json(['error' => 'Invalid or expired coupon code.'], 422);
            }
            $discountCents = $this->couponService->calculateDiscount($coupon, $subtotalCents);
        }

        $totalCents = max(0, $subtotalCents - $discountCents);

        // Idempotency key
        $idempotencyKey = 'pi_'.hash('sha256', $step->id.'|'.$validated['customer_email'].'|'.now()->format('Y-m-d'));

        $intent = $this->stripe->paymentIntents->create([
            'amount' => $totalCents,
            'currency' => 'usd',
            'receipt_email' => $validated['customer_email'],
            'automatic_payment_methods' => ['enabled' => true],
            'setup_future_usage' => 'off_session',
            'metadata' => [
                'funnel_step_id' => $step->id,
                'product_id' => $product->id,
                'email' => $validated['customer_email'],
                'selected_bumps' => implode(',', $bumpIds),
            ],
        ], ['idempotency_key' => $idempotencyKey]);

        session(['payment_intent_id' => $intent->id]);

        // Find or create user
        $user = User::firstOrCreate(
            ['email' => $validated['customer_email']],
            ['name' => $validated['customer_name'] ?? '', 'password' => bcrypt(Str::random(32))]
        );

        $orderNumber = 'SM-'.now()->format('Y').'-'.strtoupper(Str::random(6));

        $order = Order::create([
            'order_number' => $orderNumber,
            'user_id' => $user->id,
            'summit_id' => $summit->id,
            'funnel_id' => $step->funnel_id,
            'funnel_step_id' => $step->id,
            'summit_phase_at_purchase' => $summit->current_phase,
            'status' => 'pending',
            'subtotal_cents' => $subtotalCents,
            'discount_cents' => $discountCents,
            'total_cents' => $totalCents,
            'coupon_id' => $coupon?->id,
            'currency' => 'USD',
            'affiliate_id' => $request->cookie('affiliate_ref'),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'utm_source' => $request->input('utm_source'),
            'utm_medium' => $request->input('utm_medium'),
            'utm_campaign' => $request->input('utm_campaign'),
            'utm_content' => $request->input('utm_content'),
            'utm_term' => $request->input('utm_term'),
            'stripe_payment_intent_id' => $intent->id,
        ]);

        // Primary order item
        OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'item_type' => 'primary',
            'product_name' => $product->name,
            'quantity' => 1,
            'unit_price_cents' => $price->amount_cents,
            'total_cents' => $price->amount_cents,
            'stripe_price_id' => $price->stripe_price_id,
        ]);

        // Bump order items
        foreach ($bumps as $bump) {
            $bumpPrice = $bump->product->priceForPhase($summit->current_phase);
            if ($bumpPrice) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $bump->product_id,
                    'item_type' => 'bump',
                    'product_name' => $bump->product->name,
                    'quantity' => 1,
                    'unit_price_cents' => $bumpPrice->amount_cents,
                    'total_cents' => $bumpPrice->amount_cents,
                    'stripe_price_id' => $bumpPrice->stripe_price_id,
                ]);
            }
        }

        return response()->json([
            'clientSecret' => $intent->client_secret,
            'paymentIntentId' => $intent->id,
        ]);
    }

    /**
     * Update metadata on an existing PaymentIntent.
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

        return response()->json(['ok' => true]);
    }
}
