<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

class Summit extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = [
        'slug',
        'title',
        'description',
        'topic',
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
            'pre_summit_starts_at' => 'datetime',
            'late_pre_summit_starts_at' => 'datetime',
            'during_summit_starts_at' => 'datetime',
            'post_summit_starts_at' => 'datetime',
            'ends_at' => 'datetime',
        ];
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
