<?php

namespace App\Http\Controllers;

use App\Jobs\SyncOptinToActiveCampaign;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OptinController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'name' => ['nullable', 'string', 'max:255'],
        ]);

        SyncOptinToActiveCampaign::dispatch(
            $validated['email'],
            $validated['name'] ?? '',
        );

        return response()->json(['success' => true]);
    }
}
