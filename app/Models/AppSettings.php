<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;
use Spatie\Image\Enums\Fit;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class AppSettings extends Model implements HasMedia
{
    use HasUuid, InteractsWithMedia;

    protected $table = 'app_settings';

    protected $fillable = [
        'company_name',
        'support_email',
        'sender_name',
        'sender_email',
        'default_currency',
        'stripe_publishable_key',
        'activecampaign_list_id',
        'brand_color',
    ];

    /**
     * Always returns the single settings row, creating it on first access.
     */
    public static function current(): self
    {
        return self::query()->first() ?? self::create([]);
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('logo')
            ->singleFile()
            ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']);
    }

    public function registerMediaConversions(?Media $media = null): void
    {
        $this->addMediaConversion('small')
            ->fit(Fit::Contain, 200, 200)
            ->nonQueued();
    }
}
