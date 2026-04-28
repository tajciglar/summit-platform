<?php

namespace App\Services\Analytics;

use App\Models\Summit;
use Carbon\CarbonInterface;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Per-summit analytics. Computes 8 KPI tiles + a daily series for the Filament
 * Live-Summits dashboard card.
 *
 * Schema notes (verified via database-schema):
 *  - page_views.visitor_session_id exists; page_views.visitor_id does NOT.
 *    => "Visitors" = COUNT(DISTINCT visitor_session_id).
 *  - orders.status enum: pending|completed|refunded|partial_refund|failed.
 *    "Paid" = status IN ('completed','partial_refund').
 *  - orders.total_cents holds revenue (no amount_cents column).
 *  - There is NO order_items table. orders.items is a JSONB array. We assume
 *    each row shape is { product_id, kind, qty, unit_price_cents }; if kind is
 *    absent we fall back to joining products by product_id to read kind.
 *  - There is NO contact_summit pivot and contacts has no summit_id. We scope
 *    contacts via optins.summit_id (distinct contact_id).
 */
class SummitAnalytics
{
    public const METRICS = [
        'revenue',
        'orders',
        'visitors',
        'contacts',
        'order_bumps_revenue',
        'one_click_upsells_revenue',
        'average_order_value',
        'revenue_per_visit',
    ];

    private const PAID_STATUSES = ['completed', 'partial_refund'];

    private const CACHE_TTL_SECONDS = 300;

    /**
     * @return array<string, array{value: float|int, comparison: float|int, delta_pct: float|null, till: Carbon, format: string}>
     */
    public function overview(Summit $summit, ?CarbonInterface $from = null, ?CarbonInterface $to = null): array
    {
        [$from, $to] = $this->resolveWindow($summit, $from, $to);
        [$priorFrom, $priorTo] = $this->priorWindow($from, $to);

        $key = sprintf('summit-analytics:overview:%s:%d:%d', $summit->getKey(), $from->timestamp, $to->timestamp);

        return Cache::remember($key, self::CACHE_TTL_SECONDS, function () use ($summit, $from, $to, $priorFrom, $priorTo) {
            $current = $this->computeMetrics($summit, $from, $to);
            $prior = $this->computeMetrics($summit, $priorFrom, $priorTo);

            $out = [];
            foreach (self::METRICS as $metric) {
                $cur = $current[$metric] ?? 0;
                $prev = $prior[$metric] ?? 0;
                $out[$metric] = [
                    'value' => $cur,
                    'comparison' => $prev,
                    'delta_pct' => $this->deltaPct($cur, $prev),
                    'till' => $to->copy(),
                    'format' => $this->formatFor($metric),
                ];
            }

            return $out;
        });
    }

    /**
     * @return array{labels: array<int, string>, data: array<int, float>}
     */
    public function dailySeries(Summit $summit, string $metric, CarbonInterface $from, CarbonInterface $to): array
    {
        $key = sprintf('summit-analytics:series:%s:%s:%d:%d', $summit->getKey(), $metric, $from->timestamp, $to->timestamp);

        return Cache::remember($key, self::CACHE_TTL_SECONDS, function () use ($summit, $metric, $from, $to) {
            $days = $this->dayBuckets($from, $to);
            $labels = array_keys($days);

            $values = match ($metric) {
                'revenue' => $this->dailyRevenue($summit, $from, $to),
                'orders' => $this->dailyOrders($summit, $from, $to),
                'visitors' => $this->dailyVisitors($summit, $from, $to),
                'contacts' => $this->dailyContacts($summit, $from, $to),
                'order_bumps_revenue' => $this->dailyItemRevenueByKind($summit, 'bump', $from, $to),
                'one_click_upsells_revenue' => $this->dailyItemRevenueByKind($summit, 'upsell', $from, $to),
                'average_order_value' => $this->derivedDaily(
                    $this->dailyRevenue($summit, $from, $to),
                    $this->dailyOrders($summit, $from, $to),
                ),
                'revenue_per_visit' => $this->derivedDaily(
                    $this->dailyRevenue($summit, $from, $to),
                    $this->dailyVisitors($summit, $from, $to),
                ),
                default => [],
            };

            $data = [];
            foreach ($labels as $label) {
                $data[] = (float) ($values[$label] ?? 0);
            }

            return [
                'labels' => array_map(fn (string $d) => Carbon::parse($d)->format('M j'), $labels),
                'data' => $data,
            ];
        });
    }

    /**
     * @return array{0: Carbon, 1: Carbon}
     */
    private function resolveWindow(Summit $summit, ?CarbonInterface $from, ?CarbonInterface $to): array
    {
        $from = $from
            ? Carbon::instance($from)
            : ($summit->pre_summit_starts_at?->copy() ?? now()->subDays(30));

        // Window runs from summit start through today, even after the summit
        // has ended — so post-summit reviewing still works.
        $to = $to ? Carbon::instance($to) : Carbon::instance(now());

        if ($to->lessThan($from)) {
            $to = $from->copy();
        }

        return [$from->copy()->startOfDay(), $to->copy()->endOfDay()];
    }

