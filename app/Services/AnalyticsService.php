<?php

namespace App\Services;

use App\Models\PageView;
use Illuminate\Http\Request;

class AnalyticsService
{
    /**
     * Record a page view for a funnel step.
     */
    public function recordPageView(Request $request, array $context = []): void
    {
        $userAgent = $request->userAgent() ?? '';

        PageView::create([
            'session_id' => $request->attributes->get('tracking_session_id') ?? $request->cookie('session_id'),
            'user_id' => $request->user()?->id,
            'page_url' => $request->fullUrl(),
            'page_type' => $context['page_type'] ?? 'funnel_step',
            'summit_id' => $context['summit_id'] ?? null,
            'funnel_id' => $context['funnel_id'] ?? null,
            'funnel_step_id' => $context['funnel_step_id'] ?? null,
            'referrer_url' => $request->header('Referer'),
            'utm_source' => $request->query('utm_source'),
            'utm_medium' => $request->query('utm_medium'),
            'utm_campaign' => $request->query('utm_campaign'),
            'utm_content' => $request->query('utm_content'),
            'utm_term' => $request->query('utm_term'),
            'ip_address' => $request->ip(),
            'user_agent' => $userAgent,
            'country_code' => null, // Would need GeoIP lookup
            'device_type' => $this->detectDeviceType($userAgent),
        ]);
    }

    private function detectDeviceType(string $userAgent): string
    {
        $ua = strtolower($userAgent);

        if (str_contains($ua, 'mobile') || str_contains($ua, 'android') || str_contains($ua, 'iphone')) {
            return 'mobile';
        }

        if (str_contains($ua, 'tablet') || str_contains($ua, 'ipad')) {
            return 'tablet';
        }

        return 'desktop';
    }
}
