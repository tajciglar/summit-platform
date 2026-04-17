<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Image\Enums\Fit;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class Speaker extends Model implements HasMedia
{
    use HasFactory, HasUuid, InteractsWithMedia;

    protected $fillable = [
        'summit_id',
        'slug',
        'first_name',
        'last_name',
        'email',
        'photo_url',
        'title',
        'short_bio',
        'long_bio',
        'website_url',
        'social_links',
        'masterclass_title',
        'masterclass_description',
        'rating',
        'free_video_url',
        'vip_video_url',
        'goes_live_at',
        'sort_order',
        'is_featured',
        'free_access_window_hours',
    ];

    protected function casts(): array
    {
        return [
            'social_links' => 'array',
            'goes_live_at' => 'datetime',
            'is_featured' => 'boolean',
            'rating' => 'integer',
            'sort_order' => 'integer',
            'free_access_window_hours' => 'integer',
        ];
    }

    public function summit(): BelongsTo
    {
        return $this->belongsTo(Summit::class);
    }

    public function videoViewSessions(): HasMany
    {
        return $this->hasMany(VideoViewSession::class);
    }

    public function fullName(): string
    {
        return trim("{$this->first_name} {$this->last_name}");
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('photo')
            ->singleFile()
            ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);
    }

    public function registerMediaConversions(?Media $media = null): void
    {
        $this->addMediaConversion('thumb')
            ->fit(Fit::Crop, 160, 160)
            ->nonQueued();

        $this->addMediaConversion('card')
            ->fit(Fit::Crop, 480, 640)
            ->nonQueued();
    }
}
