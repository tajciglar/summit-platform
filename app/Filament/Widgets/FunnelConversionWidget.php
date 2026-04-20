<?php

namespace App\Filament\Widgets;

use App\Models\Optin;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\PageView;
use App\Models\Summit;
use Filament\Widgets\ChartWidget;
use Illuminate\Support\Str;

class FunnelConversionWidget extends ChartWidget
{
    protected ?string $heading = 'Funnel Conversion (Active Summits)';

    protected static ?int $sort = 3;

    protected int|string|array $columnSpan = 'full';

    protected ?string $maxHeight = '300px';

    protected function getData(): array
    {
        $summits = Summit::where('status', 'published')
            ->orderByDesc('pre_summit_starts_at')
            ->limit(5)
            ->get();

        $labels = ['Page Views', 'Optins', 'Checkouts', 'Purchases', 'Upsells'];
        $datasets = [];

        $colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

        foreach ($summits as $i => $summit) {
            $views = PageView::where('summit_id', $summit->id)->count();
            $optins = Optin::where('summit_id', $summit->id)->count();

            $orders = Order::where('summit_id', $summit->id)->where('status', 'completed');
            $checkouts = Order::where('summit_id', $summit->id)->count(); // all attempts
            $purchases = (clone $orders)->count();
            $upsells = OrderItem::whereHas('order', fn ($q) => $q->where('summit_id', $summit->id)->where('status', 'completed'))
                ->where('item_type', 'upsell')
                ->count();

            $datasets[] = [
                'label' => Str::limit($summit->title, 30),
                'data' => [$views, $optins, $checkouts, $purchases, $upsells],
                'backgroundColor' => $colors[$i % count($colors)].'33',
                'borderColor' => $colors[$i % count($colors)],
                'borderWidth' => 2,
            ];
        }

        return [
            'datasets' => $datasets,
            'labels' => $labels,
        ];
    }

    protected function getType(): string
    {
        return 'bar';
    }

    protected function getOptions(): array
    {
        return [
            'scales' => [
                'y' => [
                    'beginAtZero' => true,
                    'ticks' => ['callback' => 'function(v) { return v.toLocaleString(); }'],
                ],
            ],
            'plugins' => [
                'legend' => ['position' => 'bottom'],
            ],
        ];
    }
}
