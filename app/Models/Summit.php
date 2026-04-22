<?php

namespace App\Models;

use App\Enums\SummitAudience;
use App\Models\Concerns\HasMediaAttachments;
use App\Models\Concerns\HasUuid;
use Filament\Models\Contracts\HasName;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

class Summit extends Model implements HasName
{
    use HasFactory, HasMediaAttachments, HasUuid;

    public function getFilamentName(): string
    {
        return $this->title ?? 'Untitled summit';
    }

    public function getInitialsAttribute(): string
    {
        return collect(preg_split('/\s+/', (string) $this->title))
            ->map(fn (string $word) => preg_replace('/[^A-Za-z]/', '', $word))
            ->filter()
            ->map(fn (string $word) => strtolower(substr($word, 0, 1)))
            ->implode('');
    }

    protected function heroImageUrl(): Attribute
    {
        return Attribute::get(fn ($value) => $this->imageUrl('hero') ?: $value);
    }

    protected $fillable = [
        'domain_id',
        'slug', 'title', 'description', 'topic', 'hero_image_url',
        'status', 'current_phase', 'timezone',
        'pre_summit_starts_at', 'late_pre_summit_starts_at',
        'during_summit_starts_at', 'post_summit_starts_at', 'ends_at',
        'audience',
        'summit_type',
        'ac_optin_tag',
        'style_reference_url', 'style_brief', 'style_brief_built_at', 'style_brief_status',
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
            'style_brief' => 'array',
            'style_brief_built_at' => 'datetime',
        ];
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'summit_user')->withPivot('created_at');
    }

    public function domain(): BelongsTo
    {
        return $this->belongsTo(Domain::class);
    }

    public function pages(): HasMany
    {
        return $this->hasMany(SummitPage::class);
    }

    /**
     * Speakers attached to this summit. Many-to-many via `speaker_summit`,
     * where the pivot carries the per-attachment `day_number` and
     * `sort_order`. Callers that need the day number should use
     * `$speaker->pivot->day_number` (or preload with `->with('summits')`
     * on a speaker query).
     */
    public function speakers(): BelongsToMany
    {
        return $this->belongsToMany(Speaker::class, 'speaker_summit')
            ->withPivot('day_number', 'sort_order')
            ->withTimestamps()
            ->using(SpeakerSummit::class)
            ->orderByPivot('sort_order');
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

    public function optins(): HasMany
    {
        return $this->hasMany(Optin::class);
    }

    public function checklistItems(): HasMany
    {
        return $this->hasMany(SummitChecklistItem::class)->orderBy('sort_order');
    }

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

    public function buildSummitContext(): array
    {
        $speakers = [];
        try {
            $this->loadMissing('speakers');
            foreach ($this->speakers as $s) {
                $speakers[] = [
                    'name' => trim("{$s->first_name} {$s->last_name}"),
                    'photo' => $s->photo_url ?? null,
                ];
            }
        } catch (\Throwable) {
            $speakers = [];
        }

        return [
            'name' => $this->title,
            'date' => $this->pre_summit_starts_at?->toDateString() ?? '',
            'brandColors' => [],
            'mode' => 'light',
            'speakers' => $speakers,
            'toneBrief' => '',
            'product' => null,
        ];
    }
}
