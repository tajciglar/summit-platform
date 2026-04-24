<?php

namespace App\Services\Stripe;

use App\Models\Product;
use Stripe\StripeClient;

class StripeProductSyncService
{
    public const PHASES = ['pre', 'late_pre', 'during', 'post'];

    public function __construct(private readonly StripeClient $stripe) {}

    /**
     * Reconcile this Product's Stripe objects. Creates missing Product/Prices;
     * archives and recreates Prices whose cents value changed since last sync.
     */
    public function sync(Product $product): void
    {
        $this->ensureStripeProduct($product);

        foreach (self::PHASES as $phase) {
            $this->ensureStripePrice($product, $phase);
        }
    }

    private function ensureStripeProduct(Product $product): void
    {
        if ($product->stripe_product_id) {
            return;
        }

        $created = $this->stripe->products->create(
            [
                'name' => $product->name,
                'metadata' => ['internal_id' => (string) $product->id],
            ],
            ['idempotency_key' => "product-create-{$product->id}"],
        );

        $product->stripe_product_id = $created->id;
    }

    private function ensureStripePrice(Product $product, string $phase): void
    {
        $cents = $product->priceCentsForPhase($phase);
        $existingId = $product->stripePriceIdForPhase($phase);

        if ($cents === null) {
            return;
        }

        if ($existingId !== null) {
            return; // price-change reconciliation lands in Task 4
        }

        $params = [
            'product' => $product->stripe_product_id,
            'unit_amount' => $cents,
            'currency' => 'usd',
            'metadata' => [
                'internal_product_id' => (string) $product->id,
                'phase' => $phase,
            ],
        ];

        if ($product->billing_interval) {
            $params['recurring'] = ['interval' => $product->billing_interval];
        }

        $created = $this->stripe->prices->create(
            $params,
            ['idempotency_key' => "price-create-{$product->id}-{$phase}-{$cents}"],
        );

        $column = self::stripePriceColumn($phase);
        $product->{$column} = $created->id;
    }

    public static function stripePriceColumn(string $phase): string
    {
        return match ($phase) {
            'pre' => 'stripe_price_pre_id',
            'late_pre' => 'stripe_price_late_id',
            'during' => 'stripe_price_during_id',
            'post' => 'stripe_price_post_id',
            default => throw new \InvalidArgumentException("Unknown phase: {$phase}"),
        };
    }
}
