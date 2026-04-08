<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class OrderBump extends Model
{
    protected $fillable = [
        'funnel_step_id', 'product_id', 'headline', 'description',
        'bullets', 'checkbox_label', 'image_url', 'sort_order', 'is_active',
    ];

    protected $casts = [
        'bullets' => 'array',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function funnelStep(): BelongsTo
    {
        return $this->belongsTo(FunnelStep::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function orders(): BelongsToMany
    {
        return $this->belongsToMany(Order::class, 'order_bump_order')
            ->withPivot('amount')
            ->withTimestamps();
    }
}
