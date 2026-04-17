<?php

namespace App\Actions;

use App\Models\FunnelStep;
use App\Models\PageView;
use App\Models\VisitorSession;
use Illuminate\Http\Request;

/**
 * Single-purpose action for writing a page_view row. Future customer-facing
 * controllers (funnel renderer, thank-you page, etc.) call this in their
 * response handler so every page load gets captured.
 *
 * Copies UTM + device metadata from the visitor session (if any) so analytics
 * don't need to join back on the session for common queries.
 */
class RecordPageView
{
    public function handle(
        Request $request,
        ?string $summitId = null,
        ?string $funnelId = null,
        ?string $funnelStepId = null,
        ?string $pageType = null,
    ): PageView {
        $sessionId = $request->cookie('visitor_session_id') ?: null;
        $session = $sessionId ? VisitorSession::find($sessionId) : null;

        // If we know the step, infer the other identifiers.
        if ($funnelStepId && (! $funnelId || ! $summitId || ! $pageType)) {
            $step = FunnelStep::with('funnel:id,summit_id')->find($funnelStepId);
            if ($step) {
                $funnelId ??= $step->funnel_id;
                $summitId ??= $step->funnel?->summit_id;
                $pageType ??= $step->step_type;
            }
        }

        return PageView::create([
            'visitor_session_id' => $session?->id,
            'user_id' => $request->user()?->id,
            'summit_id' => $summitId,
            'funnel_id' => $funnelId,
            'funnel_step_id' => $funnelStepId,
            'page_url' => $request->fullUrl(),
            'page_type' => $pageType,
            'referrer_url' => $request->headers->get('referer'),
            'utm_source' => $session?->utm_source ?: $request->query('utm_source'),
            'utm_medium' => $session?->utm_medium ?: $request->query('utm_medium'),
            'utm_campaign' => $session?->utm_campaign ?: $request->query('utm_campaign'),
            'utm_content' => $session?->utm_content ?: $request->query('utm_content'),
            'utm_term' => $session?->utm_term ?: $request->query('utm_term'),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'country_code' => $session?->country_code,
            'device_type' => $session?->device_type,
        ]);
    }
}
