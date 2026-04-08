<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FunnelStep extends Model
{
    protected $fillable = [
        'funnel_id', 'product_id', 'title', 'slug', 'type', 'template',
        'sort_order', 'is_active', 'is_published', 'headline', 'content',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_published' => 'boolean',
        'content' => 'array',
    ];

    public function funnel(): BelongsTo
    {
        return $this->belongsTo(Funnel::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function orderBumps(): HasMany
    {
        return $this->hasMany(OrderBump::class)->orderBy('sort_order');
    }
}
