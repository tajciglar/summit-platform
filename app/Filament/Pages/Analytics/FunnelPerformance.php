<?php

namespace App\Filament\Pages\Analytics;

use App\Filament\Resources\Funnels\FunnelResource;
use App\Models\Funnel;
use App\Models\Order;
use App\Models\PageView;
use BackedEnum;
use Filament\Facades\Filament;
use Filament\Pages\Page;
use Filament\Support\Icons\Heroicon;
use Illuminate\Support\Collection;
use UnitEnum;

/**
 * Per-funnel orders + revenue + views + conversion rate for the current summit.
 */
class FunnelPerformance extends Page
{
    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedFunnel;

    protected static string|UnitEnum|null $navigationGroup = 'Analytics';

    protected static ?int $navigationSort = 10;

    protected static ?string $title = 'Funnel performance';

    protected static ?string $navigationLabel = 'Funnel performance';

    protected string $view = 'filament.pages.analytics.funnel-performance';

    /**
     * @return Collection<int, array{funnel: Funnel, views: int, orders: int, revenue_cents: int, aov_cents: int, conversion_rate: float}>
     */
    public function getRows(): Collection
    {
        $summit = Filament::getTenant();
        if (! $summit) {
            return collect();
        }

        $funnels = Funnel::query()
            ->where('summit_id', $summit->getKey())
            ->orderBy('name')
            ->get();

        $orderStats = Order::query()
            ->where('summit_id', $summit->getKey())
            ->where('status', 'completed')
            ->selectRaw('funnel_id, COUNT(*) AS orders_count, COALESCE(SUM(total_cents), 0) AS revenue_cents')
            ->groupBy('funnel_id')
            ->get()
            ->keyBy('funnel_id');

        $viewStats = PageView::query()
            ->where('summit_id', $summit->getKey())
            ->selectRaw('funnel_id, COUNT(*) AS views_count')
            ->groupBy('funnel_id')
            ->get()
            ->keyBy('funnel_id');

        return $funnels->map(function (Funnel $funnel) use ($orderStats, $viewStats) {
            $orders = (int) ($orderStats->get($funnel->id)?->orders_count ?? 0);
            $revenue = (int) ($orderStats->get($funnel->id)?->revenue_cents ?? 0);
            $views = (int) ($viewStats->get($funnel->id)?->views_count ?? 0);
            $aov = $orders > 0 ? intdiv($revenue, $orders) : 0;
            $conversionRate = $views > 0 ? ($orders / $views) * 100 : 0.0;

            return [
                'funnel' => $funnel,
                'views' => $views,
                'orders' => $orders,
                'revenue_cents' => $revenue,
                'aov_cents' => $aov,
                'conversion_rate' => $conversionRate,
            ];
        });
    }

    public function getTotals(): array
    {
        $rows = $this->getRows();
        $totalViews = (int) $rows->sum('views');
        $totalOrders = (int) $rows->sum('orders');

        return [
            'views' => $totalViews,
            'orders' => $totalOrders,
            'revenue_cents' => (int) $rows->sum('revenue_cents'),
            'conversion_rate' => $totalViews > 0 ? ($totalOrders / $totalViews) * 100 : 0.0,
        ];
    }

    public function getFunnelUrl(Funnel $funnel): string
    {
        return FunnelResource::getUrl('view', ['record' => $funnel]);
    }
}
