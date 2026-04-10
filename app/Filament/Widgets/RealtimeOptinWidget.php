<?php

namespace App\Filament\Widgets;

use App\Models\Optin;
use App\Models\Summit;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;
use Illuminate\Support\Carbon;

class RealtimeOptinWidget extends StatsOverviewWidget
{
    protected static ?int $sort = 2;

    protected int|string|array $columnSpan = 'full';

    protected ?string $pollingInterval = '30s';

    protected function getStats(): array
    {
        $now = Carbon::now();
        $today = $now->toDateString();

        // Active summits (published, with events happening within ±7 days)
        $activeSummits = Summit::where('status', 'published')
            ->where('starts_at', '<=', $now->copy()->addDays(7))
            ->where(function ($q) use ($now) {
                $q->whereNull('ends_at')
                    ->orWhere('ends_at', '>=', $now->copy()->subDays(7));
            })
            ->get();

        $stats = [];

        // Global today optins
        $todayOptins = Optin::whereDate('created_at', $today)->count();
        $yesterdayOptins = Optin::whereDate('created_at', $now->copy()->subDay()->toDateString())->count();

        // Hourly chart for today
        $hourlyData = [];
        for ($h = 0; $h < 24; $h++) {
            $hourlyData[] = Optin::whereDate('created_at', $today)
                ->whereRaw('EXTRACT(HOUR FROM created_at) = ?', [$h])
                ->count();
        }

        $stats[] = Stat::make('Optins Today (All Summits)', number_format($todayOptins))
            ->description($yesterdayOptins > 0 ? 'Yesterday: ' . number_format($yesterdayOptins) : 'No data yesterday')
            ->color('success')
            ->chart($hourlyData);

        // Per active summit
        foreach ($activeSummits->take(3) as $summit) {
            $summitToday = Optin::where('summit_id', $summit->id)
                ->whereDate('created_at', $today)
                ->count();

            $summitTotal = Optin::where('summit_id', $summit->id)->count();

            $stats[] = Stat::make($summit->title, number_format($summitToday) . ' today')
                ->description('Total: ' . number_format($summitTotal))
                ->color('info');
        }

        return $stats;
    }
}
