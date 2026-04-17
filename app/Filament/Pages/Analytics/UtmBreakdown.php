<?php

namespace App\Filament\Pages\Analytics;

use App\Models\Order;
use App\Models\PageView;
use BackedEnum;
use Filament\Facades\Filament;
use Filament\Pages\Page;
use Filament\Support\Icons\Heroicon;
use Illuminate\Support\Collection;
use UnitEnum;

/**
 * Revenue attributed to each utm_source / utm_campaign combination, merged
 * with view counts so admins can see which channels convert best.
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
     * @return Collection<int, array{source:string, campaign:string, views:int, orders:int, revenue_cents:int, conversion_rate:float}>
     */
    public function getRows(): Collection
    {
        $summit = Filament::getTenant();
        if (! $summit) {
            return collect();
        }

        // Orders joined on visitor_sessions for UTM source/campaign.
        $orderStats = Order::query()
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
            ->get()
            ->keyBy(fn ($r) => "{$r->source}|{$r->campaign}");

        // page_views denormalizes utm_source/utm_campaign, so no join needed.
        $viewStats = PageView::query()
            ->where('summit_id', $summit->getKey())
            ->selectRaw("
                COALESCE(utm_source, '(none)') AS source,
                COALESCE(utm_campaign, '(none)') AS campaign,
                COUNT(*) AS views_count
            ")
            ->groupBy('source', 'campaign')
            ->get()
            ->keyBy(fn ($r) => "{$r->source}|{$r->campaign}");

        // Union: UTMs that brought views but no orders still appear (conv 0%).
        $keys = $orderStats->keys()->merge($viewStats->keys())->unique();

        return $keys->map(function (string $key) use ($orderStats, $viewStats) {
            [$source, $campaign] = explode('|', $key, 2);
            $views = (int) ($viewStats->get($key)?->views_count ?? 0);
            $orders = (int) ($orderStats->get($key)?->orders_count ?? 0);
            $revenue = (int) ($orderStats->get($key)?->revenue_cents ?? 0);

            return [
                'source' => $source,
                'campaign' => $campaign,
                'views' => $views,
                'orders' => $orders,
                'revenue_cents' => $revenue,
                'conversion_rate' => $views > 0 ? ($orders / $views) * 100 : 0.0,
            ];
        })
            ->sortByDesc('revenue_cents')
            ->values();
    }
}
