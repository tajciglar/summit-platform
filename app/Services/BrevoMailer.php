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

        $order->loadMissing('user', 'items.product');

        if (! $order->user?->email) {
            Log::warning('Order has no associated user email — skipping confirmation.', ['order_id' => $order->id]);

            return;
        }

        $email = $order->user->email;
        $name = $order->user->name ?? '';

        try {
            Http::withHeaders([
                'api-key' => $apiKey,
                'Content-Type' => 'application/json',
            ])->post('https://api.brevo.com/v3/smtp/email', [
                'sender' => [
                    'name' => config('services.brevo.from_name', config('app.name')),
                    'email' => config('services.brevo.from_email', 'noreply@example.com'),
                ],
                'to' => [['email' => $email, 'name' => $name]],
                'subject' => 'Order Confirmation — '.$this->productSummary($order),
                'htmlContent' => $this->buildHtml($order),
            ]);

            Log::info('Order confirmation email sent', ['order_id' => $order->id, 'email' => $email]);
        } catch (\Throwable $e) {
            // Non-blocking: email failure must not break the webhook
            Log::error('Failed to send order confirmation email', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    private function productSummary(Order $order): string
    {
        $names = $order->items->map(fn ($item) => $item->product?->name)->filter()->values();

        return $names->isNotEmpty() ? $names->implode(', ') : 'Your Purchase';
    }

    private function buildHtml(Order $order): string
    {
        $productName = $this->productSummary($order);
        $amount = number_format($order->total_cents / 100, 2);
        $currency = strtoupper($order->currency);
        $name = $order->user->name ?? 'there';

        $itemsHtml = '';
        foreach ($order->items as $item) {
            $itemName = $item->product?->name ?? $item->item_type;
            $itemAmount = number_format($item->unit_price_cents / 100, 2);
            $itemsHtml .= "<p style=\"margin: 4px 0;\"><span style=\"font-weight: 600;\">{$itemName}</span> — \${$itemAmount} {$currency}</p>";
        }

        if (! $itemsHtml) {
            $itemsHtml = "<p style=\"margin: 0; font-weight: 600;\">{$productName}</p>";
        }

        return <<<HTML
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
            <h1 style="font-size: 24px; color: #111;">Thank you, {$name}!</h1>
            <p style="color: #555; line-height: 1.6;">Your order has been confirmed.</p>
            <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin: 24px 0;">
                {$itemsHtml}
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 12px 0;">
                <p style="margin: 0; font-weight: 600;">Total: \${$amount} {$currency}</p>
            </div>
            <p style="color: #9ca3af; font-size: 13px;">If you have any questions, reply to this email.</p>
        </div>
        HTML;
    }
}
