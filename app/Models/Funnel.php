<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Funnel extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = [
        'summit_id', 'slug', 'name', 'description',
        'target_phase', 'is_active', 'theme',
        'style_brief_override', 'last_section_selection',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'theme' => 'array',
        'style_brief_override' => 'array',
        'last_section_selection' => 'array',
    ];

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
}
