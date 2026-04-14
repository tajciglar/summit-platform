<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FunnelGeneration extends Model
{
    use HasFactory;

    protected $fillable = [
        'summit_id', 'funnel_id', 'status', 'progress', 'current_step',
        'brief', 'architect_output', 'error_message', 'started_at', 'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'brief' => 'array',
            'architect_output' => 'array',
            'progress' => 'integer',
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    public function summit(): BelongsTo
    {
        return $this->belongsTo(Summit::class);
    }

    public function funnel(): BelongsTo
    {
        return $this->belongsTo(Funnel::class);
    }
}