    /**
     * @return array{0: Carbon, 1: Carbon}
     */
    private function priorWindow(Carbon $from, Carbon $to): array
    {
        $lengthSeconds = max(1, $to->getTimestamp() - $from->getTimestamp());
        $priorTo = $from->copy()->subSecond();
        $priorFrom = $priorTo->copy()->subSeconds($lengthSeconds);

        return [$priorFrom, $priorTo];
    }

    /**
     * @return array<string, float|int>
     */
    private function computeMetrics(Summit $summit, Carbon $from, Carbon $to): array
    {
        $revenueCents = $this->paidOrdersQuery($summit, $from, $to)->sum('total_cents');
        $orderCount = $this->paidOrdersQuery($summit, $from, $to)->count();
        $visitors = $this->visitorsCount($summit, $from, $to);
        $contacts = $this->contactsCount($summit, $from, $to);
        $bumpsCents = $this->itemRevenueByKind($summit, 'bump', $from, $to);
        $upsellsCents = $this->itemRevenueByKind($summit, 'upsell', $from, $to);

        $revenue = $revenueCents / 100;
        $aov = $orderCount > 0 ? ($revenueCents / 100) / $orderCount : 0;
        $rpv = $visitors > 0 ? ($revenueCents / 100) / $visitors : 0;

        return [
            'revenue' => round($revenue, 2),
            'orders' => $orderCount,
            'visitors' => $visitors,
            'contacts' => $contacts,
            'order_bumps_revenue' => round($bumpsCents / 100, 2),
            'one_click_upsells_revenue' => round($upsellsCents / 100, 2),
            'average_order_value' => round($aov, 2),
            'revenue_per_visit' => round($rpv, 2),
        ];
    }

    private function paidOrdersQuery(Summit $summit, Carbon $from, Carbon $to)
    {
        return DB::table('orders')
            ->where('summit_id', $summit->getKey())
            ->whereIn('status', self::PAID_STATUSES)
            ->whereBetween('created_at', [$from, $to]);
    }

    private function visitorsCount(Summit $summit, Carbon $from, Carbon $to): int
    {
        if (! Schema::hasTable('page_views')) {
            return 0;
        }

        $col = Schema::hasColumn('page_views', 'visitor_session_id') ? 'visitor_session_id' : null;

        $q = DB::table('page_views')
            ->where('summit_id', $summit->getKey())
            ->whereBetween('created_at', [$from, $to]);

        return $col
            ? (int) $q->distinct()->count($col)
            : (int) $q->count();
    }

    private function contactsCount(Summit $summit, Carbon $from, Carbon $to): int
    {
        // No contact_summit pivot and no contacts.summit_id — scope via optins.
        if (Schema::hasTable('optins') && Schema::hasColumn('optins', 'summit_id')) {
            return (int) DB::table('optins')
                ->where('summit_id', $summit->getKey())
                ->whereBetween('created_at', [$from, $to])
                ->whereNotNull('contact_id')
                ->distinct()
                ->count('contact_id');
        }

        // Fallback: distinct contact_id from orders.
        return (int) DB::table('orders')
            ->where('summit_id', $summit->getKey())
            ->whereBetween('created_at', [$from, $to])
            ->whereNotNull('contact_id')
            ->distinct()
            ->count('contact_id');
    }

    /**
     * Pull revenue (cents) for items of a given product kind from orders.items
     * JSONB. Assumes shape [{ product_id, kind, qty, unit_price_cents }].
     * Falls back to joining products on product_id when item.kind is missing.
     */
    private function itemRevenueByKind(Summit $summit, string $kind, Carbon $from, Carbon $to): int
    {
        $sql = <<<'SQL'
            SELECT COALESCE(SUM(
                COALESCE((item->>'unit_price_cents')::bigint, 0)
                * COALESCE(NULLIF((item->>'qty')::text, '')::int, 1)
            ), 0) AS total
            FROM orders o
            CROSS JOIN LATERAL jsonb_array_elements(COALESCE(o.items, '[]'::jsonb)) AS item
            LEFT JOIN products p ON p.id::text = item->>'product_id'
            WHERE o.summit_id = ?
              AND o.status = ANY(?)
              AND o.created_at BETWEEN ? AND ?
              AND COALESCE(item->>'kind', p.kind::text) = ?
        SQL;

        $row = DB::selectOne($sql, [
            $summit->getKey(),
            '{'.implode(',', self::PAID_STATUSES).'}',
            $from,
            $to,
            $kind,
        ]);

        return (int) ($row->total ?? 0);
    }

