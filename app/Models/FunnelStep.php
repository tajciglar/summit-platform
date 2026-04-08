<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FunnelStep extends Model
{
    use HasUuid;

    protected $fillable = [
        'funnel_id', 'step_type', 'template', 'slug', 'name',
        'content', 'sort_order', 'product_id', 'is_published',
    ];

    protected $casts = [
        'content' => 'array',
        'is_published' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function funnel(): BelongsTo
    {
        return $this->belongsTo(Funnel::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function bumps(): HasMany
    {
        return $this->hasMany(FunnelStepBump::class)->orderBy('sort_order');
    }
}
