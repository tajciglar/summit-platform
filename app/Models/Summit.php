<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Summit extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = [
        'slug', 'title', 'description', 'topic', 'hero_image_url',
        'status', 'current_phase', 'timezone',
        'pre_summit_starts_at', 'late_pre_summit_starts_at',
        'during_summit_starts_at', 'post_summit_starts_at', 'ends_at',
        'audience',
        'summit_type',
        'style_reference_url', 'style_brief', 'style_brief_built_at', 'style_brief_status',
    ];

    protected $casts = [
        'pre_summit_starts_at' => 'datetime',
        'late_pre_summit_starts_at' => 'datetime',
        'during_summit_starts_at' => 'datetime',
        'post_summit_starts_at' => 'datetime',
        'ends_at' => 'datetime',
        'style_brief' => 'array',
        'style_brief_built_at' => 'datetime',
    ];

    public function phaseSchedules(): HasMany
    {
        return $this->hasMany(SummitPhaseSchedule::class);
    }

    public function pages(): HasMany
    {
        return $this->hasMany(SummitPage::class)->orderBy('sort_order');
    }

    public function summitSpeakers(): HasMany
    {
        return $this->hasMany(SummitSpeaker::class)->orderBy('sort_order');
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

    public function campaignActivities(): HasMany
    {
        return $this->hasMany(SummitCampaignActivity::class)->orderBy('starts_at');
    }

    public function dailyReports(): HasMany
    {
        return $this->hasMany(SummitDailyReport::class)->orderBy('report_date');
    }

    public function checklistItems(): HasMany
    {
        return $this->hasMany(SummitChecklistItem::class)->orderBy('sort_order');
    }

    public function buildSummitContext(): array
    {
        $speakers = [];
        try {
            $this->loadMissing('summitSpeakers.speaker');
            foreach ($this->summitSpeakers as $link) {
                $speakers[] = [
                    'name' => $link->speaker?->full_name ?? '',
                    'photo' => $link->speaker?->photo_url ?? null,
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
