<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SummitPhaseSchedule extends Model
{
    use HasUuid;

    public $timestamps = false;

    protected $fillable = ['summit_id', 'phase', 'starts_at', 'ends_at'];

    protected $casts = [
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
    ];

    public function summit(): BelongsTo
    {
        return $this->belongsTo(Summit::class);
    }
}
