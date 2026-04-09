<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SummitCampaignActivity extends Model
{
    use HasUuid;

    protected $fillable = [
        'summit_id', 'activity_type', 'label', 'starts_at', 'ends_at',
        'color', 'sort_order', 'notes',
    ];

    protected $casts = [
        'starts_at' => 'date',
        'ends_at' => 'date',
        'sort_order' => 'integer',
    ];

    public function summit(): BelongsTo
    {
        return $this->belongsTo(Summit::class);
    }
}
