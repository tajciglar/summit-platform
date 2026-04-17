<?php

namespace App\Http\Controllers\Api;

use App\Models\Funnel;
use App\Models\Optin;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class OptinController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'funnel_id' => ['required', 'uuid', 'exists:funnels,id'],
            'email' => ['required', 'email', 'max:255'],
            'first_name' => ['nullable', 'string', 'max:120'],
            'utm_source' => ['nullable', 'string', 'max:120'],
            'utm_medium' => ['nullable', 'string', 'max:120'],
            'utm_campaign' => ['nullable', 'string', 'max:120'],
            'referrer' => ['nullable', 'string', 'max:2000'],
        ]);

        $funnel = Funnel::findOrFail($data['funnel_id']);

        $optin = Optin::create([
            'funnel_id' => $funnel->id,
            'summit_id' => $funnel->summit_id,
            'email' => strtolower(trim($data['email'])),
            'first_name' => $data['first_name'] ?? null,
            'utm_source' => $data['utm_source'] ?? null,
            'utm_medium' => $data['utm_medium'] ?? null,
            'utm_campaign' => $data['utm_campaign'] ?? null,
            'referrer' => $data['referrer'] ?? null,
            'user_agent' => substr($request->userAgent() ?? '', 0, 500),
            'ip_address' => $request->ip(),
        ]);

        return response()->json(['ok' => true, 'id' => $optin->id], 201);
    }
}
