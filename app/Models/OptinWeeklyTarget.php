<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

class OptinWeeklyTarget extends Model
{
    use HasUuid;

    protected $fillable = [
        'year', 'week_number', 'week_start_date', 'weekly_optins_target', 'notes',
    ];

    protected $casts = [
        'year' => 'integer',
        'week_number' => 'integer',
        'week_start_date' => 'date',
        'weekly_optins_target' => 'integer',
    ];

    public function getWeekEndDateAttribute(): Carbon
    {
        return $this->week_start_date->copy()->addDays(6)->endOfDay();
    }

    public function getRealOptinsAttribute(): int
    {
        return Optin::where('created_at', '>=', $this->week_start_date->startOfDay())
            ->where('created_at', '<=', $this->week_end_date)
            ->count();
    }

    public function getCumulativeTargetAttribute(): int
    {
        return static::where('week_start_date', '<=', $this->week_start_date)
            ->sum('weekly_optins_target');
    }

    public function getCumulativeRealAttribute(): int
    {
        return Optin::where('created_at', '<=', $this->week_end_date)->count();
    }

    public function getWeeklyGoalPercentAttribute(): ?float
    {
        if ($this->weekly_optins_target <= 0) {
            return null;
        }

        return round(($this->real_optins / $this->weekly_optins_target) * 100, 2);
    }
}
