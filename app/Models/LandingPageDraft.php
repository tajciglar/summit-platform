<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LandingPageDraft extends Model
{
    use HasUuid;

    protected $fillable = [
        'batch_id',
        'version_number',
        'blocks',
        'status',
        'preview_token',
        'error_message',
    ];

    protected function casts(): array
    {
        return [
            'blocks' => 'array',
        ];
    }

    public function batch(): BelongsTo
    {
        return $this->belongsTo(LandingPageBatch::class, 'batch_id');
    }
}
