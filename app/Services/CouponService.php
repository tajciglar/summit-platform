<?php

namespace App\Services;

use App\Models\Coupon;

class CouponService
{
    /**
     * Validate and return a coupon, or null if invalid.
     */
    public function validate(string $code, ?string $summitId = null, ?string $productId = null): ?Coupon
    {
        $coupon = Coupon::where('code', $code)->first();

        if (! $coupon || ! $coupon->isValid()) {
            return null;
        }

        // Check summit scope
        if ($coupon->summit_id && $coupon->summit_id !== $summitId) {
            return null;
        }

        // Check product scope
        if ($coupon->product_id && $coupon->product_id !== $productId) {
            return null;
        }

        return $coupon;
    }

    /**
     * Calculate the discount amount in cents.
     */
    public function calculateDiscount(Coupon $coupon, int $subtotalCents): int
    {
        if ($coupon->coupon_type === 'percentage') {
            return (int) round($subtotalCents * ($coupon->amount / 100));
        }

        // fixed_amount — amount is in cents
        return min($coupon->amount, $subtotalCents);
    }

    /**
     * Increment the coupon's usage count.
     */
    public function markUsed(Coupon $coupon): void
    {
        $coupon->increment('times_used');
    }
}
