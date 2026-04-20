<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\SyncOptinToActiveCampaign;
use App\Models\Contact;
use App\Models\Funnel;
use App\Models\Optin;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OptinController extends Controller
{
    public function store(Request $request): JsonResponse
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

        SyncOptinToActiveCampaign::dispatch($optin);

        $redirect = sprintf(
            '/%s/%s/sales?email=%s&first_name=%s',
            $funnel->summit->slug,
            $funnel->slug,
            urlencode($data['email']),
            urlencode($data['first_name']),
        );

        return response()->json(['redirect' => $redirect]);
    }
}
