<?php

namespace App\Models;

use App\Enums\LandingPageDraftStatus;
use App\Enums\SummitAudience;
use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class LandingPageDraft extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = [
        'batch_id',
        'version_number',
        'template_key',
        'blocks',
        'sections',
        'enabled_sections',
        'audience',
        'palette',
        'published_html',
        'published_hydration_manifest',
        'status',
        'preview_token',
        'error_message',
        'token_count',
        'generation_ms',
    ];

    protected function casts(): array
    {
        return [
            'blocks' => 'array',
            'sections' => 'array',
            'enabled_sections' => 'array',
            'status' => LandingPageDraftStatus::class,
            'audience' => SummitAudience::class,
            'palette' => 'array',
            'published_hydration_manifest' => 'array',
            'token_count' => 'integer',
            'generation_ms' => 'integer',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (LandingPageDraft $draft): void {
            $draft->preview_token ??= Str::random(40);
        });
    }

    public function batch(): BelongsTo
    {
        return $this->belongsTo(LandingPageBatch::class, 'batch_id');
    }
}
