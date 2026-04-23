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
        'funnel_id',
        'step_type',
        'slug',
        'name',
        'page_content',
        'page_overrides',
        'sort_order',
        'product_id',
        'is_published',
    ];

    protected function casts(): array
    {
        return [
            'page_content' => 'array',
            'page_overrides' => 'array',
            'is_published' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

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

    public function landingPageBatches(): HasMany
    {
        return $this->hasMany(LandingPageBatch::class);
    }

    public function revisions(): HasMany
    {
        return $this->hasMany(FunnelStepRevision::class)->orderBy('created_at', 'desc');
    }
}
