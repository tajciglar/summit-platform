<?php

namespace App\Filament\Widgets;

use App\Models\Order;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;
use Illuminate\Support\Carbon;

class RevenueOverviewWidget extends StatsOverviewWidget
{
    protected static ?int $sort = 1;

    protected function getStats(): array
    {
        $now = Carbon::now();
        $startOfMonth = $now->copy()->startOfMonth();
        $startOfLastMonth = $now->copy()->subMonth()->startOfMonth();
        $endOfLastMonth = $now->copy()->subMonth()->endOfMonth();

        $completedOrders = Order::where('status', 'completed');

        // This month
        $monthRevenue = (clone $completedOrders)
            ->where('completed_at', '>=', $startOfMonth)
            ->sum('total_cents');

        // Last month (same period)
        $lastMonthRevenue = (clone $completedOrders)
            ->whereBetween('completed_at', [$startOfLastMonth, $endOfLastMonth])
            ->sum('total_cents');

        // Today
        $todayRevenue = (clone $completedOrders)
            ->whereDate('completed_at', $now->toDateString())
            ->sum('total_cents');

        // Total all time
        $totalRevenue = (clone $completedOrders)->sum('total_cents');

        // Orders this month
        $monthOrders = (clone $completedOrders)
            ->where('completed_at', '>=', $startOfMonth)
            ->count();

        // Last 7 days chart
        $chartData = [];
        for ($i = 6; $i >= 0; $i--) {
            $day = $now->copy()->subDays($i)->toDateString();
            $chartData[] = Order::where('status', 'completed')
                ->whereDate('completed_at', $day)
                ->sum('total_cents') / 100;
        }

        $monthChange = $lastMonthRevenue > 0
            ? round((($monthRevenue - $lastMonthRevenue) / $lastMonthRevenue) * 100, 1)
            : null;

        return [
            Stat::make('Revenue This Month', '$' . number_format($monthRevenue / 100, 2))
                ->description($monthChange !== null ? ($monthChange >= 0 ? "+{$monthChange}%" : "{$monthChange}%") . ' vs last month' : 'No prior data')
                ->descriptionIcon($monthChange >= 0 ? 'heroicon-m-arrow-trending-up' : 'heroicon-m-arrow-trending-down')
                ->color($monthChange >= 0 ? 'success' : 'danger')
                ->chart($chartData),

            Stat::make('Revenue Today', '$' . number_format($todayRevenue / 100, 2))
                ->description('Completed orders')
                ->color('info'),

            Stat::make('Orders This Month', number_format($monthOrders))
                ->description('AOV: $' . ($monthOrders > 0 ? number_format(($monthRevenue / $monthOrders) / 100, 2) : '0.00'))
                ->color('warning'),

            Stat::make('Total Revenue (All Time)', '$' . number_format($totalRevenue / 100, 2))
                ->description(number_format(Order::where('status', 'completed')->count()) . ' orders')
                ->color('success'),
        ];
    }
}
