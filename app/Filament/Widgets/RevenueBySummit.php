<?php

namespace App\Filament\Widgets;

use App\Models\Order;
use App\Models\Summit;
use Filament\Facades\Filament;
use Filament\Widgets\ChartWidget;

/**
 * Cross-summit revenue comparison. Opts out of tenancy so it shows
 * every summit the admin can access, not just the current one.
 */
class RevenueBySummit extends ChartWidget
{
    protected static bool $isDiscovered = false;

    protected ?string $heading = 'Revenue by summit';

    protected ?string $description = 'All-time completed orders across summits you can access.';

    protected int|string|array $columnSpan = 'full';

    public function getColumnSpan(): int|string|array
    {
        return 'full';
    }

    protected function getType(): string
    {
        return 'bar';
    }

    protected function getData(): array
    {
        $user = Filament::auth()->user();
        $panel = Filament::getCurrentPanel();
        $accessible = ($user && $panel) ? $user->getTenants($panel) : collect();

        if ($accessible->isEmpty()) {
            return [
                'datasets' => [],
                'labels' => [],
            ];
        }

        $summitIds = $accessible->pluck('id');

        // Aggregate without the tenant scope so all accessible summits show up.
        $rows = Order::withoutGlobalScopes()
            ->whereIn('summit_id', $summitIds)
            ->where('status', 'completed')
            ->selectRaw('summit_id, COALESCE(SUM(total_cents), 0) AS cents')
            ->groupBy('summit_id')
            ->pluck('cents', 'summit_id');

        $labels = [];
        $values = [];

        foreach ($accessible as $summit) {
            /** @var Summit $summit */
            $labels[] = $summit->title;
            $values[] = round(((int) ($rows[$summit->id] ?? 0)) / 100, 2);
        }

        return [
            'datasets' => [
                [
                    'label' => 'Revenue (USD)',
                    'data' => $values,
                    'backgroundColor' => 'rgba(79, 70, 229, 0.85)',
                    'borderRadius' => 6,
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
