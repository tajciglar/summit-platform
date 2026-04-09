<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SummitChecklistItem extends Model
{
    use HasUuid;

    protected $fillable = [
        'summit_id', 'template_item_id', 'category', 'name', 'page_type',
        'status', 'link_url', 'content_link', 'tags_wp', 'tags_ac',
        'circle_access', 'welcome_survey', 'price_tier_cents', 'sort_order',
        'comments', 'assigned_to', 'completed_at',
    ];

    protected $casts = [
        'tags_wp' => 'array',
        'tags_ac' => 'array',
        'circle_access' => 'boolean',
        'welcome_survey' => 'boolean',
        'price_tier_cents' => 'integer',
        'sort_order' => 'integer',
        'completed_at' => 'datetime',
    ];

    public function summit(): BelongsTo
    {
        return $this->belongsTo(Summit::class);
    }

    public function templateItem(): BelongsTo
    {
        return $this->belongsTo(ChecklistTemplateItem::class, 'template_item_id');
    }

    public function assignedUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    protected static function booted(): void
    {
        static::saving(function (self $item) {
            if ($item->status === 'done' && ! $item->completed_at) {
                $item->completed_at = now();
            } elseif ($item->status !== 'done') {
                $item->completed_at = null;
            }
        });
    }
}
