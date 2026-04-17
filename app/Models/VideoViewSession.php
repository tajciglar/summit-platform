<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VideoViewSession extends Model
{
    use HasUuid;

    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'speaker_id',
        'started_at',
        'expires_at',
        'last_heartbeat_at',
    ];

    protected function casts(): array
    {
        return [
            'started_at' => 'datetime',
            'expires_at' => 'datetime',
            'last_heartbeat_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function speaker(): BelongsTo
    {
        return $this->belongsTo(Speaker::class);
    }

    public function hasExpired(): bool
    {
        return now()->gte($this->expires_at);
    }
}
