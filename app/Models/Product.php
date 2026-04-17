<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = [
        'summit_id',
        'category',
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
    ];

    protected function casts(): array
    {
        return [
            'grants_vip_access' => 'boolean',
            'is_active' => 'boolean',
        ];
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
