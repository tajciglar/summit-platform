<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Filament\Models\Contracts\HasName;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Image\Enums\Fit;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

/**
 * Filament tenant. A domain represents a public-facing brand / website
 * (parenting-summits.com, vzgoja.si, althea-academy.com). Admins are scoped
 * to one or more domains; picking a domain in the top-right tenant switcher
 * filters every downstream resource (summits, funnels, products, orders, etc.)
 * to the set of summits that domain hosts.
 */
class Domain extends Model implements HasMedia, HasName
{
    use HasFactory, HasUuid, InteractsWithMedia;

    protected $fillable = [
        'name',
        'hostname',
        'slug',
        'brand_color',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function getFilamentName(): string
    {
        return $this->name ?: $this->hostname ?: 'Untitled domain';
    }

    public function summits(): HasMany
    {
        return $this->hasMany(Summit::class)->orderBy('title');
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'domain_user')
            ->withPivot('created_at');
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
