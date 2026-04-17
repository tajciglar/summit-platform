<?php

namespace App\Filament\Widgets;

use App\Models\Order;
use Filament\Widgets\ChartWidget;
use Illuminate\Support\Carbon;

/**
 * Daily revenue for the current summit over the last 30 days.
 * Tenant-scoped (Order has a summit() relation so Filament's global
 * scope already filters this chart to the active summit).
 */
class RevenueTrend extends ChartWidget
{
    protected ?string $heading = 'Revenue trend (30 days)';

    protected ?string $description = 'Daily completed-order revenue for this summit.';

    protected int|string|array $columnSpan = 'full';

    public function getColumnSpan(): int|string|array
    {
        return 'full';
    }

    protected function getType(): string
    {
        return 'line';
    }

    protected function getData(): array
    {
        $end = Carbon::today()->endOfDay();
        $start = $end->copy()->subDays(29)->startOfDay();

        $daily = Order::query()
            ->where('status', 'completed')
            ->whereBetween('completed_at', [$start, $end])
            ->selectRaw("date_trunc('day', completed_at) AS day, COALESCE(SUM(total_cents), 0) AS cents")
            ->groupBy('day')
            ->orderBy('day')
            ->pluck('cents', 'day')
            ->mapWithKeys(fn ($cents, $day) => [Carbon::parse($day)->toDateString() => (int) $cents]);

        $labels = [];
        $values = [];
        $cursor = $start->copy();
        while ($cursor <= $end) {
            $key = $cursor->toDateString();
            $labels[] = $cursor->format('M j');
            $values[] = round(($daily[$key] ?? 0) / 100, 2);
            $cursor->addDay();
        }

        return [
            'datasets' => [
                [
                    'label' => 'Revenue (USD)',
                    'data' => $values,
                    'borderColor' => 'rgb(16, 185, 129)',
                    'backgroundColor' => 'rgba(16, 185, 129, 0.15)',
                    'fill' => true,
                    'tension' => 0.3,
                    'pointRadius' => 2,
                ],
            ],
            'labels' => $labels,
        ];
    }

    protected function getOptions(): array
    {
        return [
            'scales' => [
                'y' => [
                    'beginAtZero' => true,
                    'ticks' => [
                        'callback' => 'function(value){ return "$" + value.toLocaleString(); }',
                    ],
                ],
            ],
            'plugins' => [
                'legend' => ['display' => false],
                'tooltip' => [
                    'callbacks' => [
                        'label' => 'function(ctx){ return "$" + ctx.parsed.y.toFixed(2); }',
                    ],
                ],
            ],
        ];
    }
}
