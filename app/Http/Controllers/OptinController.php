<?php

namespace App\Http\Controllers;

use App\Jobs\SyncOptinToActiveCampaign;
use App\Models\Optin;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OptinController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'first_name' => ['nullable', 'string', 'max:255'],
            'summit_id' => ['nullable', 'string', 'exists:summits,id'],
            'funnel_id' => ['nullable', 'string', 'exists:funnels,id'],
            'funnel_step_id' => ['nullable', 'string', 'exists:funnel_steps,id'],
        ]);

        $optin = Optin::create([
            'email' => $validated['email'],
            'first_name' => $validated['first_name'] ?? null,
            'summit_id' => $validated['summit_id'] ?? null,
            'funnel_id' => $validated['funnel_id'] ?? null,
            'funnel_step_id' => $validated['funnel_step_id'] ?? null,
            'source_url' => $request->header('Referer'),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'utm_source' => $request->input('utm_source'),
            'utm_medium' => $request->input('utm_medium'),
            'utm_campaign' => $request->input('utm_campaign'),
            'utm_content' => $request->input('utm_content'),
            'utm_term' => $request->input('utm_term'),
        ]);

        SyncOptinToActiveCampaign::dispatch($optin);

        return response()->json(['success' => true]);
    }
}
