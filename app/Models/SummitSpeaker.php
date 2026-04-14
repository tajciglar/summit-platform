<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SummitSpeaker extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = [
        'summit_id', 'speaker_id', 'masterclass_title', 'masterclass_description',
        'rating', 'free_video_url', 'vip_video_url', 'presentation_day',
        'sort_order', 'is_featured', 'free_access_window_hours',
    ];

    protected $casts = [
        'rating' => 'integer',
        'sort_order' => 'integer',
        'is_featured' => 'boolean',
        'free_access_window_hours' => 'integer',
        'presentation_day' => 'date',
    ];

    public function summit(): BelongsTo
    {
        return $this->belongsTo(Summit::class);
    }

    public function speaker(): BelongsTo
    {
        return $this->belongsTo(Speaker::class);
    }
}
