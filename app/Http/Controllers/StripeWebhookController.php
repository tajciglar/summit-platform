<?php

namespace App\Http\Controllers;

use App\Jobs\SendOrderConfirmationEmail;
use App\Jobs\SyncToActiveCampaign;
use App\Models\Order;
use App\Models\Refund;
use App\Models\Subscription;
use App\Services\AffiliateService;
use App\Services\ContentAccessService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Stripe\Exception\SignatureVerificationException;
use Stripe\Webhook;

class StripeWebhookController extends Controller
{
    public function __construct(
        private readonly ContentAccessService $contentAccess,
        private readonly AffiliateService $affiliateService,
    ) {}

    public function handle(Request $request): Response
    {
        $payload = $request->getContent();
        $sig = $request->header('Stripe-Signature');
        $secret = config('services.stripe.webhook_secret');

        try {
            $event = Webhook::constructEvent($payload, $sig, $secret);
        } catch (SignatureVerificationException) {
            return response('Invalid signature.', 400);
        }

        match ($event->type) {
            'payment_intent.succeeded' => $this->handlePaymentSucceeded($event->data->object),
            'payment_intent.payment_failed' => $this->handlePaymentFailed($event->data->object),
            'customer.subscription.created' => $this->handleSubscriptionCreated($event->data->object),
            'customer.subscription.updated' => $this->handleSubscriptionUpdated($event->data->object),
            'customer.subscription.deleted' => $this->handleSubscriptionDeleted($event->data->object),
            'invoice.payment_failed' => $this->handleInvoiceFailed($event->data->object),
            'charge.refunded' => $this->handleChargeRefunded($event->data->object),
            default => null,
        };

        return response('OK', 200);
    }

    private function handlePaymentSucceeded(object $intent): void
    {
        $order = Order::where('stripe_payment_intent_id', $intent->id)->first();

        if (! $order || $order->status === 'completed') {
            return;
        }

        $order->update([
            'status' => 'completed',
            'completed_at' => now(),
        ]);

        if ($intent->customer && $order->user) {
            $order->user->update(['stripe_customer_id' => $intent->customer]);
        }

        // Increment coupon usage
        if ($order->coupon_id) {
            $order->loadMissing('coupon');
            $order->coupon?->increment('times_used');
        }

        // Grant content access if product grants VIP
        $order->loadMissing('items.product', 'user');
        foreach ($order->items as $item) {
            if ($item->product && $item->product->grants_vip_access && $order->summit_id) {
                $this->contentAccess->grantAccess(
                    $order->user,
                    $order->summit_id,
                    'vip',
                    $order->id,
                );
            }
        }

        // Create affiliate commissions if order has affiliate
        $this->affiliateService->createCommissions($order);

        SendOrderConfirmationEmail::dispatch($order);
        dispatch(SyncToActiveCampaign::fromOrder($order));
    }

    private function handlePaymentFailed(object $intent): void
    {
        Order::where('stripe_payment_intent_id', $intent->id)
            ->update(['status' => 'failed']);
    }

    private function handleSubscriptionCreated(object $sub): void
    {
        // Find the order that initiated this subscription
        $order = Order::where('stripe_checkout_session_id', $sub->metadata?->checkout_session_id ?? '')
            ->orWhere('stripe_payment_intent_id', $sub->latest_invoice?->payment_intent ?? '')
            ->first();

        if (! $order) {
            return;
        }

        Subscription::updateOrCreate(
            ['stripe_subscription_id' => $sub->id],
            [
                'user_id' => $order->user_id,
                'product_id' => $order->items->first()?->product_id,
                'order_id' => $order->id,
                'status' => $sub->status,
                'current_period_start' => isset($sub->current_period_start) ? Carbon::createFromTimestamp($sub->current_period_start) : null,
                'current_period_end' => isset($sub->current_period_end) ? Carbon::createFromTimestamp($sub->current_period_end) : null,
            ],
        );
    }

    private function handleSubscriptionUpdated(object $sub): void
    {
        $subscription = Subscription::where('stripe_subscription_id', $sub->id)->first();

        if (! $subscription) {
            return;
        }

        $subscription->update([
            'status' => $sub->status,
            'current_period_start' => isset($sub->current_period_start) ? Carbon::createFromTimestamp($sub->current_period_start) : null,
            'current_period_end' => isset($sub->current_period_end) ? Carbon::createFromTimestamp($sub->current_period_end) : null,
        ]);
    }

    private function handleSubscriptionDeleted(object $sub): void
    {
        Subscription::where('stripe_subscription_id', $sub->id)
            ->update([
                'status' => 'canceled',
                'canceled_at' => now(),
            ]);
    }

    private function handleInvoiceFailed(object $invoice): void
    {
        // invoice.payment_failed → set subscription to past_due → access denied immediately
        if ($invoice->subscription) {
            Subscription::where('stripe_subscription_id', $invoice->subscription)
                ->update(['status' => 'past_due']);
        }
    }

    private function handleChargeRefunded(object $charge): void
    {
        $order = Order::where('stripe_payment_intent_id', $charge->payment_intent)->first();

        if (! $order) {
            return;
        }

        $refundAmount = $charge->amount_refunded ?? 0;
        $isFullRefund = $refundAmount >= $order->total_cents;

        $order->update([
            'status' => $isFullRefund ? 'refunded' : 'partially_refunded',
        ]);

        // Create refund record
        Refund::create([
            'order_id' => $order->id,
            'amount_cents' => $refundAmount,
            'reason' => 'requested',
            'stripe_refund_id' => $charge->refunds?->data[0]?->id ?? null,
        ]);
    }
}
