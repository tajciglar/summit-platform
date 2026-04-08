<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FunnelStepBump extends Model
{
    use HasUuid;

    public $timestamps = false;

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
}
