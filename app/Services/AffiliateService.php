<?php

namespace App\Services;

use App\Models\AffiliateCommission;
use App\Models\Order;

class AffiliateService
{
    /**
     * Create commission records for an order's affiliate.
     * Called after payment succeeds if order has an affiliate_id.
     */
    public function createCommissions(Order $order): void
    {
        if (! $order->affiliate_id) {
            return;
        }

        $order->loadMissing('affiliate', 'items');
        $affiliate = $order->affiliate;

        if (! $affiliate || ! $affiliate->is_active) {
            return;
        }

        foreach ($order->items as $item) {
            $commissionCents = (int) round($item->total_cents * $affiliate->commission_rate);

            AffiliateCommission::create([
                'affiliate_id' => $affiliate->id,
                'order_id' => $order->id,
                'order_item_id' => $item->id,
                'commission_rate' => $affiliate->commission_rate,
                'order_amount_cents' => $item->total_cents,
                'commission_cents' => $commissionCents,
                'status' => 'pending',
            ]);
        }
    }
}
