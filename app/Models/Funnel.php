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
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'section_config' => 'array',
        ];
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
