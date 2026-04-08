<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class BrevoMailer
{
    /**
     * Send an order confirmation email via Brevo transactional API.
     */
    public function sendOrderConfirmation(Order $order): void
    {
        $apiKey = config('services.brevo.api_key');

        if (! $apiKey) {
            Log::warning('Brevo API key not configured — skipping order confirmation email.');

            return;
        }

        $order->loadMissing('product');

        try {
            Http::withHeaders([
                'api-key' => $apiKey,
                'Content-Type' => 'application/json',
            ])->post('https://api.brevo.com/v3/smtp/email', [
                'sender' => [
                    'name' => config('services.brevo.from_name', config('app.name')),
                    'email' => config('services.brevo.from_email', 'noreply@example.com'),
                ],
                'to' => [['email' => $order->customer_email, 'name' => $order->customer_name ?? '']],
                'subject' => 'Order Confirmation — '.($order->product->name ?? 'Your Purchase'),
                'htmlContent' => $this->buildHtml($order),
            ]);

            Log::info('Order confirmation email sent', ['order_id' => $order->id, 'email' => $order->customer_email]);
        } catch (\Throwable $e) {
            // Non-blocking: email failure must not break the webhook
            Log::error('Failed to send order confirmation email', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    private function buildHtml(Order $order): string
    {
        $productName = $order->product->name ?? 'Your purchase';
        $amount = number_format($order->amount / 100, 2);
        $currency = strtoupper($order->currency);
        $name = $order->customer_name ?? 'there';

        return <<<HTML
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
            <h1 style="font-size: 24px; color: #111;">Thank you, {$name}!</h1>
            <p style="color: #555; line-height: 1.6;">Your order has been confirmed.</p>
            <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin: 24px 0;">
                <p style="margin: 0; font-weight: 600;">{$productName}</p>
                <p style="margin: 4px 0 0; color: #6b7280;">\${$amount} {$currency}</p>
            </div>
            <p style="color: #9ca3af; font-size: 13px;">If you have any questions, reply to this email.</p>
        </div>
        HTML;
    }
}
