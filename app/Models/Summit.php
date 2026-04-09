<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Summit extends Model
{
    use HasUuid;

    protected $fillable = [
        'slug', 'title', 'description', 'topic', 'hero_image_url',
        'status', 'current_phase', 'timezone', 'starts_at', 'ends_at',
        'summit_type',
    ];

    protected $casts = [
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
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
}
