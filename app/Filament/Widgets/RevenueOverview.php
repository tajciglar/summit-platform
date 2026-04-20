<?php

namespace App\Filament\Widgets;

use App\Models\Order;
use App\Models\Summit;
use App\Models\User;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class RevenueOverview extends BaseWidget
{
    protected static bool $isDiscovered = false;

    protected function getStats(): array
    {
        $cents = (int) Order::where('status', 'completed')->sum('total_cents');
        $recentCents = (int) Order::where('status', 'completed')
            ->where('completed_at', '>=', now()->subDays(30))
            ->sum('total_cents');

        return [
            Stat::make('Revenue (all time)', '$'.number_format($cents / 100, 2))
                ->description('Completed orders')
                ->color('success')
                ->icon('heroicon-o-banknotes'),

            Stat::make('Revenue (last 30d)', '$'.number_format($recentCents / 100, 2))
                ->description('Completed in the last 30 days')
                ->color('info')
                ->icon('heroicon-o-arrow-trending-up'),

            Stat::make('Buyers', (string) User::where('role', 'buyer')->count())
                ->description((string) Summit::where('status', 'published')->count().' published summits')
                ->color('primary')
                ->icon('heroicon-o-users'),
        ];
    }
}
