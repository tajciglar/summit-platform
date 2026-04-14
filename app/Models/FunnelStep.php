<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FunnelStep extends Model
{
    use HasFactory, HasUuid;

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

    /** Get the next published step in the same funnel. */
    public function nextPublishedStep(): ?self
    {
        return static::where('funnel_id', $this->funnel_id)
            ->where('sort_order', '>', $this->sort_order)
            ->where('is_published', true)
            ->orderBy('sort_order')
            ->first();
    }
}
