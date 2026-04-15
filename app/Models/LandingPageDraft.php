<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LandingPageDraft extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = [
        'batch_id',
        'version_number',
        'blocks',
        'status',
        'preview_token',
        'error_message',
        'sections',
        'published_html',
        'published_hydration_manifest',
    ];

    protected function casts(): array
    {
        return [
            'blocks' => 'array',
            'sections' => 'array',
            'published_hydration_manifest' => 'array',
        ];
    }

    public function batch(): BelongsTo
    {
        return $this->belongsTo(LandingPageBatch::class, 'batch_id');
    }

    public function buildSummitContext(): array
    {
        return $this->batch->summit->buildSummitContext();
    }
}
