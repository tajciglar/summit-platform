<?php

namespace App\Filament\Pages\Analytics;

use App\Models\Order;
use BackedEnum;
use Filament\Facades\Filament;
use Filament\Pages\Page;
use Filament\Support\Icons\Heroicon;
use Illuminate\Support\Collection;
use UnitEnum;

/**
 * Revenue attributed to each utm_source / utm_campaign combination.
 * Joins completed orders onto visitor_sessions (UTM lives there).
 */
class UtmBreakdown extends Page
{
    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedLink;

    protected static string|UnitEnum|null $navigationGroup = 'Analytics';

    protected static ?int $navigationSort = 20;

    protected static ?string $title = 'UTM attribution';

    protected static ?string $navigationLabel = 'UTM attribution';

    protected string $view = 'filament.pages.analytics.utm-breakdown';

    /**
     * @return Collection<int, array{source: string, campaign: string, orders: int, revenue_cents: int}>
     */
    public function getRows(): Collection
    {
        $summit = Filament::getTenant();
        if (! $summit) {
            return collect();
        }

        $rows = Order::query()
            ->from('orders')
            ->leftJoin('visitor_sessions', 'orders.visitor_session_id', '=', 'visitor_sessions.id')
            ->where('orders.summit_id', $summit->getKey())
            ->where('orders.status', 'completed')
            ->selectRaw("
                COALESCE(visitor_sessions.utm_source, '(none)') AS source,
                COALESCE(visitor_sessions.utm_campaign, '(none)') AS campaign,
                COUNT(*) AS orders_count,
                COALESCE(SUM(orders.total_cents), 0) AS revenue_cents
            ")
            ->groupBy('source', 'campaign')
            ->orderByDesc('revenue_cents')
            ->get();

        return $rows->map(fn ($r) => [
            'source' => $r->source,
            'campaign' => $r->campaign,
            'orders' => (int) $r->orders_count,
            'revenue_cents' => (int) $r->revenue_cents,
        ]);
    }
}
