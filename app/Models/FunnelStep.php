<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FunnelStep extends Model
{
    protected $fillable = ['funnel_id', 'product_id', 'title', 'slug', 'type', 'sort_order', 'is_active', 'is_published', 'headline'];

    protected $casts = ['is_active' => 'boolean', 'is_published' => 'boolean'];

    public function funnel(): BelongsTo
    {
        return $this->belongsTo(Funnel::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
