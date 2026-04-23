<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\LandingPageDraftResource;
use App\Models\LandingPageDraft;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;

class LandingPageDraftController extends Controller
{
    public function showByToken(string $token): JsonResponse
    {
        $draft = LandingPageDraft::with('batch.summit', 'batch.funnel')
            ->where('preview_token', $token)
            ->firstOrFail();

        return response()->json(
            (new LandingPageDraftResource($draft))->toArray(request()),
        );
    }
}
