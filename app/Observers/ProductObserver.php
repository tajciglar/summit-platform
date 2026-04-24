<?php

namespace App\Observers;

use App\Jobs\SyncProductToStripe;
use App\Models\Product;

class ProductObserver
{
    /**
     * Columns whose change must trigger a Stripe resync.
     *
     * Intentionally excluded:
     *  - `description`: Stripe Product.description is not currently synced after
     *    initial creation, so changing it locally has no Stripe-side effect.
     *  - `intro_price_cents` / `intro_period_months`: subscription intro pricing
     *    is deferred per the Stripe auto-provisioning spec's open questions.
     *  - `grants_vip_access`, `slug`, `product_type`, `tier`, etc.: internal-only
     *    fields with no Stripe counterpart.
     *
     * Note: `name` IS in the list, but the current service only writes it on
     * Product creation. Renames on an existing Stripe Product are a follow-up.
     */
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
