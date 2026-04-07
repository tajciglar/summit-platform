<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FunnelStep extends Model
{
    protected $fillable = ['funnel_id', 'title', 'slug', 'type', 'sort_order', 'is_active'];

    protected $casts = ['is_active' => 'boolean'];

    public function funnel(): BelongsTo
    {
        return $this->belongsTo(Funnel::class);
    }
}
