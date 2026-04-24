<?php

namespace App\Observers;

use App\Jobs\SyncProductToStripe;
use App\Models\Product;

class ProductObserver
{
    private const TRIGGER_COLUMNS = [
        'is_active',
        'name',
        'billing_interval',
        'stripe_product_id',
        'price_pre_summit_cents',
        'price_late_pre_cents',
        'price_during_cents',
        'price_post_summit_cents',
    ];

    public function created(Product $product): void
    {
        $this->dispatchIfSyncable($product);
    }

    public function updated(Product $product): void
    {
        $dirty = array_keys($product->getChanges());

        if (array_intersect($dirty, self::TRIGGER_COLUMNS) === []) {
            return;
        }

        $this->dispatchIfSyncable($product);
    }

    private function dispatchIfSyncable(Product $product): void
    {
        if (! $product->isSyncableToStripe()) {
            return;
        }

        SyncProductToStripe::dispatch($product->id);
    }
}
