<?php

namespace App\Filament\Pages\Analytics;

use App\Filament\Resources\Funnels\FunnelResource;
use App\Models\Funnel;
use App\Models\Order;
use BackedEnum;
use Filament\Facades\Filament;
use Filament\Pages\Page;
use Filament\Support\Icons\Heroicon;
use Illuminate\Support\Collection;
use UnitEnum;

/**
 * Per-funnel revenue + order stats for the current summit.
 * Derived from completed orders joined on funnel_id.
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
     * @return Collection<int, array{funnel: Funnel, orders: int, revenue_cents: int, aov_cents: int}>
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

        $stats = Order::query()
            ->where('summit_id', $summit->getKey())
            ->where('status', 'completed')
            ->selectRaw('funnel_id, COUNT(*) AS orders_count, COALESCE(SUM(total_cents), 0) AS revenue_cents')
            ->groupBy('funnel_id')
            ->get()
            ->keyBy('funnel_id');

        return $funnels->map(function (Funnel $funnel) use ($stats) {
            $row = $stats->get($funnel->id);
            $orders = (int) ($row->orders_count ?? 0);
            $revenue = (int) ($row->revenue_cents ?? 0);
            $aov = $orders > 0 ? intdiv($revenue, $orders) : 0;

            return [
                'funnel' => $funnel,
                'orders' => $orders,
                'revenue_cents' => $revenue,
                'aov_cents' => $aov,
            ];
        });
    }

    public function getTotals(): array
    {
        $rows = $this->getRows();

        return [
            'orders' => (int) $rows->sum('orders'),
            'revenue_cents' => (int) $rows->sum('revenue_cents'),
        ];
    }

    public function getFunnelUrl(Funnel $funnel): string
    {
        return FunnelResource::getUrl('view', ['record' => $funnel]);
    }
}
