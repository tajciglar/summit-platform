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
            'first_name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:255'],
            'funnel_id' => ['required', 'uuid', 'exists:funnels,id'],
        ]);

        $funnel = Funnel::with('summit')->findOrFail($data['funnel_id']);

        $contact = Contact::updateOrCreate(
            ['email' => $data['email']],
            ['first_name' => $data['first_name']],
        );

        $optin = Optin::create([
            'contact_id' => $contact->id,
            'email' => $data['email'],
            'first_name' => $data['first_name'],
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
        $token = CheckoutPrefillToken::issue($data['email'], $data['first_name']);

        $redirect = sprintf(
            '/%s/%s/sales?p=%s',
            $funnel->summit->slug,
            $funnel->slug,
            urlencode($token),
        );

        return response()->json(['redirect' => $redirect]);
    }
}
