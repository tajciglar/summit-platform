<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VideoView extends Model
{
    use HasUuid;

    public $timestamps = false;

    protected $fillable = [
        'session_id', 'user_id', 'summit_speaker_id',
        'video_type', 'watch_duration_secs', 'completed', 'ip_address',
    ];

    protected $casts = [
        'watch_duration_secs' => 'integer',
        'completed' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function summitSpeaker(): BelongsTo
    {
        return $this->belongsTo(SummitSpeaker::class);
    }
}
