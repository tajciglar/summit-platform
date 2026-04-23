<?php

namespace App\Models;

use App\Enums\LandingPageDraftStatus;
use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class Funnel extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = [
        'summit_id',
        'slug',
        'name',
        'description',
        'target_phase',
        'template_key',
        'section_config',
        'wp_checkout_redirect_url',
        'wp_thankyou_redirect_url',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'section_config' => 'array',
        ];
    }

    /**
     * Re-entrancy guard so Summit.status ↔ Funnel.is_active cascades don't
     * loop: Summit saved → deactivate funnels → funnel saved → re-publish
     * summit → summit saved → …
     */
    public static bool $skipStatusCascade = false;

    protected static function booted(): void
    {
        static::saving(function (Funnel $funnel): void {
            if (! $funnel->is_active || ! $funnel->summit_id) {
                return;
            }

            $query = static::query()
                ->where('summit_id', $funnel->summit_id)
                ->where('is_active', true);

            if ($funnel->exists) {
                $query->where('id', '!=', $funnel->id);
            }

            $query->update(['is_active' => false]);
        });

        // Cascade: when a funnel is saved with is_active=true, its parent
        // Summit must be marked `published` so the "summit draft = no live
        // funnels" invariant holds without the operator touching two places.
        static::saved(function (Funnel $funnel): void {
            if (self::$skipStatusCascade) {
                return;
            }
            if (! $funnel->is_active || ! $funnel->summit_id) {
                return;
            }
            $summit = $funnel->summit;
            if ($summit && $summit->status !== 'published') {
                Summit::$skipStatusCascade = true;
                try {
                    $summit->forceFill(['status' => 'published'])->saveQuietly();
                } finally {
                    Summit::$skipStatusCascade = false;
                }
            }
        });
    }

    public function summit(): BelongsTo
    {
        return $this->belongsTo(Summit::class);
    }

    public function steps(): HasMany
    {
        return $this->hasMany(FunnelStep::class)->orderBy('sort_order');
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function drafts(): HasManyThrough
    {
        return $this->hasManyThrough(
            LandingPageDraft::class,
            LandingPageBatch::class,
            'funnel_id',   // FK on batches
            'batch_id',    // FK on drafts
            'id',          // local key on funnels
            'id',          // local key on batches
        );
    }

    public function publishedDraft(): HasManyThrough
    {
        return $this->drafts()
            ->where('landing_page_drafts.status', LandingPageDraftStatus::Published->value)
            ->orderByDesc('landing_page_drafts.updated_at');
    }
}
