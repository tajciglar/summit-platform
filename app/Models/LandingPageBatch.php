<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LandingPageBatch extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = [
        'summit_id',
        'funnel_id',
        'funnel_step_id',
        'version_count',
        'status',
        'notes',
        'style_reference_url',
        'override_url',
        'allowed_types',
        'template_pool',
        'versions_per_template',
        'completed_at',
        'auto_publish',
        'published_by_user_id',
    ];

    protected function casts(): array
    {
        return [
            'allowed_types' => 'array',
            'template_pool' => 'array',
            'versions_per_template' => 'array',
            'completed_at' => 'datetime',
            'auto_publish' => 'boolean',
        ];
    }

    public function summit(): BelongsTo
    {
        return $this->belongsTo(Summit::class);
    }

    public function funnel(): BelongsTo
    {
        return $this->belongsTo(Funnel::class);
    }

    public function funnelStep(): BelongsTo
    {
        return $this->belongsTo(FunnelStep::class);
    }

    public function publishedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'published_by_user_id');
    }

    public function drafts(): HasMany
    {
        return $this->hasMany(LandingPageDraft::class, 'batch_id');
    }
}
