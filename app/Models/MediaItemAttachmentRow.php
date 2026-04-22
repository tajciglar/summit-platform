<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class MediaItemAttachmentRow extends Model
{
    use HasUuid;

    protected $table = 'media_item_attachments';

    protected $fillable = [
        'media_item_id', 'attachable_id', 'attachable_type', 'role', 'sort_order',
    ];

    public function mediaItem(): BelongsTo
    {
        return $this->belongsTo(MediaItem::class);
    }

    public function attachable(): MorphTo
    {
        return $this->morphTo();
    }
}
