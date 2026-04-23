<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\CheckoutPrefillToken;
use Illuminate\Http\JsonResponse;

class CheckoutPrefillController extends Controller
{
    public function show(string $token): JsonResponse
    {
        $payload = CheckoutPrefillToken::read($token);

        if ($payload === null) {
            return response()->json(['error' => 'invalid or expired token'], 404);
        }

        return response()->json([
            'email' => $payload['email'],
            'first_name' => $payload['first_name'],
        ]);
    }
}
