<?php

namespace App\Models;

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
        'blocks',
        'sections',
        'published_html',
        'published_hydration_manifest',
        'status',
        'preview_token',
        'error_message',
    ];

    protected function casts(): array
    {
        return [
            'blocks' => 'array',
            'sections' => 'array',
            'published_hydration_manifest' => 'array',
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
