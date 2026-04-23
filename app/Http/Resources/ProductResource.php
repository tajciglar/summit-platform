<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Price is resolved for `ProductResource::$phase` (caller sets this before
 * building a collection). Fields fall back to null if the product has no
 * price for that phase.
 */
class ProductResource extends JsonResource
{
    public static ?string $phase = null;

    public function toArray(Request $request): array
    {
        $price = method_exists($this->resource, 'priceForPhase') && self::$phase
            ? $this->priceForPhase(self::$phase)
            : null;

        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'amountCents' => $price?->amount_cents,
            'compareAtCents' => $price?->compare_at_cents,
            'stripePriceId' => $price?->stripe_price_id,
        ];
    }
}
