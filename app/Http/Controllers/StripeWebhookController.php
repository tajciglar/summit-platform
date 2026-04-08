<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Services\BrevoMailer;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Stripe\Exception\SignatureVerificationException;
use Stripe\Webhook;

class StripeWebhookController extends Controller
{
    public function __construct(private readonly BrevoMailer $mailer) {}

    public function handle(Request $request): Response
    {
        $payload = $request->getContent();
        $sig     = $request->header('Stripe-Signature');
        $secret  = config('services.stripe.webhook_secret');

        try {
            $event = Webhook::constructEvent($payload, $sig, $secret);
        } catch (SignatureVerificationException) {
            return response('Invalid signature.', 400);
        }

        match ($event->type) {
            'payment_intent.succeeded'      => $this->handlePaymentSucceeded($event->data->object),
            'payment_intent.payment_failed' => $this->handlePaymentFailed($event->data->object),
            default                         => null,
        };

        return response('OK', 200);
    }

    private function handlePaymentSucceeded(object $intent): void
    {
        $order = Order::where('stripe_payment_intent_id', $intent->id)->first();

        if (! $order || $order->status === 'paid') {
            return; // already processed or not found
        }

        $order->update([
            'status'              => 'paid',
            'stripe_customer_id'  => $intent->customer ?? null,
        ]);

        // Send confirmation email — non-blocking
        $this->mailer->sendOrderConfirmation($order);
    }

    private function handlePaymentFailed(object $intent): void
    {
        Order::where('stripe_payment_intent_id', $intent->id)
            ->update(['status' => 'failed']);
    }
}
