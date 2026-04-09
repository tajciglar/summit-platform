<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use HasUuid;

    protected $fillable = [
        'summit_id', 'category_id', 'slug', 'name', 'description',
        'product_type', 'billing_interval', 'billing_interval_count',
        'tier', 'grants_vip_access', 'is_active', 'stripe_product_id',
        'intro_price_cents', 'intro_period_months', 'activecampaign_tag_id',
    ];

    protected $casts = [
        'grants_vip_access' => 'boolean',
        'is_active' => 'boolean',
        'billing_interval_count' => 'integer',
        'intro_price_cents' => 'integer',
        'intro_period_months' => 'integer',
    ];

    public function summit(): BelongsTo
    {
        return $this->belongsTo(Summit::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(ProductCategory::class, 'category_id');
    }

    public function prices(): HasMany
    {
        return $this->hasMany(ProductPrice::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /** Get price for a specific summit phase. */
    public function priceForPhase(string $phase): ?ProductPrice
    {
        return $this->prices()->where('summit_phase', $phase)->first();
    }
}
