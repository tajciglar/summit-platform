<?php

namespace App\Http\Controllers\Api;

use App\Actions\RecordPageView;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

/**
 * Client-facing funnel event tracker. Writes one row to page_views per call.
 *
 * NOTE: optin_submit is deliberately NOT accepted here — that event is
 * written server-side inside OptinController so it cannot be spoofed.
 */
class TrackPageViewController extends Controller
{
    public const CLIENT_WRITABLE_TYPES = ['optin', 'sales', 'checkout_click'];

    public function __invoke(Request $request, RecordPageView $recorder): Response
    {
        $data = $request->validate([
            'page_type' => ['required', 'string', 'in:'.implode(',', self::CLIENT_WRITABLE_TYPES)],
            'summit_id' => ['required', 'uuid', 'exists:summits,id'],
            'funnel_id' => ['required', 'uuid', 'exists:funnels,id'],
            'funnel_step_id' => ['required', 'uuid', 'exists:funnel_steps,id'],
        ]);

        $recorder->handle(
            $request,
            summitId: $data['summit_id'],
            funnelId: $data['funnel_id'],
            funnelStepId: $data['funnel_step_id'],
            pageType: $data['page_type'],
        );

        return response()->noContent();
    }
}
