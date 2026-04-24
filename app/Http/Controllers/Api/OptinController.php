<?php

namespace App\Http\Controllers\Api;

use App\Actions\RecordPageView;
use App\Http\Controllers\Controller;
use App\Jobs\SyncOptinToActiveCampaign;
use App\Models\Contact;
use App\Models\Funnel;
use App\Models\Optin;
use App\Support\CheckoutPrefillToken;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OptinController extends Controller
{
    public function store(Request $request, RecordPageView $recorder): JsonResponse
    {
        $data = $request->validate([
            'first_name' => ['nullable', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:255'],
            'funnel_id' => ['required', 'uuid', 'exists:funnels,id'],
        ]);

        $firstName = $data['first_name'] ?? null;

        $funnel = Funnel::with('summit')->findOrFail($data['funnel_id']);

        $contact = Contact::updateOrCreate(
            ['email' => $data['email']],
            $firstName ? ['first_name' => $firstName] : [],
        );

        $optin = Optin::create([
            'contact_id' => $contact->id,
            'email' => $data['email'],
            'first_name' => $firstName,
            'funnel_id' => $funnel->id,
            'summit_id' => $funnel->summit->id,
            'ip_address' => $request->ip(),
            'source_url' => $request->header('Referer'),
            'user_agent' => $request->userAgent(),
            'utm_source' => $request->input('utm_source'),
            'utm_medium' => $request->input('utm_medium'),
            'utm_campaign' => $request->input('utm_campaign'),
            'utm_content' => $request->input('utm_content'),
            'utm_term' => $request->input('utm_term'),
        ]);

        $recorder->handle(
            $request,
            summitId: $funnel->summit->id,
            funnelId: $funnel->id,
            pageType: 'optin_submit',
        );

        SyncOptinToActiveCampaign::dispatch($optin);

        // Encrypt the prefill payload so email + first_name don't appear in
        // the browser URL (or access logs, referrers, analytics). Next.js
        // exchanges the token server-side via /api/optin/prefill/{token}.
        $token = CheckoutPrefillToken::issue($data['email'], $firstName ?? '');

        // Public funnel URLs are host-based: summit is implicit via the domain,
        // so the path is /{funnel-slug}/{step-slug}. Assumes a sales_page step
        // with slug "sales" exists; falls back to / if no sales step is set up.
        $redirect = sprintf('/%s/sales?p=%s', $funnel->slug, urlencode($token));

        return response()->json(['redirect' => $redirect]);
    }
}
