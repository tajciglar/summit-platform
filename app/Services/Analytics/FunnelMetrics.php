<?php

namespace App\Services\Analytics;

use App\Models\PageView;
use App\Models\Summit;
use Illuminate\Support\Facades\Cache;

/**
 * Computes the 4-step funnel counts + conversion rates + leak flags for a
 * single summit. Used by LiveSummitsFunnelWidget and PastSummitsFunnelWidget.
 */
class FunnelMetrics
{
    public const PAGE_TYPES = ['optin', 'optin_submit', 'sales', 'checkout_click'];

    public const LEAK_THRESHOLDS = [
        'optin_to_submit' => 0.20,
        'submit_to_sales' => 0.60,
        'sales_to_checkout' => 0.10,
    ];

    /**
     * @return array{optin_views:int, optin_submits:int, sales_views:int, checkout_clicks:int}
     */
    public function countsForSummit(Summit $summit): array
    {
        $row = PageView::query()
            ->where('summit_id', $summit->getKey())
            ->selectRaw("
                COUNT(*) FILTER (WHERE page_type = 'optin')          AS optin_views,
                COUNT(*) FILTER (WHERE page_type = 'optin_submit')   AS optin_submits,
                COUNT(*) FILTER (WHERE page_type = 'sales')          AS sales_views,
                COUNT(*) FILTER (WHERE page_type = 'checkout_click') AS checkout_clicks
            ")
            ->first();

        return [
            'optin_views' => (int) ($row->optin_views ?? 0),
            'optin_submits' => (int) ($row->optin_submits ?? 0),
            'sales_views' => (int) ($row->sales_views ?? 0),
            'checkout_clicks' => (int) ($row->checkout_clicks ?? 0),
        ];
    }

    /**
     * @return array{counts:array, conversions:array, leaks:list<string>}
     */
    public function reportForSummit(Summit $summit): array
    {
        $counts = $this->countsForSummit($summit);

        $conversions = [
            'optin_to_submit' => $this->rate($counts['optin_submits'], $counts['optin_views']),
            'submit_to_sales' => $this->rate($counts['sales_views'], $counts['optin_submits']),
            'sales_to_checkout' => $this->rate($counts['checkout_clicks'], $counts['sales_views']),
        ];

        $leaks = [];
        foreach (self::LEAK_THRESHOLDS as $key => $threshold) {
            if ($conversions[$key] !== null && $conversions[$key] < $threshold) {
                $leaks[] = $key;
            }
        }

        return compact('counts', 'conversions', 'leaks');
    }

    /**
     * @return array{counts:array, conversions:array, leaks:list<string>}
     */
    public function cachedReportForSummit(Summit $summit, int $ttl = 60): array
    {
        $key = "funnel:{$summit->getKey()}:".$summit->updated_at?->timestamp;

        return Cache::remember($key, $ttl, fn () => $this->reportForSummit($summit));
    }

    private function rate(int $numerator, int $denominator): ?float
    {
        if ($denominator === 0) {
            return null;
        }

        return $numerator / $denominator;
    }
}
