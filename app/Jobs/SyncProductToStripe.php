<?php

namespace App\Jobs;

use App\Models\Product;
use App\Services\Stripe\StripeProductSyncService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Throwable;

class SyncProductToStripe implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public int $backoff = 30;

    public function __construct(public readonly string $productId) {}

    public function handle(StripeProductSyncService $service): void
    {
        $product = Product::query()->find($this->productId);

        if (! $product || ! $product->isSyncableToStripe()) {
            return;
        }

        try {
            $service->sync($product);

            $product->forceFill([
                'stripe_sync_status' => 'synced',
                'stripe_sync_error' => null,
                'stripe_synced_at' => now(),
            ])->save();
        } catch (Throwable $e) {
            $product->forceFill([
                'stripe_sync_status' => 'failed',
                'stripe_sync_error' => $e->getMessage(),
            ])->save();

            throw $e;
        }
    }
}
