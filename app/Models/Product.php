<?php

namespace App\Models;

use App\Models\Concerns\HasMediaAttachments;
use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use HasFactory, HasMediaAttachments, HasUuid;

    protected $fillable = [
        'summit_id',
        'category',
        'kind',
        'slug',
        'name',
        'description',
        'product_type',
        'billing_interval',
        'tier',
        'grants_vip_access',
        'is_active',
        'stripe_product_id',
        'price_pre_summit_cents',
        'price_late_pre_cents',
        'price_during_cents',
        'price_post_summit_cents',
        'compare_pre_summit_cents',
        'compare_late_pre_cents',
        'compare_during_cents',
        'compare_post_summit_cents',
        'stripe_price_pre_id',
        'stripe_price_late_id',
        'stripe_price_during_id',
        'stripe_price_post_id',
        'intro_price_cents',
        'intro_period_months',
        'bundled_product_ids',
        'combo_discount_cents',
    ];

    protected function casts(): array
    {
        return [
            'grants_vip_access' => 'boolean',
            'is_active' => 'boolean',
            'bundled_product_ids' => 'array',
        ];
    }

    /**
     * Products bundled inside this combo. Empty for non-combo products.
     */
    public function bundledProducts()
    {
        $ids = $this->bundled_product_ids ?? [];

        return self::query()->whereIn('id', $ids)->get();
    }

    /**
     * Stripe line items to send at checkout. For standalone/bump/upsell: one
     * item with this product's own stripe_price_id. For combos: one per child.
     *
     * @return array<int, array{product_id:string, product_name:string, stripe_price_id:?string, unit_price_cents:?int}>
     */
    public function checkoutLineItemsForPhase(string $phase): array
    {
        if ($this->kind === 'combo') {
            return $this->bundledProducts()
                ->map(fn (self $child) => [
                    'product_id' => $child->id,
                    'product_name' => $child->name,
                    'stripe_price_id' => $child->stripePriceIdForPhase($phase),
                    'unit_price_cents' => $child->priceCentsForPhase($phase),
                ])
                ->values()
                ->all();
        }

        return [[
            'product_id' => $this->id,
            'product_name' => $this->name,
            'stripe_price_id' => $this->stripePriceIdForPhase($phase),
            'unit_price_cents' => $this->priceCentsForPhase($phase),
        ]];
    }

    /**
     * Sum of children's phase prices, before the combo-level discount.
     */
    public function comboBaseCentsForPhase(string $phase): int
    {
        if ($this->kind !== 'combo') {
            return (int) ($this->priceCentsForPhase($phase) ?? 0);
        }

        return (int) collect($this->checkoutLineItemsForPhase($phase))
            ->sum(fn (array $item) => (int) ($item['unit_price_cents'] ?? 0));
    }

    /**
     * What the customer actually pays for this combo: base − discount (never negative).
     */
    public function comboTotalCentsForPhase(string $phase): int
    {
        $base = $this->comboBaseCentsForPhase($phase);

        return max(0, $base - (int) ($this->combo_discount_cents ?? 0));
    }

    /**
     * Unified "display price" for any product kind, for tables/cards.
     */
    public function displayPriceCentsForPhase(string $phase): ?int
    {
        if ($this->kind === 'combo') {
            return $this->comboTotalCentsForPhase($phase);
        }

        return $this->priceCentsForPhase($phase);
    }

    public function summit(): BelongsTo
    {
        return $this->belongsTo(Summit::class);
    }

    public function funnelSteps(): HasMany
    {
        return $this->hasMany(FunnelStep::class);
    }

    public function orderBumps(): HasMany
    {
        return $this->hasMany(FunnelStepBump::class);
    }

    public function priceCentsForPhase(string $phase): ?int
    {
        return match ($phase) {
            'pre' => $this->price_pre_summit_cents,
            'late_pre' => $this->price_late_pre_cents,
            'during' => $this->price_during_cents,
            'post' => $this->price_post_summit_cents,
            default => null,
        };
    }

    public function stripePriceIdForPhase(string $phase): ?string
    {
        return match ($phase) {
            'pre' => $this->stripe_price_pre_id,
            'late_pre' => $this->stripe_price_late_id,
            'during' => $this->stripe_price_during_id,
            'post' => $this->stripe_price_post_id,
            default => null,
        };
    }
}
