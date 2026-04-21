<?php

namespace App\Models;

use App\Enums\MediaCategory;
use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Image\Enums\Fit;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class MediaItem extends Model implements HasMedia
{
    use HasFactory, HasUuid, InteractsWithMedia;

    protected $fillable = [
        'domain_id',
        'category',
        'sub_category',
        'disk',
        'path',
        'file_name',
        'mime_type',
        'size',
        'width',
        'height',
        'caption',
        'alt_text',
        'created_by_user_id',
        'legacy_spatie_media_id',
    ];

    protected function casts(): array
    {
        return [
            'category' => MediaCategory::class,
        ];
    }

    public function domain(): BelongsTo
    {
        return $this->belongsTo(Domain::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(MediaItemAttachmentRow::class);
    }

    public function scopeForDomain(Builder $query, Domain $domain): Builder
    {
        return $query->where('domain_id', $domain->getKey());
    }

    public function scopeGlobal(Builder $query): Builder
    {
        return $query->whereNull('domain_id');
    }

    public function scopeVisibleTo(Builder $query, Domain $domain): Builder
    {
        return $query->where(function (Builder $q) use ($domain) {
            $q->where('domain_id', $domain->getKey())->orWhereNull('domain_id');
        });
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('file')
            ->singleFile()
            ->acceptsMimeTypes([
                'image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml',
                'application/pdf',
            ]);
    }

    public function registerMediaConversions(?Media $media = null): void
    {
        $this->addMediaConversion('thumb')
            ->fit(Fit::Contain, 320, 320)
            ->performOnCollections('file')
            ->nonOptimized();

        $this->addMediaConversion('preview')
            ->fit(Fit::Contain, 1200, 630)
            ->performOnCollections('file')
            ->nonOptimized();
    }

    public function url(): ?string
    {
        return $this->getFirstMediaUrl('file') ?: null;
    }

    public function thumbUrl(): ?string
    {
        return $this->getFirstMediaUrl('file', 'thumb') ?: null;
    }

    public function previewUrl(): ?string
    {
        return $this->getFirstMediaUrl('file', 'preview') ?: null;
    }

    public function isImage(): bool
    {
        $mime = $this->getFirstMedia('file')?->mime_type;

        return $mime !== null && str_starts_with($mime, 'image/');
    }
}