    /** @return array<string, float> */
    private function dailyRevenue(Summit $summit, Carbon $from, Carbon $to): array
    {
        $rows = $this->paidOrdersQuery($summit, $from, $to)
            ->selectRaw("to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS d, SUM(total_cents) AS v")
            ->groupBy('d')
            ->get();

        $out = [];
        foreach ($rows as $r) {
            $out[$r->d] = (float) $r->v / 100;
        }

        return $out;
    }

    /** @return array<string, int> */
    private function dailyOrders(Summit $summit, Carbon $from, Carbon $to): array
    {
        $rows = $this->paidOrdersQuery($summit, $from, $to)
            ->selectRaw("to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS d, COUNT(*) AS v")
            ->groupBy('d')
            ->get();

        return collect($rows)->mapWithKeys(fn ($r) => [$r->d => (int) $r->v])->all();
    }

    /** @return array<string, int> */
    private function dailyVisitors(Summit $summit, Carbon $from, Carbon $to): array
    {
        if (! Schema::hasTable('page_views')) {
            return [];
        }

        $col = Schema::hasColumn('page_views', 'visitor_session_id') ? 'visitor_session_id' : null;

        $select = $col
            ? "to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS d, COUNT(DISTINCT $col) AS v"
            : "to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS d, COUNT(*) AS v";

        $rows = DB::table('page_views')
            ->where('summit_id', $summit->getKey())
            ->whereBetween('created_at', [$from, $to])
            ->selectRaw($select)
            ->groupBy('d')
            ->get();

        return collect($rows)->mapWithKeys(fn ($r) => [$r->d => (int) $r->v])->all();
    }

    /** @return array<string, int> */
    private function dailyContacts(Summit $summit, Carbon $from, Carbon $to): array
    {
        if (! Schema::hasTable('optins') || ! Schema::hasColumn('optins', 'summit_id')) {
            return [];
        }

        $rows = DB::table('optins')
            ->where('summit_id', $summit->getKey())
            ->whereBetween('created_at', [$from, $to])
            ->whereNotNull('contact_id')
            ->selectRaw("to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS d, COUNT(DISTINCT contact_id) AS v")
            ->groupBy('d')
            ->get();

        return collect($rows)->mapWithKeys(fn ($r) => [$r->d => (int) $r->v])->all();
    }

    /** @return array<string, float> */
    private function dailyItemRevenueByKind(Summit $summit, string $kind, Carbon $from, Carbon $to): array
    {
        $sql = <<<'SQL'
            SELECT to_char(o.created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS d,
                   SUM(COALESCE((item->>'unit_price_cents')::bigint, 0)
                       * COALESCE(NULLIF((item->>'qty')::text, '')::int, 1)) AS v
            FROM orders o
            CROSS JOIN LATERAL jsonb_array_elements(COALESCE(o.items, '[]'::jsonb)) AS item
            LEFT JOIN products p ON p.id::text = item->>'product_id'
            WHERE o.summit_id = ?
              AND o.status = ANY(?)
              AND o.created_at BETWEEN ? AND ?
              AND COALESCE(item->>'kind', p.kind::text) = ?
            GROUP BY d
        SQL;

        $rows = DB::select($sql, [
            $summit->getKey(),
            '{'.implode(',', self::PAID_STATUSES).'}',
            $from,
            $to,
            $kind,
        ]);

        $out = [];
        foreach ($rows as $r) {
            $out[$r->d] = (float) $r->v / 100;
        }

        return $out;
    }

    /**
     * @param  array<string, float|int>  $numerators
     * @param  array<string, float|int>  $denominators
     * @return array<string, float>
     */
    private function derivedDaily(array $numerators, array $denominators): array
    {
        $out = [];
        foreach ($numerators as $d => $num) {
            $denom = $denominators[$d] ?? 0;
            $out[$d] = $denom > 0 ? round($num / $denom, 2) : 0.0;
        }

        return $out;
    }

    /**
     * @return array<string, int>
     */
    private function dayBuckets(CarbonInterface $from, CarbonInterface $to): array
    {
        $cursor = Carbon::instance($from)->startOfDay();
        $end = Carbon::instance($to)->startOfDay();
        $out = [];
        while ($cursor->lessThanOrEqualTo($end)) {
            $out[$cursor->format('Y-m-d')] = 0;
            $cursor->addDay();
        }

        return $out;
    }

    private function deltaPct(float|int $current, float|int $prior): ?float
    {
        if ($prior == 0 && $current == 0) {
            return null;
        }
        if ($prior == 0) {
            return 0.0;
        }

        return round((($current - $prior) / $prior) * 100, 1);
    }

    private function formatFor(string $metric): string
    {
        return match ($metric) {
            'revenue', 'order_bumps_revenue', 'one_click_upsells_revenue', 'average_order_value', 'revenue_per_visit' => 'currency',
            default => 'integer',
        };
    }
}
