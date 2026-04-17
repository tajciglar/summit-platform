<?php

namespace App\Models;

use App\Enums\SummitAudience;
use App\Models\Concerns\HasUuid;
use Filament\Models\Contracts\HasName;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;
use Spatie\Image\Enums\Fit;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class Summit extends Model implements HasMedia, HasName
{
    use HasFactory, HasUuid, InteractsWithMedia;

    public function getFilamentName(): string
    {
        return $this->title ?? 'Untitled summit';
    }

    /**
     * Lowercase initials from each alphabetic word in the summit title,
     * used as the prefix for funnel slugs (e.g. "ADHD Parenting Summit" → "aps").
     */
    public function getInitialsAttribute(): string
    {
        return collect(preg_split('/\s+/', (string) $this->title))
            ->map(fn (string $word) => preg_replace('/[^A-Za-z]/', '', $word))
            ->filter()
            ->map(fn (string $word) => strtolower(substr($word, 0, 1)))
            ->implode('');
    }

    protected $fillable = [
        'slug',
        'title',
        'description',
        'topic',
        'audience',
        'hero_image_url',
        'status',
        'current_phase',
        'timezone',
        'pre_summit_starts_at',
        'late_pre_summit_starts_at',
        'during_summit_starts_at',
        'post_summit_starts_at',
        'ends_at',
    ];

    protected function casts(): array
    {
        return [
            'audience' => SummitAudience::class,
            'pre_summit_starts_at' => 'datetime',
            'late_pre_summit_starts_at' => 'datetime',
            'during_summit_starts_at' => 'datetime',
            'post_summit_starts_at' => 'datetime',
            'ends_at' => 'datetime',
        ];
    }

    /**
     * Admins who can operate on this summit (legacy — tenancy is Domain-based
     * now; kept for back-compat with existing seeders).
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'summit_user')->withPivot('created_at');
    }

    /**
     * Domains (brand hosts) this summit lives on. A summit can be hosted on
     * multiple domains simultaneously.
     */
    public function domains(): BelongsToMany
    {
        return $this->belongsToMany(Domain::class, 'domain_summit')->withPivot('created_at');
    }

    public function pages(): HasMany
    {
        return $this->hasMany(SummitPage::class);
    }

    public function speakers(): HasMany
    {
        return $this->hasMany(Speaker::class);
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    public function funnels(): HasMany
    {
        return $this->hasMany(Funnel::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('hero')
            ->singleFile()
            ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);
    }

    public function registerMediaConversions(?Media $media = null): void
    {
        $this->addMediaConversion('preview')
            ->fit(Fit::Contain, 1200, 630)
            ->nonQueued();
    }

    /**
     * Compare NOW() against inline phase dates and return the current phase.
     * Returns null when no phase dates are set (unpublished summit).
     */
    public function computePhase(?Carbon $now = null): ?string
    {
        $now ??= now();

        if ($this->post_summit_starts_at && $now->gte($this->post_summit_starts_at)) {
            return 'post';
        }
        if ($this->during_summit_starts_at && $now->gte($this->during_summit_starts_at)) {
            return 'during';
        }
        if ($this->late_pre_summit_starts_at && $now->gte($this->late_pre_summit_starts_at)) {
            return 'late_pre';
        }
        if ($this->pre_summit_starts_at && $now->gte($this->pre_summit_starts_at)) {
            return 'pre';
        }

        return null;
    }
}
