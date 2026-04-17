<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FunnelStepRevision extends Model
{
    use HasFactory, HasUuid;

    public $timestamps = false;   // only created_at, set by DB default

    protected $fillable = [
        'funnel_step_id',
        'page_content_snapshot',
        'published_at',
        'published_by',
    ];

    protected function casts(): array
    {
        return [
            'page_content_snapshot' => 'array',
            'published_at' => 'datetime',
            'created_at' => 'datetime',
        ];
    }

    public function funnelStep(): BelongsTo
    {
        return $this->belongsTo(FunnelStep::class);
    }

    public function publisher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'published_by');
    }
}
